/**
 * usePrototypeState — central state & animation driver for the
 * GrateTogether dual-mode cheese grater demo.
 *
 * Manages mode switching (safe ↔ pro), shutter open/close,
 * pusher position, cheese progress, particle output,
 * exploded view, and internal path visibility.
 */
import { useState, useCallback, useRef, useEffect } from "react";
import type { GraterMode, PrototypeState } from "../types";
import { INITIAL_STATE } from "../types";

/** Duration of the cheese-grating demonstration in ms */
const DEMO_DURATION = 4000;
/** Fraction of safe-path travel advanced by each push cycle */
const SAFE_ADVANCE_PER_PUSH = 0.32;
/** Maximum safe-mode travel to preserve the safety stub */
const SAFE_MAX_TRAVEL = 0.9;

export function usePrototypeState() {
  const [state, setState] = useState<PrototypeState>(INITIAL_STATE);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const safeStartProgressRef = useRef<number>(0);

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

  /* ── Activate demo ───────────────────────────────── */
  const activate = useCallback(() => {
    let canStart = false;
    setState((prev) => {
      if (prev.isAnimating) return prev;
      canStart = true;
      safeStartProgressRef.current =
        prev.mode === "safe" ? prev.cheeseProgress : 0;
      return {
        ...prev,
        isAnimating: true,
        cheeseProgress: prev.mode === "safe" ? prev.cheeseProgress : 0,
        showCheeseOutput: false,
        pusherPosition: 0,
        followerPlatePosition: 0,
        followerSpringCompressed: false,
        gratingCycle: 0,
        isResettingCheese: false,
      };
    });

    if (!canStart) return;

    // --- New repeated grating cycle logic ---
    let cycle = 0;
    let cheeseProgress = safeStartProgressRef.current;
    let followerPlatePosition = 0;
    let followerSpringCompressed = false;
    let isResettingCheese = false;
    let showCheeseOutput = false;
    let animating = true;

    const CYCLE_DURATION = 1.2; // seconds per grate cycle
    const RESET_DURATION = 0.5; // seconds for spring reset
    const ADVANCE_PER_CYCLE = SAFE_ADVANCE_PER_PUSH;
    const MAX_TRAVEL = SAFE_MAX_TRAVEL;
    let lastTimestamp = performance.now();
    let elapsedTotal = 0;

    function tick() {
      const now = performance.now();
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;
      elapsedTotal += delta;

      // Each cycle: downstroke (compress spring, move cheese), then spring reset
      let cycleElapsed = elapsedTotal % (CYCLE_DURATION + RESET_DURATION);
      cycle = Math.floor(elapsedTotal / (CYCLE_DURATION + RESET_DURATION));

      // Compute cheese progress for this cycle
      let cheeseStart =
        safeStartProgressRef.current + cycle * ADVANCE_PER_CYCLE;
      cheeseProgress = Math.min(cheeseStart, MAX_TRAVEL);
      if (cheeseProgress >= MAX_TRAVEL - 0.001) {
        animating = false;
        followerPlatePosition = 0;
        followerSpringCompressed = false;
        isResettingCheese = false;
        showCheeseOutput = false;
        setState((prev) => ({
          ...prev,
          cheeseProgress,
          followerPlatePosition,
          followerSpringCompressed,
          isResettingCheese,
          gratingCycle: cycle,
          showCheeseOutput,
          isAnimating: false,
        }));
        animFrameRef.current = 0;
        return;
      }

      let pusherPos = 0;
      if (cycleElapsed < CYCLE_DURATION) {
        // Downstroke: follower plate and pusher move down, cheese advances
        const t = cycleElapsed / CYCLE_DURATION;
        followerPlatePosition = t;
        followerSpringCompressed = t > 0.85;
        isResettingCheese = false;
        // Cheese moves with follower plate during downstroke
        const cheeseT = t;
        cheeseProgress = Math.min(
          cheeseStart + cheeseT * ADVANCE_PER_CYCLE,
          MAX_TRAVEL,
        );
        showCheeseOutput = t > 0.6 && cheeseProgress > 0.52;
        // Pusher moves down in sync
        pusherPos = t;
      } else {
        // Spring reset: follower plate and cheese return to top, pusher returns up
        const t = (cycleElapsed - CYCLE_DURATION) / RESET_DURATION;
        followerPlatePosition = 1 - t;
        followerSpringCompressed = false;
        isResettingCheese = true;
        showCheeseOutput = false;
        // Cheese moves up with follower plate
        cheeseProgress = Math.min(
          cheeseStart + (1 - t) * ADVANCE_PER_CYCLE,
          MAX_TRAVEL,
        );
        // Pusher returns up
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
        isAnimating: animating,
        pusherPosition: pusherPos,
      }));

      if (animating) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        animFrameRef.current = 0;
      }
    }

    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  /* ── Reset demo ──────────────────────────────────── */
  const reset = useCallback(() => {
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
    }));
  }, []);

  /* ── Toggle exploded view ────────────────────────── */
  const toggleExploded = useCallback(() => {
    setState((prev) => ({ ...prev, isExploded: !prev.isExploded }));
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
  };
}
