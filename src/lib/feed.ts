import sanitizeHtml from "sanitize-html";

// feed readers resolve relative urls against the feed, not the post
const resolveAttr =
  (attr: string, base: string) =>
  (tagName: string, attribs: sanitizeHtml.Attributes) => {
    const url = attribs[attr];
    if (!url || /^[a-z][a-z\d+.-]*:/i.test(url)) return { tagName, attribs };
    return {
      tagName,
      attribs: { ...attribs, [attr]: new URL(url, base).href },
    };
  };

// readers re-highlight from textContent, so expressive-code's per-line divs
// must become newlines and the language must use the language-* convention
const flattenCodeBlocks = (html: string) =>
  html.replace(
    /<pre\b[^>]*?\bdata-language="?([\w+#.-]+)"?[^>]*><code>([\s\S]*?)<\/code><\/pre>/g,
    (_, lang: string, inner: string) => {
      const text = inner
        .split(/<div class="?ec-line\b[^>]*>/)
        .map((line) => line.replace(/<[^>]*>/g, "").replace(/\n$/, ""))
        .filter((line, i) => i > 0 || line !== "")
        .join("\n");
      return `<pre><code class="language-${lang}">${text}</code></pre>`;
    },
  );

const SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title"],
    a: ["href", "name", "target", "rel"],
  },
  allowedClasses: { code: ["language-*"] },
  nonTextTags: ["style", "script", "textarea", "option", "noscript"],
};

// expressive-code's copy widget and heading permalinks are empty once their
// icons are stripped; filters see attributes after sanitising, so match on that
const emptyWidget = ({ tag, text, mediaChildren }: sanitizeHtml.IFrame) =>
  (tag === "a" || tag === "div") && !text.trim() && !mediaChildren.length;

export const feedHtml = (html: string, postUrl: string) =>
  sanitizeHtml(flattenCodeBlocks(html), {
      ...SANITIZE,
      exclusiveFilter: emptyWidget,
      transformTags: {
        a: resolveAttr("href", postUrl),
        img: resolveAttr("src", postUrl),
      },
  });
