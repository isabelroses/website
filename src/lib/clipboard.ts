const resets = new WeakMap<Element, ReturnType<typeof setTimeout>>();

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// one listener for every [data-copy] control; capture runs it before the
// client router can treat a #heading link as navigation
document.addEventListener(
  "click",
  async (event) => {
    const el = (event.target as Element).closest<HTMLElement>("[data-copy]");
    if (!el) return;
    event.preventDefault();

    if (el instanceof HTMLAnchorElement)
      history.replaceState(history.state, "", el.href);

    const copied = await copy(
      el.dataset.copy || (el as HTMLAnchorElement).href,
    );
    const status = document.querySelector("[data-copy-status]");
    if (status)
      status.textContent = copied ? "copied to clipboard" : "couldn't copy";
    el.toggleAttribute("data-copied", copied);

    clearTimeout(resets.get(el));
    resets.set(
      el,
      setTimeout(() => {
        el.removeAttribute("data-copied");
        if (status) status.textContent = "";
      }, 2000),
    );
  },
  true,
);
