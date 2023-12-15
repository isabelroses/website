import { Vue } from "vue-class-component";

/**
 * Same as python's range
 *
 * Ways of calling this function:
 * range(to)
 * range(from, to)
 * range(from, to, step)
 *
 * @param fromOrTo Either from or to. From is inclusive
 * @param to to, Not inclusive
 * @param step Step
 */
export function range(fromOrTo: number, to?: number, step = 1): number[] {
  const from = to ?? 0;
  to = to ?? fromOrTo;

  if (to == from) return [];
  const mul = to > from ? 1 : -1;

  return [...Array(Math.floor(Math.abs(to - from) / step))].map(
    (_, i) => from + i * step * mul
  );
}

/**
 * Make sure that the value is between a min and a max
 *
 * @param val
 * @param min
 * @param max
 */
export function minMax(val: number, min: number, max: number): number {
  let result: number;

  if (val > max) {
    result = max;
  } else if (val < min) {
    result = min;
  } else {
    result = val;
  }

  return result;
}

/**
 * Keybinds[key string] = (event) => Prevent default or not (Default: true)
 */
export type Keybinds = { [id: string]: (e: KeyboardEvent) => unknown };

/**
 * Key handler mixin
 */
export class KeyHandler extends Vue {
  keybinds: Keybinds = {};
  _keybinds: Keybinds = {};

  initKeybinds(): void {
    return;
  }

  mounted(): void {
    document.addEventListener("keydown", this.keyListener);
    this.initKeybinds();
    Object.keys(this.keybinds).forEach(
      (it) => (this._keybinds[it.toLowerCase()] = this.keybinds[it])
    );
  }

  unmounted(): void {
    document.removeEventListener("keydown", this.keyListener);
  }

  keyListener(e: KeyboardEvent): void {
    let key = e.key;
    if (e.shiftKey) key = "Shift" + key;
    if (e.altKey) key = "Alt" + key;
    if (e.ctrlKey) key = "Ctrl" + key;
    if (e.metaKey) key = "Cmd" + key;
    key = key.toLowerCase();

    if (key in this._keybinds) {
      if (this._keybinds[key](e) !== false) {
        e.preventDefault();
      }
    }
  }
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function shuffle(array: any[]) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
