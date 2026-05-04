import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 96,
          letterSpacing: "-0.06em",
          borderRadius: 40,
          // subtle teal underline-dot accent (matches brand accent)
          position: "relative",
        }}
      >
        AX
        <div
          style={{
            position: "absolute",
            bottom: 28,
            width: 14,
            height: 14,
            borderRadius: 999,
            background: "#4FA89A",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
