import type { SVGProps } from "react";

/*
  ATLAXIA brand marks, inlined from src/assets/brand/svg (source of truth).
  Inline so they inherit currentColor (light and dark surfaces) and cost no request.
  Decorative by default: the surrounding link or heading carries the accessible name.
*/

type MarkProps = Omit<SVGProps<SVGSVGElement>, "viewBox"> & {
  /** Accessible name. When omitted the mark is hidden from assistive technology. */
  title?: string;
};

function a11yProps(title?: string) {
  return title
    ? ({ role: "img", "aria-label": title } as const)
    : ({ "aria-hidden": true, focusable: false } as const);
}

/** Symbol outline in its 1298 x 1113 space; also drawn as a blueprint in the hero. */
export const SYMBOL_PATH =
  "M 1273 1063 L 940 504 L 668 33 L 651 24 L 639 28 L 309 587 L 24 1061 L 24 1078 L 33 1088 L 447 1087 L 405 1031 L 386 992 L 377 960 L 370 894 L 383 816 L 408 764 L 549 545 L 648 378 L 747 541 L 894 768 L 920 831 L 928 882 L 927 933 L 920 969 L 898 1024 L 852 1086 L 1259 1088 L 1271 1079 Z";

const WORDMARK_PATHS = [
  "M 1222 24 L 1228 37 L 1308 128 L 1219 229 L 1220 234 L 1272 234 L 1336 160 L 1401 234 L 1454 233 L 1366 129 L 1449 33 L 1451 24 L 1400 25 L 1338 96 L 1274 24 Z",
  "M 126 26 L 24 233 L 72 233 L 149 78 L 223 233 L 269 235 L 271 228 L 169 25 Z",
  "M 1797 24 L 1694 233 L 1736 235 L 1742 231 L 1816 78 L 1889 229 L 1895 235 L 1937 234 L 1933 218 L 1839 27 Z",
  "M 990 24 L 910 178 L 886 233 L 932 233 L 1009 77 L 1083 231 L 1088 235 L 1129 235 L 1130 227 L 1028 24 Z",
  "M 322 24 L 317 30 L 320 64 L 399 64 L 400 233 L 440 235 L 444 230 L 444 66 L 522 63 L 525 27 Z",
  "M 631 25 L 628 231 L 632 235 L 800 235 L 800 195 L 673 193 L 673 27 Z",
  "M 1561 24 L 1557 30 L 1557 231 L 1561 235 L 1599 235 L 1601 26 Z",
];

/** The triangle symbol. Aspect ratio 1298:1113. */
export function AtlaxiaSymbol({ title, ...props }: MarkProps) {
  return (
    <svg viewBox="0 0 1298 1113" fill="currentColor" {...a11yProps(title)} {...props}>
      <path d={SYMBOL_PATH} />
    </svg>
  );
}

/** The ATLAXIA lettering. Cropped to the letters, aspect ratio 1914:212. */
export function AtlaxiaWordmark({ title, ...props }: MarkProps) {
  return (
    <svg viewBox="24 24 1914 212" fill="currentColor" {...a11yProps(title)} {...props}>
      {WORDMARK_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
