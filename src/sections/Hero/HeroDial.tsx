"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { angleDelta, DIAL_RADIUS, dialTicks, HALF, VIEW } from "./geometry";
import styles from "./HeroBlueprint.module.css";

// Pointer influence: full on the ring, none this far from it (drawing units).
const REACH = 280;
// Inertia per frame (0 to 1): how fast the dark spot follows the pointer.
const FOLLOW = 0.14;
const SETTLE = 0.1;

const ticks = dialTicks();

const smoothstep = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

/**
 * Instrument dial of the hero drawing. With a mouse, the part of the dial
 * nearest to the pointer darkens and the dark zone follows it around with some
 * inertia (feedback). Nothing changes size or shape: two copies of the same
 * static dial, a light base and a dark one revealed only by a soft spot that
 * sits under the pointer. Only the spot moves, and only while it has to.
 */
export function HeroDial() {
  const groupRef = useRef<SVGGElement>(null);
  const spotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    const spot = spotRef.current;
    const svg = group?.ownerSVGElement;
    if (!group || !spot || !svg) return;
    if (
      prefersReducedMotion() ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    let pointer: { x: number; y: number } | null = null;
    let focus = 0;
    let strength = 0;
    let frame = 0;

    const target = () => {
      if (!pointer) return { angle: focus, strength: 0 };
      const rect = svg.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return { angle: focus, strength: 0 };
      const unit = rect.width / VIEW;
      const x = (pointer.x - (rect.left + rect.width / 2)) / unit;
      const y = (pointer.y - (rect.top + rect.height / 2)) / unit;
      const distance = Math.hypot(x, y);
      return {
        angle: Math.atan2(y, x),
        strength: 1 - smoothstep(Math.abs(distance - DIAL_RADIUS) / REACH),
      };
    };

    const render = () => {
      const r = DIAL_RADIUS + 20;
      spot.setAttribute("cx", (Math.cos(focus) * r).toFixed(1));
      spot.setAttribute("cy", (Math.sin(focus) * r).toFixed(1));
      spot.setAttribute("opacity", strength.toFixed(3));
    };

    const tick = () => {
      const next = target();
      // At rest and the pointer is elsewhere: nothing to draw.
      if (strength === 0 && next.strength === 0) {
        frame = 0;
        return;
      }
      // Entering from rest: start at the pointer instead of sweeping round.
      if (strength < 0.02) focus = next.angle;
      const turn = angleDelta(next.angle, focus);
      focus += turn * FOLLOW;
      const change = next.strength - strength;
      strength += change * (change > 0 ? FOLLOW : SETTLE);
      render();
      const moving = Math.abs(turn) > 0.0005 || Math.abs(change) > 0.002;
      frame = moving ? requestAnimationFrame(tick) : 0;
      if (!moving && next.strength === 0 && strength !== 0) {
        strength = 0;
        render();
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer = { x: event.clientX, y: event.clientY };
      schedule();
    };
    const onLeave = () => {
      pointer = null;
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", schedule);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <g ref={groupRef} className={styles.dial}>
      <defs>
        <radialGradient id="hero-dial-spot-fill">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask
          id="hero-dial-spot"
          maskUnits="userSpaceOnUse"
          x={-HALF}
          y={-HALF}
          width={VIEW}
          height={VIEW}
        >
          <circle ref={spotRef} r={240} fill="url(#hero-dial-spot-fill)" opacity={0} />
        </mask>
      </defs>

      {/* Base: light, drawn in on load */}
      <circle r={DIAL_RADIUS} pathLength={1} className={`${styles.ring} ${styles.draw}`} />
      <path d={ticks.minor} className={styles.ticks} />
      <path d={ticks.major} className={`${styles.ticks} ${styles.ticksMajor}`} />

      {/* Focus: the same geometry, dark, visible only under the pointer spot */}
      <g mask="url(#hero-dial-spot)" className={styles.dialFocus}>
        <circle r={DIAL_RADIUS} className={styles.ring} />
        <path d={ticks.minor} className={styles.ticks} />
        <path d={ticks.major} className={`${styles.ticks} ${styles.ticksMajor}`} />
      </g>
    </g>
  );
}
