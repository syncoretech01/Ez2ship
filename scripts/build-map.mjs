/**
 * Builds a run-length-encoded dot matrix of the world's land masses from
 * Natural Earth (world-atlas 50m). Used by the "Nationwide → Worldwide"
 * WebGL network, which morphs these dots from a flat map into a globe.
 *
 *   node scripts/build-map.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';

const require = createRequire(import.meta.url);
const topo = require('world-atlas/land-50m.json');
const land = feature(topo, topo.objects.land);
const countries = require('world-atlas/countries-50m.json');
const usa = feature(countries, countries.objects.countries).features.find((f) => f.id === '840');

const STEP = 0.75; // degrees
const MIN_LAT = -57; // drop Antarctica

// Flatten to polygons of rings with bounding boxes for fast planar tests.
const polys = [];
for (const f of land.features) {
  const g = f.geometry;
  const list = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  for (const rings of list) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [x, y] of rings[0]) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    // Rings that jump across the antimeridian break planar tests — use a spherical test instead.
    const wraps = rings[0].some(([x], i, r) => i > 0 && Math.abs(x - r[i - 1][0]) > 180);
    const geo = wraps ? { type: 'Polygon', coordinates: rings } : null;
    polys.push({ rings, geo, minX, minY, maxX, maxY });
  }
}

function inRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function isLand(x, y) {
  for (const p of polys) {
    if (p.geo) { if (y >= p.minY && y <= p.maxY && geoContains(p.geo, [x, y])) return true; continue; }
    if (x < p.minX || x > p.maxX || y < p.minY || y > p.maxY) continue;
    if (!inRing(x, y, p.rings[0])) continue;
    let hole = false;
    for (let k = 1; k < p.rings.length; k++) if (inRing(x, y, p.rings[k])) { hole = true; break; }
    if (!hole) return true;
  }
  return false;
}

const cols = Math.round(360 / STEP);
const rows = [];
const usRows = [];
let count = 0;
let usCount = 0;
for (let r = 0; r * STEP - 90 + STEP / 2 < 90; r++) {
  const lat = -90 + STEP / 2 + r * STEP;
  if (lat < MIN_LAT) continue;
  const runs = [];
  let start = -1;
  for (let c = 0; c <= cols; c++) {
    const lon = -180 + STEP / 2 + c * STEP;
    const on = c < cols && isLand(lon, lat);
    if (on) count++;
    if (on && start < 0) start = c;
    if (!on && start >= 0) { runs.push(start, c - 1); start = -1; }
  }
  if (runs.length) rows.push([r, runs]);

  // Dots that fall inside the United States (spherical test against the country polygon)
  const us = [];
  for (let i = 0; i < runs.length; i += 2) {
    for (let c = runs[i]; c <= runs[i + 1]; c++) {
      const lon = -180 + STEP / 2 + c * STEP;
      if (lon > -60 || lat < 15) continue;
      if (geoContains(usa, [lon, lat])) {
        us.push(c);
        usCount++;
      }
    }
  }
  if (us.length) usRows.push([r, us]);
}

const out = path.resolve('src/data/land-dots.json');
await fs.mkdir(path.dirname(out), { recursive: true });
await fs.writeFile(out, JSON.stringify({ step: STEP, rows, us: usRows }));
console.log(`${count} land dots (${usCount} in the US), ${rows.length} rows → ${out}`);
