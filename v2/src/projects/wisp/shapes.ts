/* ══════════════════════════════════════════════════════════════════════════
   wisp — animal silhouettes, hand-authored.

   No photographic asset ships with this page and none may. Every animal on the
   contact sheet is one of these profiles, drawn as SVG path data in a 120 × 80
   box with the feet on y = 78 and the head facing +x. They are deliberately
   abstracted — a camera trap at 02:11 does not return a field-guide plate — but
   each one is a recognisable posture: the deer's raised neck, the boar's
   shoulder hump, the hare's ears, the ocelot's tail.

   `fill` subpaths are filled together (nonzero); `line` subpaths are stroked,
   which is how antlers, bristles and tusks stay thin at 24 px tall.
   ══════════════════════════════════════════════════════════════════════════ */

export type Shape = {
  /** filled outline pieces, all in the 120 × 80 box */
  fill: string[];
  /** stroked pieces: [d, width] */
  line?: [string, number][];
  /** eyeshine anchor in the same box */
  eye: [number, number];
  /** distance between the two eyes, in box units */
  gap: number;
};

export type SpeciesKey = 'deer' | 'fox' | 'boar' | 'ocelot' | 'agouti' | 'hare';

export const SHAPES: Record<SpeciesKey, Shape> = {
  deer: {
    fill: [
      'M34 42 C40 35 54 32 68 34 C79 35 85 39 85 46 C85 53 78 57 67 58 C53 59 40 57 35 53 C31 50 31 45 34 42 Z',
      'M76 42 C77 32 81 23 86 16 C88 13 92 12 95 14 C99 16 105 17 110 19 C112 20 112 23 109 24 C104 25 98 24 95 22 C92 27 90 34 88 43 Z',
      'M40 55 L46 55 L45 78 L40 78 Z',
      'M50 56 L55 56 L57 78 L52 78 Z',
      'M68 55 L74 55 L74 78 L69 78 Z',
      'M76 53 L81 53 L82 78 L77 78 Z',
      'M34 43 L27 36 L30 45 Z',
    ],
    line: [
      ['M90 14 C87 7 83 3 78 1', 2.2],
      ['M90 14 C92 6 96 3 101 2', 2.2],
      ['M86 7 L80 7', 1.8],
      ['M95 6 L101 5', 1.8],
    ],
    eye: [102, 21],
    gap: 4,
  },

  fox: {
    fill: [
      'M28 48 C36 41 52 39 68 41 C79 42 86 45 88 50 C90 55 84 59 72 60 C56 61 40 60 33 56 C29 54 26 51 28 48 Z',
      'M82 46 C84 38 89 32 95 30 C99 29 103 31 105 35 C107 38 109 41 111 43 C112 45 110 47 107 47 C102 47 96 49 91 49 C86 49 82 48 82 46 Z',
      'M89 31 L86 20 L94 28 Z',
      'M101 31 L104 21 L107 32 Z',
      'M30 49 C21 44 11 44 5 50 C1 54 4 60 10 60 C19 60 27 56 32 53 Z',
      'M40 58 L45 58 L44 76 L39 76 Z',
      'M50 59 L54 59 L55 76 L51 76 Z',
      'M70 58 L75 58 L75 76 L70 76 Z',
      'M78 57 L82 57 L83 76 L78 76 Z',
    ],
    eye: [101, 39],
    gap: 5,
  },

  boar: {
    fill: [
      'M24 56 C26 43 40 33 58 33 C74 33 86 38 92 47 C96 53 92 60 82 62 C64 65 38 64 30 61 C25 59 23 58 24 56 Z',
      'M86 45 C92 43 101 46 108 52 C112 56 113 61 110 62 C105 63 96 60 90 55 C86 52 84 47 86 45 Z',
      'M36 60 L43 60 L42 77 L35 77 Z',
      'M46 61 L52 61 L53 77 L47 77 Z',
      'M72 61 L79 61 L79 77 L72 77 Z',
      'M82 59 L88 59 L89 76 L83 76 Z',
    ],
    line: [
      ['M104 58 C108 56 110 51 108 47', 2],
      ['M40 36 L42 28', 1.6],
      ['M48 33 L49 25', 1.6],
      ['M56 32 L57 24', 1.6],
      ['M64 32 L66 25', 1.6],
    ],
    eye: [99, 50],
    gap: 4,
  },

  ocelot: {
    fill: [
      'M26 47 C34 41 50 38 66 39 C78 40 86 43 88 48 C90 53 84 57 72 58 C55 59 37 58 30 55 C26 53 24 50 26 47 Z',
      'M85 44 C87 37 93 33 99 34 C105 35 108 40 107 45 C106 49 100 51 95 50 C90 49 85 47 85 44 Z',
      'M91 35 L89 28 L96 33 Z',
      'M103 34 L106 28 L108 36 Z',
      'M28 48 C19 47 11 42 7 33 C5 28 9 25 12 28 C15 32 19 41 27 44 Z',
      'M36 56 L41 56 L40 76 L35 76 Z',
      'M46 57 L51 57 L52 76 L47 76 Z',
      'M68 56 L73 56 L73 76 L68 76 Z',
      'M76 55 L81 55 L82 76 L77 76 Z',
    ],
    eye: [100, 41],
    gap: 5.5,
  },

  agouti: {
    fill: [
      'M32 60 C31 46 42 33 58 31 C74 29 88 36 92 47 C95 55 89 63 76 64 C58 66 40 65 34 63 Z',
      'M86 42 C93 40 101 44 105 50 C108 54 106 58 102 57 C95 56 87 50 86 42 Z',
      'M40 62 L45 62 L44 76 L39 76 Z',
      'M50 63 L54 63 L55 76 L50 76 Z',
      'M72 62 L77 62 L77 76 L71 76 Z',
      'M80 60 L85 60 L86 75 L80 75 Z',
    ],
    eye: [97, 48],
    gap: 3.4,
  },

  hare: {
    fill: [
      'M32 54 C34 44 45 37 60 37 C73 37 83 41 87 48 C90 53 85 60 74 61 C57 63 38 62 33 58 Z',
      'M83 44 C87 37 93 33 99 34 C104 35 106 39 104 44 C102 48 96 50 90 49 C86 48 83 46 83 44 Z',
      'M91 36 C88 24 90 12 95 7 C98 4 101 7 100 13 C98 22 96 31 95 37 Z',
      'M99 36 C99 24 103 13 107 9 C110 6 112 9 111 15 C109 24 105 32 103 38 Z',
      'M38 52 C33 56 31 63 34 68 L44 68 C43 61 45 56 48 53 Z',
      'M52 58 L56 58 L57 74 L52 74 Z',
      'M70 57 L74 57 L74 74 L69 74 Z',
      'M78 56 L82 56 L83 74 L78 74 Z',
    ],
    eye: [98, 41],
    gap: 4.4,
  },
};
