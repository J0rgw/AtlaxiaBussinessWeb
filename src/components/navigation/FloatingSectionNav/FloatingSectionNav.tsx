"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { StableLabel } from "@/components/primitives/StableLabel";
import { cx } from "@/lib/cx";
import styles from "./FloatingSectionNav.module.css";
import { nextThumb, type ThumbState } from "./thumb";
import { useActiveSection } from "@/lib/hooks/useActiveSection";

export type SectionNavItem = {
  /** Id of the target section. */
  id: string;
  label: string;
  /** Other texts the label can take (translations): the bar keeps the widest size. */
  alternatives?: readonly string[];
  /** Shown instead of the label on narrow screens. Without it the label always shows. */
  icon?: ReactNode;
  /** Defaults to `#${id}`. */
  href?: string;
};

export type FloatingSectionNavProps = {
  items: SectionNavItem[];
  /** Accessible name of the navigation, e.g. "Navegación principal". */
  label: string;
  /** Logo or home link. Hidden first when space runs short. */
  brand?: ReactNode;
  /** Trailing controls: language switcher, call to action... */
  actions?: ReactNode;
  /**
   * Active section. Leave undefined to track it automatically while scrolling;
   * pass a value (or null) to control it.
   */
  activeId?: string | null;
  /** Where the floating bar sits. "top-frame" spans the whole width between the sheet frame edges, brand flush at the start. */
  placement?: "bottom" | "top" | "top-frame";
  className?: string;
};

const NO_IDS: string[] = [];

const placementClass = { bottom: "bottom", top: "top", "top-frame": "topFrame" } as const;

/**
 * Section navigation for long single pages: one floating bar at every width.
 * Sections are plain links; a single accent underline slides to the section
 * being read, and slides out past the track edge when none is active.
 * On narrow screens, items with an icon collapse to the icon.
 */
export function FloatingSectionNav({
  items,
  label,
  brand,
  actions,
  activeId: controlledActiveId,
  placement = "bottom",
  className,
}: FloatingSectionNavProps) {
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const trackedId = useActiveSection(controlledActiveId === undefined ? ids : NO_IDS);
  const activeId = controlledActiveId === undefined ? trackedId : controlledActiveId;

  const scrolled = useScrolled(placement === "top-frame");

  const isFrame = placement === "top-frame";

  const bar = (
    <nav
      aria-label={label}
      data-scrolled={scrolled || undefined}
      className={cx(styles.bar, styles[placementClass[placement]], className)}
    >
      {isFrame ? (
        <>
          <span className={styles.mark} data-corner="bl" aria-hidden="true" />
          <span className={styles.mark} data-corner="br" aria-hidden="true" />
        </>
      ) : null}
      {brand ? <div className={styles.brand}>{brand}</div> : null}
      <SectionTrack items={items} activeId={activeId} />
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </nav>
  );

  if (!isFrame) return bar;

  // Narrow screens: the bar becomes a dock at the bottom, within thumb reach,
  // and the brand stays alone in a strip at the top. Only one of the two brand
  // copies is displayed at a time (display: none leaves the accessibility tree).
  return (
    <>
      {brand ? (
        <div className={styles.dockBrand} data-scrolled={scrolled || undefined}>
          {brand}
        </div>
      ) : null}
      {bar}
    </>
  );
}

/** True once the page has moved off the top, so a pinned bar can draw its lower edge. */
function useScrolled(enabled: boolean) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const update = () => setScrolled(window.scrollY > 4);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [enabled]);

  return scrolled;
}

function SectionTrack({ items, activeId }: { items: SectionNavItem[]; activeId: string | null }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const lastActiveIndexRef = useRef<number | null>(null);
  const [thumb, setThumb] = useState<ThumbState | null>(null);
  // The first placement must not animate in from anywhere.
  const [animate, setAnimate] = useState(false);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const activeIndex = activeId ? items.findIndex((item) => item.id === activeId) : -1;
    if (activeIndex >= 0) lastActiveIndexRef.current = activeIndex;

    function measure() {
      if (!track) return;
      const links = Array.from(track.querySelectorAll<HTMLElement>("[data-section]"));
      const link = activeIndex >= 0 ? links[activeIndex] : undefined;
      setThumb((previous) => {
        const next = nextThumb({
          target: link ? { x: link.offsetLeft, width: link.offsetWidth } : null,
          previous,
          lastActiveIndex: lastActiveIndexRef.current,
          itemCount: items.length,
          trackWidth: track.clientWidth,
          fallbackWidth: links[0]?.offsetWidth ?? 0,
        });
        const same =
          previous &&
          previous.x === next.x &&
          previous.width === next.width &&
          previous.parked === next.parked;
        return same ? previous : next;
      });
    }

    measure();
    if (typeof ResizeObserver === "undefined") return;
    // Widths change when fonts load or the viewport crosses the icon breakpoint.
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [activeId, items]);

  useEffect(() => {
    if (thumb && !animate) {
      const frame = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(frame);
    }
  }, [thumb, animate]);

  return (
    <div ref={trackRef} className={styles.track}>
      <span
        aria-hidden="true"
        data-parked={thumb?.parked ?? undefined}
        className={cx(styles.thumb, animate && styles.thumbAnimated)}
        style={{
          width: thumb?.width ?? 0,
          transform: `translateX(${thumb?.x ?? 0}px)`,
          opacity: thumb ? 1 : 0,
        }}
      />
      <ul role="list" className={styles.list}>
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id} className={styles.item}>
              <a
                href={item.href ?? `#${item.id}`}
                data-section={item.id}
                aria-current={isActive ? "location" : undefined}
                className={cx(
                  styles.link,
                  item.icon ? styles.linkWithIcon : undefined,
                  isActive && styles.linkActive,
                )}
              >
                {item.icon ? (
                  <span className={styles.icon} aria-hidden="true">
                    {item.icon}
                  </span>
                ) : null}
                <StableLabel className={styles.label} alternatives={item.alternatives} reserveBold>
                  {item.label}
                </StableLabel>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
