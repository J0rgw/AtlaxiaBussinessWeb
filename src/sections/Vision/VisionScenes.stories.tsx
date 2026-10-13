import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import { ScrubFigure } from "@/components/data-display/ScrubFigure";
import { ScrubLottie } from "@/components/data-display/ScrubLottie";
import { dictionaries } from "@/content";
import { SectorsScene } from "./SectorsScene";
import { WhereScene } from "./WhereScene";

/*
  The two scroll scenes proposed for the end of Vision. Scroll inside the
  canvas to play them. The storyboard shows the key frames side by side.
  Each scene can play the Lottie sketches (the approved ones, on the home) or
  the isometric anatomy models of the same storyboards (scripts/anatomy).
*/

const meta = {
  title: "Sections/Vision scenes",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Some page before and after, so the scene pins and releases as it would on the home. */
function Page({ children }: { children: ReactNode }) {
  const hint = {
    display: "grid",
    placeItems: "center",
    height: "70svh",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-label)",
    letterSpacing: "var(--tracking-label)",
    textTransform: "uppercase",
    color: "var(--color-text-muted)",
  } as const;
  return (
    <>
      <div style={hint}>Scroll</div>
      {children}
      <div style={hint}>Fin de la escena</div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Storyboard
// ---------------------------------------------------------------------------

const whereFrames = [
  {
    progress: 0,
    title: "1. Señal",
    text: "Un sensor sobre una tubería. Su señal late y el caudal corre por dentro.",
  },
  {
    progress: 0.5,
    title: "2. Proceso: Hoy",
    text: "La cámara se aleja: depósito, bomba, válvula e intercambiador. Las señales se relacionan en cobalto.",
  },
  {
    progress: 0.76,
    title: "3. Planta: Siguiente",
    text: "El proceso es un bloque cobalto; la planta se dibuja en discontinuo alrededor.",
  },
  {
    progress: 1,
    title: "4. Sistemas: Objetivo",
    text: "Varias plantas unidas en red; las señales salen de la nuestra y la recorren.",
  },
];

const sectorFrames = [
  { id: "water", title: "Agua", text: "La red se dibuja desde el depósito y el agua la recorre." },
  { id: "food", title: "Agroalimentación", text: "Lo normal cambia en cada fase del lote." },
  { id: "metal", title: "Metalurgia", text: "La pieza sale del horno y se lamina en dos cajas." },
];

function Frame({
  src,
  progress,
  title,
  text,
}: {
  src: string;
  progress: number;
  title: string;
  text: string;
}) {
  return (
    <figure style={{ display: "grid", gap: "0.75rem", margin: 0 }}>
      <div
        style={{
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          background: "var(--color-bg)",
        }}
      >
        <ScrubLottie src={src} progress={progress} />
      </div>
      <figcaption style={{ display: "grid", gap: "0.25rem" }}>
        <strong style={{ fontWeight: 600 }}>{title}</strong>
        <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>{text}</span>
      </figcaption>
    </figure>
  );
}

const grid = {
  display: "grid",
  gap: "2rem",
  gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
} as const;

export const Storyboard: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "3rem", padding: "3rem var(--gutter)" }}>
      <section style={{ display: "grid", gap: "1.5rem" }}>
        <h2 style={{ fontSize: "var(--text-title)", fontWeight: 600 }}>
          A, Hacia dónde vamos: de una señal a una red de plantas
        </h2>
        <div style={grid}>
          {whereFrames.map((frame) => (
            <Frame key={frame.title} src="/animations/vision-where.json" {...frame} />
          ))}
        </div>
      </section>
      <section style={{ display: "grid", gap: "1.5rem" }}>
        <h2 style={{ fontSize: "var(--text-title)", fontWeight: 600 }}>
          B, Dónde empezamos: un dibujo por sector (fotograma final)
        </h2>
        <div style={grid}>
          {sectorFrames.map(({ id, ...frame }) => (
            <Frame key={id} src={`/animations/sector-${id}.json`} progress={1} {...frame} />
          ))}
        </div>
      </section>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

export const WhereEs: Story = {
  name: "A, Hacia dónde vamos (ES)",
  render: () => (
    <Page>
      <WhereScene content={dictionaries.es.vision.scenes.where} />
    </Page>
  ),
};

export const WhereEn: Story = {
  name: "A, Where we are going (EN)",
  render: () => (
    <Page>
      <WhereScene content={dictionaries.en.vision.scenes.where} />
    </Page>
  ),
};

export const WhereMobile: Story = {
  name: "A, Hacia dónde vamos (ES, narrow screen)",
  globals: { viewport: { value: "mobile2", isRotated: false } },
  render: () => (
    <Page>
      <WhereScene content={dictionaries.es.vision.scenes.where} />
    </Page>
  ),
};

export const SectorsEs: Story = {
  name: "B, Dónde empezamos (ES)",
  render: () => (
    <Page>
      <SectorsScene content={dictionaries.es.vision.scenes.sectors} />
    </Page>
  ),
};

export const SectorsEn: Story = {
  name: "B, Where we start (EN)",
  render: () => (
    <Page>
      <SectorsScene content={dictionaries.en.vision.scenes.sectors} />
    </Page>
  ),
};

export const SectorsMobile: Story = {
  name: "B, Dónde empezamos (ES, narrow screen)",
  globals: { viewport: { value: "mobile2", isRotated: false } },
  render: () => (
    <Page>
      <SectorsScene content={dictionaries.es.vision.scenes.sectors} />
    </Page>
  ),
};

export const Both: Story = {
  name: "A + B, one after the other (ES)",
  render: () => (
    <Page>
      <WhereScene content={dictionaries.es.vision.scenes.where} />
      <SectorsScene content={dictionaries.es.vision.scenes.sectors} />
    </Page>
  ),
};

// ---------------------------------------------------------------------------
// Anatomy: the same storyboards as isometric models (scripts/anatomy)
// ---------------------------------------------------------------------------

function AnatomyFrame({
  src,
  progress,
  aspect,
  title,
  text,
}: {
  src: string;
  progress: number;
  aspect: number;
  title: string;
  text: string;
}) {
  return (
    <figure style={{ display: "grid", gap: "0.75rem", margin: 0 }}>
      <div
        style={{
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          background: "var(--color-bg)",
          padding: "0.5rem",
        }}
      >
        <ScrubFigure src={src} progress={progress} aspect={aspect} />
      </div>
      <figcaption style={{ display: "grid", gap: "0.25rem" }}>
        <strong style={{ fontWeight: 600 }}>{title}</strong>
        <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>{text}</span>
      </figcaption>
    </figure>
  );
}

const anatomyWhereFrames = [
  {
    progress: 0.03,
    title: "1. Señal",
    text: "Un transmisor de presión sobre su carrete de tubería; su pantalla muestra la señal.",
  },
  {
    progress: 0.5,
    title: "2. Proceso: Hoy",
    text: "Depósitos, bomba, válvula, caudalímetro e intercambiador. Seis señales relacionadas.",
  },
  {
    progress: 0.76,
    title: "3. Planta: Siguiente",
    text: "Nuestro proceso, en cobalto, dentro de la planta; su límite se dibuja alrededor.",
  },
  {
    progress: 1,
    title: "4. Sistemas: Objetivo",
    text: "Varias plantas sobre un banco, unidas en red; las señales salen de la nuestra.",
  },
];

const anatomySectorFrames = [
  {
    id: "water",
    progress: 1,
    title: "Agua",
    text: "La red se tiende desde el depósito y el agua la recorre.",
  },
  {
    id: "food",
    progress: 0.8,
    title: "Agroalimentación",
    text: "Lo normal cambia en cada fase del lote.",
  },
  { id: "metal", progress: 0.6, title: "Metalurgia", text: "La pieza se adelgaza en cada caja." },
];

export const AnatomyStoryboard: Story = {
  name: "Anatomy storyboard",
  render: () => (
    <div style={{ display: "grid", gap: "3rem", padding: "3rem var(--gutter)" }}>
      <section style={{ display: "grid", gap: "1.5rem" }}>
        <h2 style={{ fontSize: "var(--text-title)", fontWeight: 600 }}>
          A, Hacia dónde vamos: de una señal a una red de plantas
        </h2>
        <div style={grid}>
          {anatomyWhereFrames.map((frame) => (
            <AnatomyFrame
              key={frame.title}
              src="/animations/anatomy/vision-where"
              aspect={1}
              {...frame}
            />
          ))}
        </div>
      </section>
      <section style={{ display: "grid", gap: "1.5rem" }}>
        <h2 style={{ fontSize: "var(--text-title)", fontWeight: 600 }}>
          B, Dónde empezamos: un modelo por sector
        </h2>
        <div style={grid}>
          {anatomySectorFrames.map(({ id, ...frame }) => (
            <AnatomyFrame
              key={id}
              src={`/animations/anatomy/sector-${id}`}
              aspect={3 / 2}
              {...frame}
            />
          ))}
        </div>
      </section>
    </div>
  ),
};

export const WhereAnatomyEs: Story = {
  name: "A, Hacia dónde vamos (ES, anatomy)",
  render: () => (
    <Page>
      <WhereScene content={dictionaries.es.vision.scenes.where} drawing="anatomy" />
    </Page>
  ),
};

export const WhereAnatomyMobile: Story = {
  name: "A, Hacia dónde vamos (ES, anatomy, narrow screen)",
  globals: { viewport: { value: "mobile2", isRotated: false } },
  render: () => (
    <Page>
      <WhereScene content={dictionaries.es.vision.scenes.where} drawing="anatomy" />
    </Page>
  ),
};

export const SectorsAnatomyEs: Story = {
  name: "B, Dónde empezamos (ES, anatomy)",
  render: () => (
    <Page>
      <SectorsScene content={dictionaries.es.vision.scenes.sectors} drawing="anatomy" />
    </Page>
  ),
};

export const SectorsAnatomyMobile: Story = {
  name: "B, Dónde empezamos (ES, anatomy, narrow screen)",
  globals: { viewport: { value: "mobile2", isRotated: false } },
  render: () => (
    <Page>
      <SectorsScene content={dictionaries.es.vision.scenes.sectors} drawing="anatomy" />
    </Page>
  ),
};

export const BothAnatomy: Story = {
  name: "A + B, one after the other (EN, anatomy)",
  render: () => (
    <Page>
      <WhereScene content={dictionaries.en.vision.scenes.where} drawing="anatomy" />
      <SectorsScene content={dictionaries.en.vision.scenes.sectors} drawing="anatomy" />
    </Page>
  ),
};
