export type ThumbRect = { x: number; width: number };

export type ThumbState = ThumbRect & {
  /** Side where the indicator is parked when no section is active. */
  parked: "left" | "right" | null;
};

type NextThumbInput = {
  /** Geometry of the active link, or null when no section is active. */
  target: ThumbRect | null;
  previous: ThumbState | null;
  /** Index of the last item that was active, null if none has been yet. */
  lastActiveIndex: number | null;
  itemCount: number;
  /** Inner width of the track; parking right means sitting just past it. */
  trackWidth: number;
  /** Width to use when parking before anything has been measured. */
  fallbackWidth: number;
};

/**
 * Where the active-section indicator goes next.
 * With a target it sits on it. Without one it slides out past the track edge on
 * the side the reader is heading to: right after the last items (towards the
 * contact call to action), left before the first (back to the hero). Keeping its
 * width, it re-enters from that same side.
 */
export function nextThumb({
  target,
  previous,
  lastActiveIndex,
  itemCount,
  trackWidth,
  fallbackWidth,
}: NextThumbInput): ThumbState {
  if (target) return { ...target, parked: null };

  const side = lastActiveIndex !== null && lastActiveIndex >= itemCount / 2 ? "right" : "left";
  const width = previous?.width ?? fallbackWidth;
  return { x: side === "right" ? trackWidth : -width, width, parked: side };
}
