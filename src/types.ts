/** GrateTogether dual-mode cheese grater workstation */

export type GraterMode = "safe" | "pro";

export type GraterStyle = "box" | "microplane" | "ribbon" | "drum" | "fine";

export const GRATER_STYLE_LABELS: Record<GraterStyle, string> = {
  box: "Box Grater",
  microplane: "Microplane / Zester",
  ribbon: "Ribbon / Slicer",
  drum: "Drum / Rotary",
  fine: "Fine Shred",
};

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
  /** Exploded / deconstructed view active */
  isExploded: boolean;
  /** Show internal cheese path indicators */
  showInternalPath: boolean;

  /** Follower plate position: 0 = top, 1 = bottom */
  followerPlatePosition: number;
  /** True if follower plate is compressing spring (downstroke) */
  followerSpringCompressed: boolean;
  /** Number of completed grating cycles (for repeated action) */
  gratingCycle: number;
  /** True if cheese is being reset to top by spring */
  isResettingCheese: boolean;
  /** Active grater plate style */
  graterStyle: GraterStyle;
  /** Demo status for banner display */
  demoStatus: "idle" | "running" | "complete";
  /** Accumulated cheese pile height (0–1) */
  cheesePileLevel: number;
}

export const INITIAL_STATE: PrototypeState = {
  mode: "safe",
  isAnimating: false,
  binInserted: true,
  shutterOpen: false,
  pusherEnabled: true,
  pusherPosition: 0,
  cheeseProgress: 0,
  showCheeseOutput: false,
  isExploded: false,
  showInternalPath: false,

  followerPlatePosition: 0,
  followerSpringCompressed: false,
  gratingCycle: 0,
  isResettingCheese: false,
  graterStyle: "box",
  demoStatus: "idle",
  cheesePileLevel: 0,
};

/** Visual accent colours per mode */
export const MODE_ACCENT: Record<GraterMode, string> = {
  safe: "#34c759", // green
  pro: "#d63031", // dark red
};

/** Cheese appearance constants */
export const CHEESE_COLOR = "#f5d060";
export const GRATED_COLOR = "#ffe07a";
