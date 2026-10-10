import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Knit — Notas en markdown y tareas, con o sin internet";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// El icono (512px, ~270 KB) entra en el límite de 500 KB de ImageResponse;
// las mascotas grandes no. Se lee una vez, en tiempo de build (estática).
const iconData = await readFile(
  join(process.cwd(), "src/app/icon.png"),
  "base64",
);
const iconSrc = `data:image/png;base64,${iconData}`;

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fafafa",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 40,
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: ImageResponse/satori renderiza con <img>; next/image no aplica. */}
        <img
          src={iconSrc}
          width={128}
          height={128}
          alt=""
          style={{ borderRadius: 28 }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              color: "#171717",
              letterSpacing: -2,
            }}
          >
            Knit
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#525252",
              marginTop: 12,
            }}
          >
            Notas en markdown y tareas, con o sin internet
          </div>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
