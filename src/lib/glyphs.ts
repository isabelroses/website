// the mark at the heart of each page's seal; drawn inside Ring's r=40 inner circle
export const GLYPHS = {
  // grimoire: an open book
  book: "M98 86 L78 80 L78 114 L98 120 Z M102 86 L122 80 L122 114 L102 120 Z",
  // artifacts: a cut stone
  stone: "M100 78 L119 89 L119 111 L100 122 L81 111 L81 89 Z",
  // coven: three bound together
  coven:
    "M90 88 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0 M79 107 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0 M101 107 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0",
  // donate: the candle the offerings keep lit
  candle:
    "M100 74 C110 90 111 98 100 108 C89 98 90 90 100 74 Z M94 111 H106 V126 H94 Z",
} as const;

export type Glyph = keyof typeof GLYPHS;
