import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: 34,
          background: "#0b1522",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 42,
            top: 53,
            width: 96,
            height: 96,
            border: "14px solid #e8dcc4",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            height: 57,
            background: "#245238",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 82,
            bottom: -8,
            width: 19,
            height: 86,
            background: "#c5d4f0",
            transform: "rotate(10deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 37,
            top: 82,
            width: 15,
            height: 15,
            background: "#c45c26",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 43,
            top: 35,
            width: 10,
            height: 10,
            background: "#c5d4f0",
          }}
        />
      </div>
    ),
    size,
  );
}
