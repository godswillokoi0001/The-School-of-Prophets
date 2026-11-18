import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "You're among the first — The School of Prophets beta";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function seal() {
  try {
    const file = await readFile(path.join(process.cwd(), "public", "images", "tsop-crest.png"));
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const crest = await seal();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#101317",
          color: "#f2ece0",
          padding: "60px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 18,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#d9be86",
          }}
        >
          <span>Watchers · Daniel 4:17</span>
          <span>Invited testers</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          {crest ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={crest} alt="" width={150} height={168} style={{ objectFit: "contain" }} />
          ) : null}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 82, lineHeight: 1.02, letterSpacing: "-0.02em", maxWidth: 800 }}>
              You&rsquo;re among the first.
            </div>
            <div style={{ marginTop: 24, fontSize: 24, color: "#b8b1a3", maxWidth: 720 }}>
              Test the new site. Tell us the truth. Every review is read by the team.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid #3a3730",
            paddingTop: 22,
            fontSize: 18,
            color: "#8f887a",
          }}
        >
          <span>The School of Prophets</span>
          <span>About five minutes</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
