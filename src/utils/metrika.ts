export const METRIKA_COUNTER_ID = 113958488;

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

export const metrikaHit = (path: string): void => {
  window.ym?.(METRIKA_COUNTER_ID, "hit", path);
};

export const metrikaReachGoal = (goal: string): void => {
  window.ym?.(METRIKA_COUNTER_ID, "reachGoal", goal);
};
