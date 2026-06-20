import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";
import { SITE_HOST } from "@/lib/site";

export const dynamic = "force-static";
export const alt = "AtlaXia: Infraestructura para la ambición desmedida";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont(weight: 400 | 600 | 700 | 800) {
  const file = path.join(
    process.cwd(),
    "node_modules/@fontsource/nunito/files",
    `nunito-latin-${weight}-normal.woff`
  );
  return fs.readFile(file);
}

export default async function OpenGraphImage() {
  const [n400, n700, n800] = await Promise.all([loadFont(400), loadFont(700), loadFont(800)]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#F7F6F2",
          color: "#0F100E",
          padding: "72px 80px",
          fontFamily: "Nunito",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -240,
            right: -200,
            width: 720,
            height: 720,
            borderRadius: 9999,
            background:
              "radial-gradient(closest-side, rgba(79,168,154,0.28), rgba(79,168,154,0))",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(15,16,14,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,16,14,0.045) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            opacity: 0.6,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#0F100E",
              color: "#F7F6F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: "-0.06em",
            }}
          >
            AX
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 16,
              color: "#6B6C66",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            <span>ATLAXIA</span>
            <span style={{ width: 1, height: 18, background: "#E4E3DC", display: "flex" }} />
            <span>ICS, SCADA, AGUA</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 96,
            fontWeight: 800,
            fontSize: 110,
            letterSpacing: "-0.035em",
            lineHeight: 0.96,
            position: "relative",
          }}
        >
          <span>Infraestructura</span>
          <span style={{ color: "#3D8A7E", fontWeight: 400, fontStyle: "italic" }}>
            para la ambición
          </span>
          <span>desmedida.</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: 40,
            borderTop: "1px solid #E4E3DC",
            position: "relative",
            fontSize: 22,
            color: "#1F201D",
            fontWeight: 400,
          }}
        >
          <span>Detección de anomalías con GNN, predicción antes del fallo</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#6B6C66",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: "#4FA89A", display: "flex" }} />
            <span>{SITE_HOST}</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Nunito", data: n400, weight: 400, style: "normal" },
        { name: "Nunito", data: n700, weight: 700, style: "normal" },
        { name: "Nunito", data: n800, weight: 800, style: "normal" },
      ],
    }
  );
}
