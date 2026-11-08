export const CONTENTS_DEPTH = 2;
export const CONTENTS_MIN_SECTIONS = 4;
// a section counts as current once its heading is this close to the top
const SECTION_OFFSET = 120;

export const currentSection = (tops: number[]) =>
  Math.max(0, tops.findLastIndex((top) => top < SECTION_OFFSET));
