/**
 * Downloads the site's source photography, applies art-direction crops and
 * writes optimized WebP renditions plus a manifest with dimensions and tiny
 * blur placeholders.
 *
 *   node scripts/fetch-images.mjs
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve('public/images');
const MANIFEST = path.resolve('src/data/image-manifest.json');
const WIDTHS = [960, 1920];

/** name, source photo id, optional crop in fractions of the original {x,y,w,h} */
const IMAGES = [
  ['open-carrier', '1761993600321-757e086491c0'],
  // Cropped to the loaded vehicles only — the cab carries another carrier's markings.
  ['carrier-deck', '1761917904658-2a9ecb84a169', { x: 0.545, y: 0.2, w: 0.4, h: 0.5 }],
  ['enclosed-ferrari', '1784617450978-9c3996f72c6e'],
  ['ship-deck', '1522674149721-b0191358dc5c'],
  ['dock-sportscar', '1789691119830-47d33670df66'],
  ['container-yard', '1494412519320-aa613dfb7738'],
  ['container-grid', '1494412685616-a5d310fbb07d'],
  ['port-cranes', '1578575437130-527eed3abbec'],
  ['container-ship', '1605745341112-85968b19335b'],
  ['moto-studio', '1607091083645-31f4e28dc9af'],
  ['moto-sport', '1763244737839-220b4cd0259e'],
  ['moto-road', '1558981806-ec527fa84c39'],
  ['moto-ducati', '1568772585407-9361f9bf3a87'],
  ['lambo-rain', '1628519592419-bf288f08cef5'],
  ['ferrari-showroom', '1583121274602-3e2820c69888'],
  ['monaco-mclaren', '1617814086906-d847a8bc6fca'],
  ['porsche-snow', '1614162692292-7ac56d7f7f1e'],
  ['panamera-bw', '1503376780353-7e6692767b70'],
  ['ram-sunset', '1649793395985-967862a3b73f'],
  ['raptor-desert', '1686715018049-f73970aa97d3'],
  ['jeep', '1506015391300-4802dc74de2e'],
  ['suv-modern', '1694649686884-0d62d0dc47d1'],
  ['suv-road', '1653813893853-be3e6ecfe061'],
  ['dubai-sunset', '1607414851776-f2fcc379fb48'],
  ['dubai-interchange', '1512453979798-5ea266f8880c'],
  ['dubai-skyline', '1579525612525-053cd3e8cbd7'],
  ['dubai-future', '1546412414-8035e1776c9a'],
  ['sunny-isles-aerial', '1630612905242-8f1e6933cf3b'],
  ['sunny-isles-sunset', '1652225762185-56c10d2ee24b'],
  ['highway-cloverleaf', '1508916319692-80a99da75692'],
  ['highway-forest', '1532201633958-497feb474315'],
  ['highway-truck-aerial', '1708193203896-ba0630862bb6'],
  ['highway-semis', '1766785368863-f2188a8c8b32'],
  ['classic-300sl', '1474039369477-5e74ff1f0e57'],
  ['classic-muscle', '1555638654-31cc731ab9b8'],
  ['mclaren-white', '1542362567-b07e54358753'],
  ['amg-red', '1553440569-bcc63803a83d'],
  ['bmw-blue', '1502877338535-766e1452684a'],
  ['bugatti', '1544636331-e26879cd4d9b'],
  ['mustang-garage', '1533106418989-88406c7cc8ca'],
];

async function download(id, attempt = 1) {
  const url = `https://images.unsplash.com/photo-${id}?w=2600&q=88&fm=jpg`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
    if (!res.ok) throw new Error(`${id}: HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    if (attempt >= 5) throw err;
    await new Promise((r) => setTimeout(r, 1500 * attempt));
    return download(id, attempt + 1);
  }
}

async function processOne([name, id, crop]) {
  let img = sharp(await download(id)).rotate();
  const meta = await img.metadata();
  if (crop) {
    img = img.extract({
      left: Math.round(crop.x * meta.width),
      top: Math.round(crop.y * meta.height),
      width: Math.round(crop.w * meta.width),
      height: Math.round(crop.h * meta.height),
    });
  }
  const base = await img.toBuffer();
  const { width, height } = await sharp(base).metadata();
  for (const w of WIDTHS) {
    await sharp(base)
      .resize({ width: Math.min(w, width), withoutEnlargement: true })
      .webp({ quality: w > 1000 ? 74 : 72, effort: 5 })
      .toFile(path.join(OUT, `${name}-${w}.webp`));
  }
  const tiny = await sharp(base).resize(20).blur(1.2).webp({ quality: 40 }).toBuffer();
  return [name, { w: width, h: height, blur: `data:image/webp;base64,${tiny.toString('base64')}` }];
}

await fs.mkdir(OUT, { recursive: true });
const manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8').catch(() => '{}'));
const exists = (p) => fs.access(p).then(() => true, () => false);
const todo = [];
for (const entry of IMAGES) {
  const done = manifest[entry[0]] && (await exists(path.join(OUT, `${entry[0]}-1920.webp`)));
  if (!done) todo.push(entry);
}
for (let i = 0; i < todo.length; i += 3) {
  const batch = await Promise.all(todo.slice(i, i + 3).map(processOne));
  for (const [name, data] of batch) {
    manifest[name] = data;
    console.log('✓', name, `${data.w}×${data.h}`);
  }
  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
}
console.log(`\n${Object.keys(manifest).length} images → public/images`);
