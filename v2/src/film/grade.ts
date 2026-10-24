/* The colour script: one grade per shot, each meaning something.
   docs/design/inheritance-film.md §3 */

export type RGB = [number, number, number];
export const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const mix = (a: RGB, b: RGB, t: number): RGB =>
  [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const css = (c: RGB, a = 1) =>
  a >= 1 ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;

export type Grade = {
  top: RGB; mid: RGB; hor: RGB; sun: RGB; haze: RGB; ink: RGB; rim: RGB;
  /** sun radius (×H), altitude above the horizon (×H), x (×W) */
  sunR: number; sunAlt: number; sunX: number;
  /** 0 a bright disc · 1 a black disc with a corona */
  eclipse: number;
  glow: number; stars: number; ash: number; embers: number; rays: number;
  /** caption ink: 0 light text · 1 dark text */
  tone: number;
};

const G = (
  top: string, mid: string, hor: string, sun: string, haze: string, ink: string, rim: string,
  n: Partial<Omit<Grade, 'top' | 'mid' | 'hor' | 'sun' | 'haze' | 'ink' | 'rim'>>,
): Grade => ({
  top: hex(top), mid: hex(mid), hor: hex(hor), sun: hex(sun), haze: hex(haze), ink: hex(ink), rim: hex(rim),
  sunR: 0.07, sunAlt: 0.04, sunX: 0.7, eclipse: 0, glow: 0.6, stars: 0, ash: 0, embers: 0, rays: 0, tone: 0,
  ...n,
});

export const GRADES = {
  black: G('#050405', '#050405', '#050405', '#050405', '#050405', '#050405', '#050405', { glow: 0, sunR: 0 }),
  dawn: G('#1E1238', '#6B2A6E', '#F59E6B', '#FFF2C4', '#B8607A', '#1A0F1F', '#FFC98F', { sunR: 0.075, sunAlt: 0.015, sunX: 0.74, glow: 0.9, rays: 0.6 }),
  morning: G('#2E1A4A', '#9A4776', '#F8B37A', '#FFF4D2', '#C27583', '#1D111D', '#FFD39C', { sunR: 0.07, sunAlt: 0.09, sunX: 0.72, glow: 0.8, rays: 0.45 }),
  want: G('#3B1F4F', '#B5577A', '#FBC88B', '#FFF6D8', '#C98080', '#21131D', '#FFE0A8', { sunR: 0.06, sunAlt: 0.2, sunX: 0.66, glow: 0.7, rays: 0.3 }),
  war: G('#1F050F', '#6E0F2A', '#E84A4A', '#FFB08A', '#A82A45', '#120408', '#FF7A5C', { sunR: 0.24, sunAlt: 0.06, sunX: 0.5, glow: 1, embers: 1 }),
  ash: G('#2E302A', '#55584F', '#9C9E92', '#D9D8CC', '#7D7F75', '#1B1C18', '#B9BAAF', { sunR: 0.05, sunAlt: 0.2, sunX: 0.3, glow: 0.25, ash: 1 }),
  night: G('#05040C', '#140C30', '#3B0F70', '#E8E4F5', '#2A1856', '#050409', '#7E6BC4', { sunR: 0.04, sunAlt: 0.32, sunX: 0.78, glow: 0.35, stars: 1 }),
  gift: G('#07060E', '#1A1030', '#4A1F55', '#E8E4F5', '#3A2050', '#050408', '#FFB060', { sunR: 0.035, sunAlt: 0.36, sunX: 0.84, glow: 0.2, stars: 0.7 }),
  steel: G('#1A1E22', '#4A535A', '#C9CFC9', '#F5F6F0', '#8E9893', '#0D0F10', '#E6EBE6', { sunR: 0.05, sunAlt: 0.03, sunX: 0.36, glow: 0.7, rays: 0.25 }),
  plate: G('#D9D7CB', '#E6E4DA', '#F1EFE6', '#0C0D0B', '#BDBBAE', '#0C0D0B', '#DE4968', { sunR: 0.2, sunAlt: 0.09, sunX: 0.5, eclipse: 1, glow: 0.8, tone: 1 }),
  dusk: G('#CFCBBE', '#E2C9B5', '#F6C6A0', '#FCFDBF', '#C7B3A6', '#0C0D0B', '#FE9F6D', { sunR: 0.06, sunAlt: 0.02, sunX: 0.24, glow: 0.8, tone: 1, rays: 0.2 }),
} satisfies Record<string, Grade>;
export type GradeName = keyof typeof GRADES;

export function lerpGrade(a: Grade, b: Grade, t: number): Grade {
  const o = { ...a } as Grade;
  for (const k of Object.keys(a) as (keyof Grade)[]) {
    const va = a[k], vb = b[k];
    (o as Record<string, unknown>)[k] = Array.isArray(va)
      ? mix(va as RGB, vb as RGB, t)
      : (va as number) + ((vb as number) - (va as number)) * t;
  }
  return o;
}

/** shared accents */
export const HEART = hex('#FE9F6D'), HEART_CORE = hex('#FCFDBF'), EYE = hex('#DE4968'),
  KITE = hex('#8C2981'), BOW = hex('#FCFDBF'), HOT = hex('#FF6A3D');
