import { ImageResponse } from "next/og";

export const alt = "The School of Prophets — a community of the called";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c1014",
          color: "#f4efe5",
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#c0913f",
          }}
        >
          <span>Watchers · Daniel 4:17</span>
          <span>Est. 2021</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 88,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              maxWidth: 940,
            }}
          >
            A community of the called.
          </div>
          <div style={{ marginTop: 30, fontSize: 26, color: "#b8b1a3", maxWidth: 860 }}>
            Taught in the Word. Moved by the Spirit. Built on prayer.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid #3a3730",
            paddingTop: 24,
            fontSize: 20,
            color: "#8f887a",
          }}
        >
          <span>The School of Prophets</span>
          <span>Founded 18 September 2021</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
