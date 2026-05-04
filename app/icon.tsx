import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F100E",
          color: "#F7F6F2",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: "-0.06em",
          borderRadius: 7,
        }}
      >
        AX
      </div>
    ),
    { ...size }
  );
}
