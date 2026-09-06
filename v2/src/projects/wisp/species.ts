/* ══════════════════════════════════════════════════════════════════════════
   wisp — the species list and the contact sheet's exposure log.

   The nineteen names below are the ones the case study's dataset note actually
   spells out; the mapping holds twenty classes, and the twentieth is not named
   in that note, so it is not named here either. Binomials are the standard
   taxonomic names for those species — the page sets every one of them in
   Cormorant italic, which is its most repeated gesture.
   ══════════════════════════════════════════════════════════════════════════ */

import type { FrameSpec } from './ir';
import type { SpeciesKey } from './shapes';

export type Sp = { common: string; bino: string; region: 'neotropical' | 'temperate' };

export const SPECIES: Sp[] = [
  { common: 'Agouti', bino: 'Dasyprocta punctata', region: 'neotropical' },
  { common: 'Coiban agouti', bino: 'Dasyprocta coibae', region: 'neotropical' },
  { common: 'Paca', bino: 'Cuniculus paca', region: 'neotropical' },
  { common: 'Ocelot', bino: 'Leopardus pardalis', region: 'neotropical' },
  { common: 'Collared peccary', bino: 'Pecari tajacu', region: 'neotropical' },
  { common: 'Red brocket deer', bino: 'Mazama americana', region: 'neotropical' },
  { common: 'White-nosed coati', bino: 'Nasua narica', region: 'neotropical' },
  { common: 'Spiny rat', bino: 'Proechimys semispinosus', region: 'neotropical' },
  { common: 'Common opossum', bino: 'Didelphis marsupialis', region: 'neotropical' },
  { common: 'Great tinamou', bino: 'Tinamus major', region: 'neotropical' },
  { common: 'Red deer', bino: 'Cervus elaphus', region: 'temperate' },
  { common: 'Roe deer', bino: 'Capreolus capreolus', region: 'temperate' },
  { common: 'Wild boar', bino: 'Sus scrofa', region: 'temperate' },
  { common: 'Red fox', bino: 'Vulpes vulpes', region: 'temperate' },
  { common: 'European hare', bino: 'Lepus europaeus', region: 'temperate' },
  { common: 'Wood mouse', bino: 'Apodemus sylvaticus', region: 'temperate' },
  { common: 'Mouflon', bino: 'Ovis gmelini musimon', region: 'temperate' },
  { common: 'White-tailed deer', bino: 'Odocoileus virginianus', region: 'temperate' },
  { common: 'Red squirrel', bino: 'Sciurus vulgaris', region: 'temperate' },
];

/* ── the exposure log ───────────────────────────────────────────────────── */

export type Cell = {
  no: string;
  /** clock burned into the sequence, from the concept's 02:11 trigger */
  time: string;
  common: string;
  bino: string;
  /** what the frame actually shows, for the canvas's accessible name */
  alt: string;
  spec: FrameSpec;
};

const f = (
  seed: number,
  sp: SpeciesKey | null,
  x: number,
  y: number,
  s: number,
  flip: boolean,
  fx: number,
  fy: number,
  reach: number,
  smear: number,
  canopy: number,
): FrameSpec => ({ seed, sp, x, y, s, flip, fx, fy, reach, smear, canopy });

/** contact sheet i — twelve mounts, one of them deliberately empty */
export const SHEET: Cell[] = [
  {
    no: '01',
    time: '02:11:44',
    common: 'Red deer',
    bino: 'Cervus elaphus',
    alt: 'Infrared camera-trap frame: a red deer standing side-on in the right half of the frame, antlers clear of the canopy, flash falloff darkening the left edge.',
    spec: f(10401, 'deer', 0.62, 0.56, 0.62, false, 0.5, 0.74, 0.86, 0.02, 0.5),
  },
  {
    no: '02',
    time: '02:11:46',
    common: 'Red fox',
    bino: 'Vulpes vulpes',
    alt: 'Infrared camera-trap frame: a red fox crossing low and close to the lens, blown out by the flash, brush filling the upper half.',
    spec: f(20477, 'fox', 0.38, 0.68, 0.72, true, 0.44, 0.86, 0.72, 0.09, 0.62),
  },
  {
    no: '03',
    time: '02:12:03',
    common: 'Ocelot',
    bino: 'Leopardus pardalis',
    alt: 'Infrared camera-trap frame: an ocelot deep in the frame at the right edge, mostly in shadow, only the eyeshine and the tail reading clearly.',
    spec: f(30911, 'ocelot', 0.78, 0.46, 0.4, false, 0.34, 0.8, 0.6, 0.03, 0.72),
  },
  {
    no: '04',
    time: '02:12:09',
    common: 'Wild boar',
    bino: 'Sus scrofa',
    alt: 'Infrared camera-trap frame: a wild boar filling the lower left, head down in leaf litter, shoulder hump caught square by the flash.',
    spec: f(41233, 'boar', 0.34, 0.72, 0.78, false, 0.46, 0.9, 0.9, 0.05, 0.44),
  },
  {
    no: '05',
    time: '02:14:51',
    common: 'Agouti',
    bino: 'Dasyprocta punctata',
    alt: 'Infrared camera-trap frame: an agouti small and off-centre at the lower right, half behind a stem, heavy grain across the dark upper third.',
    spec: f(50187, 'agouti', 0.7, 0.74, 0.34, true, 0.4, 0.82, 0.66, 0.02, 0.66),
  },
  {
    no: '06',
    time: '02:18:20',
    common: 'European hare',
    bino: 'Lepus europaeus',
    alt: 'Infrared camera-trap frame: a European hare mid-stride at the left edge, ears up, smeared by motion blur across the flash.',
    spec: f(60553, 'hare', 0.26, 0.62, 0.52, false, 0.56, 0.78, 0.78, 0.16, 0.4),
  },
  {
    no: '07',
    time: '02:19:02',
    common: '—',
    bino: '',
    alt: '',
    spec: f(0, null, 0.5, 0.5, 0, false, 0.5, 0.8, 0.8, 0, 0.5),
  },
  {
    no: '08',
    time: '02:26:37',
    common: 'Roe deer',
    bino: 'Capreolus capreolus',
    alt: 'Infrared camera-trap frame: a roe deer at the top of the frame walking away from the lens, back lit only by scattered flash.',
    spec: f(80641, 'deer', 0.54, 0.4, 0.42, true, 0.62, 0.92, 0.62, 0.04, 0.58),
  },
  {
    no: '09',
    time: '02:31:15',
    common: 'Collared peccary',
    bino: 'Pecari tajacu',
    alt: 'Infrared camera-trap frame: a collared peccary low and central, close enough that the flash flattens it against a wall of foliage.',
    spec: f(90271, 'boar', 0.52, 0.7, 0.56, true, 0.5, 0.86, 0.7, 0.07, 0.7),
  },
  {
    no: '10',
    time: '02:44:08',
    common: 'White-tailed deer',
    bino: 'Odocoileus virginianus',
    alt: 'Infrared camera-trap frame: a white-tailed deer far back and small, at the limit of the infrared reach, with the foreground blown white.',
    spec: f(101009, 'deer', 0.44, 0.44, 0.3, false, 0.5, 0.96, 0.5, 0.02, 0.52),
  },
  {
    no: '11',
    time: '03:02:29',
    common: 'White-nosed coati',
    bino: 'Nasua narica',
    alt: 'Infrared camera-trap frame: a coati crossing the bottom edge in front of the lens, tail out of frame, canopy dark above it.',
    spec: f(110777, 'agouti', 0.58, 0.82, 0.66, false, 0.52, 0.94, 0.82, 0.11, 0.6),
  },
  {
    no: '12',
    time: '03:19:53',
    common: 'Red squirrel',
    bino: 'Sciurus vulgaris',
    alt: 'Infrared camera-trap frame: a red squirrel high on a stem at the right, tiny against a bright wall of leaves.',
    spec: f(120431, 'agouti', 0.76, 0.36, 0.26, true, 0.42, 0.7, 0.68, 0.03, 0.78),
  },
];

/** the two full-bleed plates */
export const PLATE_OCELOT: FrameSpec = f(300119, 'ocelot', 0.63, 0.58, 0.56, false, 0.46, 0.84, 0.78, 0.03, 0.64);
export const PLATE_BOAR: FrameSpec = f(300223, 'boar', 0.4, 0.64, 0.66, true, 0.52, 0.88, 0.84, 0.06, 0.5);

/** the frame the six methods argue over */
export const STUDY: FrameSpec = f(400331, 'ocelot', 0.66, 0.6, 0.5, false, 0.44, 0.86, 0.72, 0.04, 0.6);

/** the frame nothing was ever drawn on */
export const NOBOX: FrameSpec = f(500137, 'deer', 0.58, 0.58, 0.54, false, 0.48, 0.84, 0.8, 0.03, 0.56);

/** the notebook's three-mount strip: two frames and one empty mount */
export const NOTE_STRIP: FrameSpec[] = [
  f(600119, 'fox', 0.56, 0.66, 0.6, false, 0.5, 0.86, 0.78, 0.05, 0.55),
  f(600233, 'hare', 0.44, 0.6, 0.5, true, 0.48, 0.82, 0.74, 0.08, 0.6),
];
