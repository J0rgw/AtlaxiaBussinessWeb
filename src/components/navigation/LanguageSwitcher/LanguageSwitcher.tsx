"use client";

import { Globe } from "lucide-react";
import type { MouseEvent } from "react";
import { StableLabel } from "@/components/primitives/StableLabel";
import { cx } from "@/lib/cx";
import styles from "./LanguageSwitcher.module.css";

export type LanguageOption = {
  /** Language code, also used as the `lang` / `hreflang` value. */
  code: string;
  /** Short visible label, e.g. "EN". */
  label: string;
  /** Native name, e.g. "English". Read by screen readers after the label. */
  name: string;
  /** URL of the current page in that language. */
  href: string;
};

export type LanguageSwitcherProps = {
  options: LanguageOption[];
  current: string;
  /** Accessible name of the control, e.g. "Idioma". */
  label: string;
  /** Keep the #fragment when switching, so the reader stays in the same section. */
  preserveHash?: boolean;
  /** If set, the chosen code is stored in localStorage under this key. */
  persistKey?: string;
  className?: string;
};

function isPlainLeftClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/**
 * Links to the same page in other languages. Plain links, so it works without
 * JavaScript and can be crawled; script only adds hash preservation and persistence.
 */
export function LanguageSwitcher({
  options,
  current,
  label,
  preserveHash = true,
  persistKey,
  className,
}: LanguageSwitcherProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>, option: LanguageOption) {
    if (persistKey) {
      try {
        window.localStorage.setItem(persistKey, option.code);
      } catch {
        // Storage can be unavailable (private mode, blocked cookies). Navigation still works.
      }
    }

    if (option.code === current) {
      event.preventDefault();
      return;
    }

    if (preserveHash && window.location.hash && isPlainLeftClick(event)) {
      event.preventDefault();
      // Full navigation on purpose: each language has its own root document,
      // and this component must not depend on a framework router.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`${option.href}${window.location.hash}`);
    }
  }

  // Narrow screens swap the ES / EN track for one globe that jumps to the next language.
  const currentIndex = options.findIndex((option) => option.code === current);
  const next = options[(currentIndex + 1) % options.length];

  return (
    <nav aria-label={label} className={cx(styles.switcher, className)}>
      {next && next.code !== current ? (
        <a
          href={next.href}
          hrefLang={next.code}
          lang={next.code}
          className={styles.globe}
          onClick={(event) => handleClick(event, next)}
        >
          <Globe aria-hidden="true" className={styles.globeIcon} />
          <span className={styles.visuallyHidden}>
            {label}: {next.name}
          </span>
        </a>
      ) : null}
      <ul role="list" className={styles.list}>
        {options.map((option) => {
          const isCurrent = option.code === current;
          return (
            <li key={option.code} className={styles.item}>
              <a
                href={option.href}
                hrefLang={option.code}
                lang={option.code}
                aria-current={isCurrent ? "true" : undefined}
                className={cx(styles.link, isCurrent && styles.current)}
                onClick={(event) => handleClick(event, option)}
              >
                <span aria-hidden="true">
                  <StableLabel reserveBold>{option.label}</StableLabel>
                </span>
                <span className={styles.visuallyHidden}>
                  {option.label} {option.name}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
