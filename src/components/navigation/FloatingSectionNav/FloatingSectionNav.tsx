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

/** Longest a clicked section holds the indicator if the scroll never reaches it (anchor glides last up to 1.2 s). */
const INTENT_TIMEOUT_MS = 2000;

/** Keys that scroll the page: pressing one means the reader took over. */
const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

/**
 * Layout width of the indicator. Its real width goes in a scaleX, so sliding
 * from one link to another animates transform only and stays on the compositor
 * while heavy scenes keep the main thread busy.
 */
const THUMB_BASE_WIDTH = 100;

/**
 * Section navigation for long single pages: one floating bar at every width.
 * Sections are plain links; a single accent underline slides to the section
 * being read (straight to a clicked one while the page scrolls there), and
 * slides out past the track edge when none is active.
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
  const uncontrolled = controlledActiveId === undefined;
  const trackedId = useActiveSection(uncontrolled ? ids : NO_IDS);
  const intendedId = useIntendedSection(uncontrolled ? ids : NO_IDS, trackedId);
  const activeId = uncontrolled ? (intendedId ?? trackedId) : controlledActiveId;

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

/**
 * The section a same-page link asked for (in the bar or anywhere in the page),
 * until the scroll gets there. Meanwhile the indicator goes straight to it
 * instead of visiting every section the glide passes, or the one a long jump
 * cuts to. Released when the section is reached, when the reader scrolls on
 * their own, or after INTENT_TIMEOUT_MS.
 */
function useIntendedSection(ids: readonly string[], trackedId: string | null) {
  const [intendedId, setIntendedId] = useState<string | null>(null);
  const key = ids.join("|");

  // Arrived: tracking takes over again.
  if (intendedId !== null && trackedId === intendedId) setIntendedId(null);

  useEffect(() => {
    if (!key) return;
    const sectionIds = new Set(key.split("|"));
    function onClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const link = (event.target as Element | null)?.closest?.("a[href^='#']");
      if (!(link instanceof HTMLAnchorElement)) return;
      const id = decodeURIComponent(link.hash.slice(1));
      if (sectionIds.has(id)) setIntendedId(id);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [key]);

  useEffect(() => {
    if (intendedId === null) return;
    const release = () => setIntendedId(null);
    const onKeyDown = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) release();
    };
    const timer = window.setTimeout(release, INTENT_TIMEOUT_MS);
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchmove", release, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchmove", release);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [intendedId]);

  return intendedId;
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
          width: THUMB_BASE_WIDTH,
          transform: `translateX(${thumb?.x ?? 0}px) scaleX(${(thumb?.width ?? 0) / THUMB_BASE_WIDTH})`,
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
