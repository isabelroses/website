interface Palette {
  type: "dark" | "light";
  bg: string;
  fg: string;
  comment: string;
  keyword: string;
  string: string;
  number: string;
  type_: string;
  func: string;
  variable: string;
  punct: string;
}

const theme = (p: Palette) => ({
  name: p.type,
  type: p.type,
  colors: {
    "editor.background": p.bg,
    "editor.foreground": p.fg,
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: p.comment, fontStyle: "italic" },
    },
    {
      scope: [
        "keyword",
        "storage",
        "keyword.operator.new",
        "variable.language",
      ],
      settings: { foreground: p.keyword },
    },
    {
      scope: ["string", "string.quoted", "markup.inline.raw"],
      settings: { foreground: p.string },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "constant.character",
        "support.constant",
      ],
      settings: { foreground: p.number },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "support.type",
        "support.class",
        "entity.name.tag",
      ],
      settings: { foreground: p.type_ },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call"],
      settings: { foreground: p.func, fontStyle: "bold" },
    },
    {
      scope: [
        "variable",
        "variable.other.property",
        "meta.attribute",
        "entity.other.attribute-name",
      ],
      settings: { foreground: p.variable },
    },
    {
      scope: ["punctuation", "keyword.operator", "meta.brace"],
      settings: { foreground: p.punct },
    },
    {
      scope: ["markup.heading", "markup.bold"],
      settings: { foreground: p.keyword, fontStyle: "bold" },
    },
    {
      scope: ["markup.inserted"],
      settings: { foreground: p.string },
    },
    {
      scope: ["markup.deleted"],
      settings: { foreground: p.keyword },
    },
  ],
});

export const darkCode = theme({
  type: "dark",
  bg: "#1a1517",
  fg: "#ece4da",
  comment: "#9a8d83",
  keyword: "#e8707f",
  string: "#dcb98f",
  number: "#eb977f",
  type_: "#e9a7ae",
  func: "#f3eadf",
  variable: "#cdbfb3",
  punct: "#a99d93",
});

export const lightCode = theme({
  type: "light",
  bg: "#d9d7d4",
  fg: "#141213",
  comment: "#554943",
  keyword: "#8a1528",
  string: "#6a3f0c",
  number: "#86301a",
  type_: "#7a2140",
  func: "#120d0b",
  variable: "#332924",
  punct: "#4f443e",
});
