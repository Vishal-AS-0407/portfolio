import type { Config } from 'tailwindcss';
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        g0: '#0C0D0B', g1: '#14150F', g2: '#1D1F18',
        n1: '#3A3D34', n2: '#5E6159', n3: '#8B8E83', n4: '#B9BCB0', n5: '#EFEFE7',
        plate: '#E8E7DD', 'plate-ink': '#14150F',
        m1: '#3B0F70', m2: '#8C2981', m3: '#DE4968', m4: '#FE9F6D', m5: '#FCFDBF',
      },
      fontFamily: {
        disp: ['Archivo', 'system-ui', 'sans-serif'],
        mono: ['Martian Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
