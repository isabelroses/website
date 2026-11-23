export const pagePath = (url: URL) =>
  url.pathname.replace(/(\/index)?\.html$/, "").replace(/\/$/, "") || "/";
