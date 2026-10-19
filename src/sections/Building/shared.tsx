import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { ProcessFlowReveal } from "@/components/storytelling/ProcessFlow";
import type { Dictionary } from "@/content";
import { company } from "@/content/shared/company";
import { mailto } from "@/lib/mailto";
import { TAGS } from "../Capabilities/illustration";
import styles from "./shared.module.css";

type BuildingContent = Dictionary["building"];

/** The illustration Qué hacemos draws: the tank level, the pumping and the plant, highest first. */
const exampleRows = [
  { id: "sensor", level: 4, tag: TAGS.level },
  { id: "process", level: 3 },
  { id: "plant", level: 2 },
] as const;

/**
 * The product today, told for the person who runs the plant (owner, 2026-10-19):
 * the hook, an example that proves it, what it does in firm verbs, why to trust it
 * and the way in. The capabilities as "35 · Producto" lists them stay folded below.
 */
export function ProductToday({ content }: { content: BuildingContent }) {
  const { product } = content;
  const { example } = product;
  return (
    <div className={styles.product}>
      <div className={styles.productTop}>
        <div className={styles.productText}>
          <p className={styles.eyebrow}>{product.eyebrow}</p>
          <h3 className={styles.productTitle}>{product.title}</h3>
          <p className={styles.productBody}>{product.hook}</p>
          <p className={styles.productBody}>
            {product.analogy.text} <strong>{product.analogy.emphasis}</strong>
          </p>
        </div>
        <figure className={styles.example}>
          <div className={styles.exampleBar}>
            <span>
              {example.title}, {example.note}
            </span>
            <span>{example.scale}</span>
          </div>
          <table className={styles.exampleTable}>
            <thead>
              <tr>
                <th scope="col">{example.columns.signal}</th>
                <th scope="col">{example.columns.alarm}</th>
                <th scope="col">{example.columns.level}</th>
              </tr>
            </thead>
            <tbody>
              {exampleRows.map((row, index) => {
                const item = example.rows[row.id];
                return (
                  <tr key={row.id} data-first={index === 0 ? "" : undefined}>
                    <th scope="row">
                      {item.name}
                      <small>{"tag" in row ? `${row.tag}, ${item.kind}` : item.kind}</small>
                    </th>
                    <td className={styles.calm}>{item.alarm}</td>
                    <td>
                      <span className={styles.scale} aria-hidden="true">
                        {[1, 2, 3, 4, 5].map((step) => (
                          <i key={step} data-on={step <= row.level ? "" : undefined} />
                        ))}
                        <b>{row.level}</b>
                      </span>
                      <span className="visually-hidden">
                        {example.levelLabel.replace("{n}", String(row.level))}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <figcaption className={styles.exampleCaption}>
            <strong>{example.caption.lead}</strong> {example.caption.text}
          </figcaption>
        </figure>
      </div>

      <p className={styles.does}>
        {product.does.text} <span>{product.does.then}</span>
      </p>

      <ul role="list" className={styles.trust}>
        {(["readOnly", "local", "learns"] as const).map((id) => (
          <li key={id}>
            <strong>{product.trust[id].title}</strong>
            <span>{product.trust[id].text}</span>
          </li>
        ))}
      </ul>

      <div className={styles.close}>
        <p className={styles.closeText}>{product.close}</p>
        <div className={styles.ctas}>
          <Button href={mailto(product.trialCta)} endIcon={<ArrowRight />}>
            {product.trialCta}
          </Button>
          <Button
            href={company.demoUrl}
            target="_blank"
            rel="noopener"
            variant="secondary"
            endIcon={<ArrowUpRight />}
          >
            {product.demoCta}
          </Button>
        </div>
      </div>

      <details className={styles.spec}>
        <summary>{product.specLabel}</summary>
        <ul role="list">
          {product.spec.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>{product.demoNote}</p>
      </details>
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
