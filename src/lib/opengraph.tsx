import satori from "satori";
import { readFile } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";
import { formatDate } from "@lib/format";
import { OG_IMAGE } from "@lib/pages";
import { FONTS, PALETTE } from "@lib/palette";

const { dark } = PALETTE;

const fonts = Promise.all([
  readFile(`./src/lib/${FONTS.display.file}.ttf`),
  readFile(`./src/lib/${FONTS.sans.file}.ttf`),
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
        backgroundColor: dark.bg,
        color: dark.fg,
        fontFamily: FONTS.sans.family,
        borderLeft: `24px solid ${dark.blood}`,
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
            fontFamily: FONTS.display.family,
            fontSize: "56px",
            color: dark.special,
            lineHeight: 1,
          }}
        >
          isabel
        </div>
        <div style={{ fontSize: "28px", color: dark["fg-lighter"] }}>
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
            fontFamily: isPost ? FONTS.sans.family : FONTS.display.family,
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
            color: dark["fg-lighter"],
            lineHeight: 1.3,
            maxWidth: "88%",
            display: "block",
            lineClamp: 2,
          }}
        >
          {description}
        </div>
        {date && (
          <div style={{ fontSize: "28px", color: dark.special }}>
            {formatDate(date, "long")}
          </div>
        )}
      </div>
    </div>,
    {
      ...OG_IMAGE,
      fonts: [
        {
          name: FONTS.display.family,
          data: display,
          weight: 400,
          style: "normal",
        },
        { name: FONTS.sans.family, data: sans, weight: 400, style: "normal" },
      ],
    },
  );

  const png = new Resvg(svg, { background: dark.bg }).render().asPng();
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
