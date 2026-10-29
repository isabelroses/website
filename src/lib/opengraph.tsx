import satori from "satori";
import { readFile } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";
import { formatDate } from "@lib/format";
import { OG_IMAGE } from "@lib/consts";

const COLORS = {
  fg: "#ece4da",
  fgLighter: "#a99d93",
  bg: "#0c0a0b",
  special: "#e2596b",
  blood: "#7a1325",
};

const fonts = Promise.all([
  readFile("./src/lib/unifraktur-maguntia.ttf"),
  readFile("./src/lib/grenze.ttf"),
]);

export const generateOpenGraph = async (
  title: string,
  description: string,
  date?: Date,
) => {
  const [display, sans] = await fonts;

  const isPost = Boolean(date);
  const titleSize = isPost
    ? title.length > 30
      ? 60
      : 72
    : title.length > 16
      ? 104
      : 128;

  const svg = await satori(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.bg,
        color: COLORS.fg,
        fontFamily: "Grenze",
        borderLeft: `24px solid ${COLORS.blood}`,
        padding: "56px 72px 56px 64px",
        // satori sizes `width: 100%` as content-box, so padding would
        // otherwise push the right and bottom edges off the canvas
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          width: "100%",
        }}
      >
        <div
          style={{
            fontFamily: "UnifrakturMaguntia",
            fontSize: "56px",
            color: COLORS.special,
            lineHeight: 1,
          }}
        >
          isabel
        </div>
        <div style={{ fontSize: "28px", color: COLORS.fgLighter }}>
          isabelroses.com
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          flex: 1,
          gap: "24px",
        }}
      >
        <div
          style={{
            fontFamily: isPost ? "Grenze" : "UnifrakturMaguntia",
            fontSize: `${titleSize}px`,
            lineHeight: isPost ? 1.05 : 0.9,
            maxWidth: "95%",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "34px",
            color: COLORS.fgLighter,
            lineHeight: 1.3,
            maxWidth: "88%",
          }}
        >
          {description.length <= 110
            ? description
            : description.substring(0, 107).trimEnd() + "…"}
        </div>
        {date && (
          <div style={{ fontSize: "28px", color: COLORS.special }}>
            {formatDate(date, "long")}
          </div>
        )}
      </div>
    </div>,
    {
      ...OG_IMAGE,
      fonts: [
        {
          name: "UnifrakturMaguntia",
          data: display,
          weight: 400,
          style: "normal",
        },
        { name: "Grenze", data: sans, weight: 400, style: "normal" },
      ],
    },
  );

  const png = new Resvg(svg, { background: COLORS.bg }).render().asPng();
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
