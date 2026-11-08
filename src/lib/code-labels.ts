import { defineHastPlugin } from "satteri";

type Node = { type: string; tagName?: string; children?: Node[] };

const countPre = (node: Node): number =>
  (node.tagName === "pre" ? 1 : 0) +
  (node.children ?? []).reduce((sum, child) => sum + countPre(child), 0);

// expressive-code makes overflowing blocks focusable regions; give each a distinct name
export const codeBlockLabels = () => {
  let total = 0;
  let index = 0;
  return defineHastPlugin({
    name: "code-block-labels",
    before(root) {
      total = countPre(root as Node);
      index = 0;
    },
    element: {
      filter: ["pre"],
      visit(node, ctx) {
        const lang = node.properties?.dataLanguage;
        const kind = typeof lang === "string" ? `${lang} code` : "code";
        ctx.setProperty(
          node,
          "ariaLabel",
          `${kind}, block ${++index} of ${total}`,
        );
      },
    },
  });
};
