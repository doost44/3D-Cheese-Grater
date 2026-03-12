/**
 * usePrototypeState — central state & animation driver for the
 * GrateTogether dual-mode cheese grater demo.
 *
 * Manages mode switching (safe ↔ pro), shutter open/close,
 * pusher position, cheese progress, and particle output.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import type { GraterMode, PrototypeState } from '../types';
import { INITIAL_STATE } from '../types';

/** Duration of the cheese-grating demonstration in ms */
const DEMO_DURATION = 4000;

export function usePrototypeState() {
  const [state, setState] = useState<PrototypeState>(INITIAL_STATE);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

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
      shutterOpen: mode === 'pro',
      pusherEnabled: mode === 'safe',
      binInserted: true,
      pusherPosition: 0,
      cheeseProgress: 0,
      showCheeseOutput: false,
    }));
  }, []);

  /* ── Activate demo ───────────────────────────────── */
  const activate = useCallback(() => {
    setState((prev) => {
      if (prev.isAnimating) return prev;
      return {
        ...prev,
        isAnimating: true,
        cheeseProgress: 0,
        showCheeseOutput: false,
        pusherPosition: 0,
      };
    });

    startTimeRef.current = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const t = Math.min(elapsed / DEMO_DURATION, 1);

      setState((prev) => {
        if (!prev.isAnimating) return prev;

        const isSafe = prev.mode === 'safe';
        // In safe mode the cheese stops at ~85% travel (safe stub)
        const maxTravel = isSafe ? 0.85 : 1.0;
        const progress = Math.min(t, maxTravel);

        return {
          ...prev,
          cheeseProgress: progress,
          pusherPosition: isSafe ? progress : 0,
          showCheeseOutput: progress > 0.08,
          isAnimating: t < 1,
        };
      });

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        animFrameRef.current = 0;
      }
    };

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
    }));
  }, []);

  /* Clean up on unmount */
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return { state, setMode, activate, reset };
}
