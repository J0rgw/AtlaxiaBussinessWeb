import {
  Activity,
  ArrowUpRight,
  AudioWaveform,
  Diff,
  History,
  LayoutDashboard,
  MessageSquareText,
  MonitorCog,
  Server,
  Spline,
  Thermometer,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { LayerStack, type StackLayer } from "@/components/storytelling/LayerStack";
import type { Dictionary } from "@/content";
import { company } from "@/content/shared/company";
import { otherLocaleValues } from "@/i18n/alternatives";
import type { Locale } from "@/i18n/config";
import { PendingTag } from "@/shell/PendingTag";
import styles from "./Building.module.css";

type BuildingContent = Dictionary["building"];
type Layers = BuildingContent["layers"];
type LayerId = keyof Layers;

// Top to bottom, as the stack reads: from the operator down to the plant.
const layerOrder: LayerId[] = ["interface", "detection", "model", "plant"];

const icons: { [L in LayerId]: Record<keyof Layers[L]["items"], LucideIcon> } = {
  interface: { panel: LayoutDashboard, events: History, explanation: MessageSquareText },
  detection: { observed: Activity, expected: Spline, deviation: Diff },
  model: { graph: Waypoints, behavior: AudioWaveform },
  plant: { sensors: Thermometer, scada: MonitorCog, local: Server },
};

type CapabilityId = keyof BuildingContent["product"]["capabilities"];
const capabilityOrder: CapabilityId[] = [
  "monitor",
  "understand",
  "relate",
  "investigate",
  "deploy",
];

type BuildingProps = {
  locale: Locale;
  eyebrow: string;
  content: BuildingContent;
};

/**
 * The current product, presented as the layers it is made of (Radiant pattern):
 * from the operator interface down to the plant, with the product as the column
 * that runs through all of them.
 */
export function Building({ locale, eyebrow, content }: BuildingProps) {
  const { product } = content;

  const layers: StackLayer[] = layerOrder.map((id, position) => {
    const layer = content.layers[id];
    const layerIcons = icons[id] as Record<string, LucideIcon>;
    return {
      id,
      index: String(layerOrder.length - position).padStart(2, "0"),
      title: layer.title,
      tagline: layer.tagline,
      description: <p>{layer.description}</p>,
      items: Object.entries(layer.items).map(([itemId, item]) => {
        const Icon = layerIcons[itemId];
        return { id: itemId, icon: Icon ? <Icon /> : undefined, label: item.label, sub: item.sub };
      }),
    };
  });

  const aside = (
    <div className={styles.product}>
      <p className={styles.eyebrow}>{product.eyebrow}</p>
      <div className={styles.nameRow}>
        <p className={styles.name}>{company.product.name}</p>
        {company.product.nameIsPlaceholder ? (
          <PendingTag
            label={product.namePending}
            alternatives={otherLocaleValues(locale, (d) => d.building.product.namePending)}
          />
        ) : null}
      </div>
      <p className={styles.description}>{product.description}</p>

      <div className={styles.capabilities}>
        <p className={styles.capabilitiesLabel}>{product.capabilitiesLabel}</p>
        <ol role="list" className={styles.capabilityList}>
          {capabilityOrder.map((id, i) => (
            <li key={id}>
              <span className={styles.capabilityIndex} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              {product.capabilities[id]}
            </li>
          ))}
        </ol>
      </div>

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
  );

  return (
    <Section id="building" labelledBy="building-title" tone="dark">
      <Container>
        <div className={styles.layout}>
          <SectionHeader
            eyebrow={eyebrow}
            titleId="building-title"
            title={content.title}
            lead={content.lead}
          />
          <LayerStack layers={layers} label={content.stackLabel} aside={aside} />
        </div>
      </Container>
    </Section>
  );
}
