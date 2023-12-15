import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

/* eslint-disable prefer-const */
declare global {
  interface RegExp {
    find(s: string): RegExpExecArray | null;
  }
}

/**
 * Make sure that regex find is consistent
 * https://stackoverflow.com/questions/11477415/why-does-javascripts-regex-exec-not-always-return-the-same-value
 */
class ExtendedRegExp extends RegExp {
  find(s: string): RegExpExecArray | null {
    const r = this.exec(s);
    this.lastIndex = 0;
    return r;
  }
}

// Replace the existing declaration of `re` with the extended `ExtendedRegExp` class
const re = {
  command: new ExtendedRegExp("<!--{.*?}-->", "g"),
  hashes: new ExtendedRegExp(/^#+/, "g"),
};

/**
 * Parse markdown echanced markdown
 *
 * @param raw Extended markdown
 * @return Parsed markdown
 */
export async function parseMarkdown(raw: string): Promise<string> {
  // @ts-ignore
  let lines = raw.replace("\r\n", "\n").split("\n");
  let i = 0;

  // Find the end index of a section or -1
  function findSectionEnd(): number {
    const r = re.hashes.find(lines[i]);
    if (!r) return -1;
    const level = r[0].length;

    // Find next same-level or higher-level header's index
    let j = i + 1;
    for (; j < lines.length; j++) {
      const r = re.hashes.find(lines[j]);
      if (r && r[0].length <= level) break;
    }
    return j;
  }

  function fold() {
    const e = findSectionEnd();
    const title = lines[i]
      .substring(lines[i].indexOf(" ") + 1)
      .replace(re.command, "");
    lines[i] = `<Fold title="${encodeURIComponent(title)}">`;
    lines.splice(e, 0, "</Fold>\n");
  }

  // Run all commands in markdown
  while (i < lines.length) {
    // Find commands
    const r = re.command.find(lines[i]);
    if (r) {
      let cmd = r[0];
      cmd = cmd.substring(5, cmd.length - 5).trim();

      eval(cmd);
    }

    i++;
  }

  // If I don't call these functions somewhere, they will be deleted by vite build, and it will
  // raise an error when the functions are called in eval(). So I put function calls in an
  // impossible condition to prevent deletion.
  if (raw == "NO d3leTe PleEze") {
    fold();
  }

  // Override marked renderer to have syntax highlighting
  const marked = new Marked(
    markedHighlight({
      async: true,
      langPrefix: "hljs language-",
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : "plaintext";
        return hljs.highlight(code, { language }).value;
      },
    })
  );

  return await marked.parse(lines.join("\n"));
}
