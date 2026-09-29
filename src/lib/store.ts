import { useSyncExternalStore } from 'react';

interface AppState {
  /** True once the current page is visible (loader finished / transition revealing). */
  ready: boolean;
  /** True after the first-load loader has completed. */
  booted: boolean;
  menuOpen: boolean;
  transitioning: boolean;
  /** The home hero WebGL scene has rendered its first frames. */
  sceneReady: boolean;
}

let state: AppState = { ready: false, booted: false, menuOpen: false, transitioning: false, sceneReady: false };
const subs = new Set<() => void>();

export function setAppState(patch: Partial<AppState>) {
  state = { ...state, ...patch };
  subs.forEach((fn) => fn());
}

export function getAppState() {
  return state;
}

function subscribe(fn: () => void) {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

export function useAppState<K extends keyof AppState>(key: K): AppState[K] {
  return useSyncExternalStore(
    subscribe,
    () => state[key],
    () => state[key],
  );
}

/** Resolves when the page is revealed — used to start intro animations. */
export function whenReady(): Promise<void> {
  if (state.ready) return Promise.resolve();
  return new Promise((resolve) => {
    const off = subscribe(() => {
      if (state.ready) {
        off();
        resolve();
      }
    });
  });
}

/** Resolves once the hero scene has rendered, or after `maxMs` — whichever comes first. */
export function whenSceneReady(maxMs = 7000): Promise<void> {
  if (state.sceneReady) return Promise.resolve();
  return new Promise((resolve) => {
    const t = setTimeout(done, maxMs);
    const off = subscribe(() => state.sceneReady && done());
    function done() {
      clearTimeout(t);
      off();
      resolve();
    }
  });
}
