import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        background: "linear-gradient(135deg, #3d6b8a 0%, #2a4f6a 100%)",
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 800,
        fontSize: 14,
        letterSpacing: "-0.5px",
      }}
    >
      FS
    </div>,
    { ...size },
  );
}
