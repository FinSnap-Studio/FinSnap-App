import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        background: "linear-gradient(135deg, #3d6b8a 0%, #2a4f6a 100%)",
        borderRadius: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 800,
        fontSize: 80,
        letterSpacing: "-3px",
      }}
    >
      FS
    </div>,
    { ...size },
  );
}
