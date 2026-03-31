/**
 * usePrototypeState — central state & animation driver for the
 * GrateTogether dual-mode cheese grater demo.
 *
 * Manages mode switching (safe ↔ pro), shutter open/close,
 * pusher position, cheese progress, particle output,
 * exploded view, and internal path visibility.
 */
import { useState, useCallback, useRef, useEffect } from "react";
import type { GraterMode, GraterStyle, PrototypeState } from "../types";
import { INITIAL_STATE } from "../types";

/** Fraction of safe-path travel advanced by each push cycle */
const SAFE_ADVANCE_PER_PUSH = 0.32;
/** Maximum safe-mode travel to preserve the safety stub */
const SAFE_MAX_TRAVEL = 0.9;

export function usePrototypeState() {
  const [state, setState] = useState<PrototypeState>(INITIAL_STATE);
  const animFrameRef = useRef<number>(0);
  const safeStartProgressRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  /* ── Mode switch ─────────────────────────────────── */
  const setMode = useCallback((mode: GraterMode) => {
    // Cancel any running animation first
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    setState((prev) => ({
      ...prev,
      mode,
      isAnimating: false,
      shutterOpen: mode === "pro",
      pusherEnabled: mode === "safe",
      binInserted: true,
      pusherPosition: 0,
      cheeseProgress: 0,
      showCheeseOutput: false,
    }));
  }, []);

  /* ── Easing helpers ───────────────────────────────── */
  /** Ease-in (slow start, accelerating — simulates resistance) */
  const easeIn = (t: number) => t * t;
  /** Ease-out (fast start, decelerating — snaps back) */
  const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

  /* ── Activate demo ───────────────────────────────── */
  const activate = useCallback(() => {
    // Prevent overlapping demos
    if (isRunningRef.current) return;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }

    isRunningRef.current = true;
    const modeRef = { current: state.mode };
    setState((prev) => {
      modeRef.current = prev.mode;
      safeStartProgressRef.current = 0;
      return {
        ...prev,
        isAnimating: true,
        demoStatus: "running" as const,
        cheeseProgress: 0,
        showCheeseOutput: false,
        pusherPosition: 0,
        followerPlatePosition: 0,
        followerSpringCompressed: false,
        gratingCycle: 0,
        isResettingCheese: false,
        cheesePileLevel: 0,
      };
    });

    /* ── Shared cycle config ──────────────────────── */
    const CYCLE_DURATION = 1.2;   // seconds for downstroke
    const RESET_DURATION = 0.5;   // seconds for retract
    const PAUSE_DURATION = 0.3;   // pause between strokes
    const FULL_CYCLE = CYCLE_DURATION + RESET_DURATION + PAUSE_DURATION;

    let lastTimestamp = performance.now();
    let elapsedTotal = 0;
    let pileLevel = 0;

    if (modeRef.current === "pro") {
      /* ── PRO MODE: 4 stroke cycles, cheese presses from front ── */
      const PRO_STROKES = 4;

      function tickPro() {
        const now = performance.now();
        const delta = (now - lastTimestamp) / 1000;
        lastTimestamp = now;
        elapsedTotal += delta;

        const cycle = Math.floor(elapsedTotal / FULL_CYCLE);
        const cycleElapsed = elapsedTotal % FULL_CYCLE;

        // All strokes done
        if (cycle >= PRO_STROKES) {
          isRunningRef.current = false;
          animFrameRef.current = 0;
          setState((prev) => ({
            ...prev,
            isAnimating: false,
            demoStatus: "complete" as const,
            pusherPosition: 0,
            cheeseProgress: 0,
            showCheeseOutput: false,
            cheesePileLevel: Math.min(pileLevel, 1),
          }));
          setTimeout(() => {
            setState((prev) =>
              prev.demoStatus === "complete"
                ? { ...prev, demoStatus: "idle" as const }
                : prev,
            );
          }, 2000);
          return;
        }

        let pusherPos = 0;
        let cheeseProgress = 0;
        let showCheeseOutput = false;

        if (cycleElapsed < CYCLE_DURATION) {
          // Downstroke with ease-in (building pressure)
          const tRaw = cycleElapsed / CYCLE_DURATION;
          const t = easeIn(tRaw);
          pusherPos = t;
          cheeseProgress = t * 0.85; // cheese approaches plate
          showCheeseOutput = tRaw > 0.35;
          if (showCheeseOutput) pileLevel += delta * 0.12;
        } else if (cycleElapsed < CYCLE_DURATION + RESET_DURATION) {
          // Retract with ease-out (snap back)
          const tRaw =
            (cycleElapsed - CYCLE_DURATION) / RESET_DURATION;
          const t = easeOut(tRaw);
          pusherPos = 1 - t;
          cheeseProgress = (1 - t) * 0.85;
          showCheeseOutput = false;
        } else {
          // Pause — everything at rest
          pusherPos = 0;
          cheeseProgress = 0;
          showCheeseOutput = false;
        }

        setState((prev) => ({
          ...prev,
          pusherPosition: pusherPos,
          cheeseProgress,
          showCheeseOutput,
          gratingCycle: cycle,
          cheesePileLevel: Math.min(pileLevel, 1),
        }));

        animFrameRef.current = requestAnimationFrame(tickPro);
      }

      animFrameRef.current = requestAnimationFrame(tickPro);
    } else {
      /* ── SAFE MODE: existing repeated grating cycle with easing ── */
      const ADVANCE_PER_CYCLE = SAFE_ADVANCE_PER_PUSH;
      const MAX_TRAVEL = SAFE_MAX_TRAVEL;

      function tickSafe() {
        const now = performance.now();
        const delta = (now - lastTimestamp) / 1000;
        lastTimestamp = now;
        elapsedTotal += delta;

        const cycleElapsed =
          elapsedTotal % (CYCLE_DURATION + RESET_DURATION);
        const cycle = Math.floor(
          elapsedTotal / (CYCLE_DURATION + RESET_DURATION),
        );

        let cheeseStart =
          safeStartProgressRef.current + cycle * ADVANCE_PER_CYCLE;
        let cheeseProgress = Math.min(cheeseStart, MAX_TRAVEL);

        // All travel consumed
        if (cheeseProgress >= MAX_TRAVEL - 0.001) {
          isRunningRef.current = false;
          animFrameRef.current = 0;
          setState((prev) => ({
            ...prev,
            cheeseProgress,
            followerPlatePosition: 0,
            followerSpringCompressed: false,
            isResettingCheese: false,
            gratingCycle: cycle,
            showCheeseOutput: false,
            isAnimating: false,
            demoStatus: "complete" as const,
            cheesePileLevel: Math.min(pileLevel, 1),
          }));
          setTimeout(() => {
            setState((prev) =>
              prev.demoStatus === "complete"
                ? { ...prev, demoStatus: "idle" as const }
                : prev,
            );
          }, 2000);
          return;
        }

        let pusherPos = 0;
        let followerPlatePosition = 0;
        let followerSpringCompressed = false;
        let isResettingCheese = false;
        let showCheeseOutput = false;

        if (cycleElapsed < CYCLE_DURATION) {
          // Downstroke with ease-in
          const tRaw = cycleElapsed / CYCLE_DURATION;
          const t = easeIn(tRaw);
          followerPlatePosition = t;
          followerSpringCompressed = tRaw > 0.85;
          isResettingCheese = false;
          cheeseProgress = Math.min(
            cheeseStart + t * ADVANCE_PER_CYCLE,
            MAX_TRAVEL,
          );
          showCheeseOutput = tRaw > 0.5 && cheeseProgress > 0.3;
          if (showCheeseOutput) pileLevel += delta * 0.12;
          pusherPos = t;
        } else {
          // Spring reset with ease-out (snap back)
          const tRaw =
            (cycleElapsed - CYCLE_DURATION) / RESET_DURATION;
          const t = easeOut(tRaw);
          followerPlatePosition = 1 - t;
          followerSpringCompressed = false;
          isResettingCheese = true;
          showCheeseOutput = false;
          cheeseProgress = Math.min(
            cheeseStart + (1 - t) * ADVANCE_PER_CYCLE,
            MAX_TRAVEL,
          );
          pusherPos = 1 - t;
        }

        setState((prev) => ({
          ...prev,
          cheeseProgress,
          followerPlatePosition,
          followerSpringCompressed,
          isResettingCheese,
          gratingCycle: cycle,
          showCheeseOutput,
          isAnimating: true,
          pusherPosition: pusherPos,
          cheesePileLevel: Math.min(pileLevel, 1),
        }));

        animFrameRef.current = requestAnimationFrame(tickSafe);
      }

      animFrameRef.current = requestAnimationFrame(tickSafe);
    }
  }, []);

  /* ── Reset demo ──────────────────────────────────── */
  const reset = useCallback(() => {
    isRunningRef.current = false;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    setState((prev) => ({
      ...prev,
      isAnimating: false,
      pusherPosition: 0,
      cheeseProgress: 0,
      showCheeseOutput: false,
      followerPlatePosition: 0,
      followerSpringCompressed: false,
      gratingCycle: 0,
      isResettingCheese: false,
      demoStatus: "idle" as const,
      cheesePileLevel: 0,
    }));
  }, []);

  /* ── Toggle exploded view ────────────────────────── */
  const toggleExploded = useCallback(() => {
    setState((prev) => ({ ...prev, isExploded: !prev.isExploded }));
  }, []);

  /* ── Switch grater plate style ────────────────────── */
  const setGraterStyle = useCallback((style: GraterStyle) => {
    setState((prev) => ({ ...prev, graterStyle: style }));
  }, []);

  /* ── Toggle internal path indicators ─────────────── */
  const toggleInternalPath = useCallback(() => {
    setState((prev) => ({ ...prev, showInternalPath: !prev.showInternalPath }));
  }, []);

  /* Clean up on unmount */
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return {
    state,
    setMode,
    activate,
    reset,
    toggleExploded,
    toggleInternalPath,
    setGraterStyle,
  };
}
