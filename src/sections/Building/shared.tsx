import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { ProcessFlowReveal } from "@/components/storytelling/ProcessFlow";
import type { Dictionary } from "@/content";
import { company } from "@/content/shared/company";
import { cx } from "@/lib/cx";
import styles from "./shared.module.css";

type BuildingContent = Dictionary["building"];

/** What runs at the plant today, after the model. */
export function ProductToday({ content }: { content: BuildingContent }) {
  const { product } = content;
  return (
    <div className={styles.product}>
      <div className={styles.productText}>
        <p className={styles.eyebrow}>{product.eyebrow}</p>
        <h3 className={styles.productTitle}>{product.title}</h3>
        <p className={styles.productBody}>{product.body}</p>
      </div>
      <div className={styles.available}>
        <p className={styles.eyebrow}>{product.availableLabel}</p>
        <ul role="list" className={styles.availableList}>
          {product.available.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className={cx(styles.eyebrow, styles.nextLabel)}>{product.nextLabel}</p>
        <ul role="list" className={cx(styles.availableList, styles.next)}>
          {product.next.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Button
          href={company.demoUrl}
          target="_blank"
          rel="noopener"
          variant="secondary"
          endIcon={<ArrowUpRight />}
          className={styles.demo}
        >
          {product.demoCta}
        </Button>
      </div>
    </div>
  );
}

const methodOrder = ["arrive", "connect", "adapt", "run"] as const;

/**
 * How the system comes into a plant and adapts to it, after what exists today.
 * The last two steps form a loop: working with the operators keeps tuning it.
 */
export function Method({ content }: { content: BuildingContent }) {
  const { method } = content;
  const steps = methodOrder.map((id) => ({ id, ...method.steps[id] }));
  return (
    <div className={styles.method}>
      <div className={styles.productText}>
        <p className={styles.eyebrow}>{method.eyebrow}</p>
        <h3 className={styles.productTitle}>{method.title}</h3>
        <p className={styles.productBody}>{method.body}</p>
      </div>
      <ProcessFlowReveal
        steps={steps}
        label={method.title}
        announceCurrent={false}
        loop={{ from: methodOrder.indexOf("adapt"), label: method.loop }}
      />
      <p className={styles.measure}>{method.measure}</p>
    </div>
  );
}
