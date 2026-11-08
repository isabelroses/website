import fa7 from "@iconify-json/fa7-solid/icons.json" with { type: "json" };

type IconName = keyof typeof fa7.icons;

// fa7 solid icons are a single currentColor path, so the hast stays a plain svg
const svg = (name: IconName) => {
  const icon = fa7.icons[name] as { body: string; width?: number };
  const d = /\bd="([^"]+)"/.exec(icon.body)?.[1];
  if (!d) throw new Error(`copy-icon: fa7-solid:${name} has no single path`);
  return {
    type: "element" as const,
    tagName: "svg",
    properties: {
      viewBox: `0 0 ${icon.width ?? fa7.width} ${fa7.height}`,
      fill: "currentColor",
    },
    children: [
      {
        type: "element" as const,
        tagName: "path",
        properties: { d },
        children: [],
      },
    ],
  };
};

// a link that becomes a check while [data-copied] is set (see global.css)
export const copyIcon = () => [svg("link"), svg("check")];
