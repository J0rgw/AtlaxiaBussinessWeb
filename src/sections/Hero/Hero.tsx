import { ArrowRight } from "lucide-react";
import { Fragment } from "react";
import { Button } from "@/components/primitives/Button";
import { Container } from "@/components/primitives/Container";
import { StableLabel } from "@/components/primitives/StableLabel";
import type { Dictionary } from "@/content";
import { otherLocaleValues } from "@/i18n/alternatives";
import type { Locale } from "@/i18n/config";
import styles from "./Hero.module.css";
import { HeroBlueprint } from "./HeroBlueprint";

type HeroContent = Dictionary["hero"];

type HeroProps = {
  locale: Locale;
  content: HeroContent;
};

// The top corners belong to the pinned bar (SiteNav), so they stay while scrolling.
const corners = ["bl", "br"] as const;

/**
 * What ATLAXIA is, as a company (the product appears later in the page).
 * A framed sheet (Matta) with the mark constructed as a drawing in the center;
 * one-color headline at the bottom left, short lead and actions at the bottom
 * right (Cerebrium). Lines of the headline rise in on load (Radiant).
 */
export function Hero({ locale, content }: HeroProps) {
  const alt = (pick: (hero: HeroContent) => string) =>
    otherLocaleValues(locale, (dict) => pick(dict.hero));

  return (
    <section id="hero" aria-labelledby="hero-title" className={styles.hero}>
      <HeroBlueprint />
      {corners.map((corner) => (
        <span key={corner} className={styles.mark} data-corner={corner} aria-hidden="true" />
      ))}

      <Container className={styles.inner}>
        <div className={styles.bottom}>
          <h1 id="hero-title" className={styles.title}>
            {content.title.lines.map((line, index) => (
              <Fragment key={line}>
                {/* Spaces between block lines keep the accessible name readable */}
                {index > 0 ? " " : null}
                <span className={styles.line}>
                  <span
                    className={styles.lineInner}
                    style={{ animationDelay: `${150 + index * 90}ms` }}
                  >
                    {line}
                  </span>
                </span>
              </Fragment>
            ))}
          </h1>

          <div className={styles.copy}>
            <p className={styles.lead}>{content.lead}</p>
            <div className={styles.actions}>
              <Button href="#contact">
                <StableLabel alternatives={alt((h) => h.primaryCta)}>
                  {content.primaryCta}
                </StableLabel>
              </Button>
              <Button href="#building" variant="secondary" endIcon={<ArrowRight />}>
                <StableLabel alternatives={alt((h) => h.secondaryCta)}>
                  {content.secondaryCta}
                </StableLabel>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
