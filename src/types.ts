/** GrateTogether dual-mode cheese grater workstation */

export type GraterMode = 'safe' | 'pro';

export interface PrototypeState {
  mode: GraterMode;
  isAnimating: boolean;
  binInserted: boolean;
  shutterOpen: boolean;
  pusherEnabled: boolean;
  /** 0 = top, 1 = bottom of travel */
  pusherPosition: number;
  /** 0 = not started, 1 = complete */
  cheeseProgress: number;
  showCheeseOutput: boolean;
}

export const INITIAL_STATE: PrototypeState = {
  mode: 'safe',
  isAnimating: false,
  binInserted: true,
  shutterOpen: false,
  pusherEnabled: true,
  pusherPosition: 0,
  cheeseProgress: 0,
  showCheeseOutput: false,
};

/** Visual accent colours per mode */
export const MODE_ACCENT: Record<GraterMode, string> = {
  safe: '#34c759',   // green
  pro: '#d63031',    // dark red
};

/** Cheese appearance constants */
export const CHEESE_COLOR = '#f5d060';
export const GRATED_COLOR = '#ffe07a';
