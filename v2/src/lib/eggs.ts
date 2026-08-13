/* Easter eggs. Console art, a hire() hook, and a few typed keys. */
import { profile } from '@/data/content';

export function registerEggs() {
  console.log(
    '%c  gradient descent  ',
    'background:#3B0F70;color:#FCFDBF;font:600 13px/2.4 monospace;letter-spacing:.35em'
  );
  console.log(
    '%cepoch 100 · loss 0.0041 · converged\n%ctype "overfit", "e4" or run hire()',
    'color:#DE4968;font:12px monospace',
    'color:#5E6159;font:12px monospace'
  );

  (window as unknown as { hire: () => string }).hire = () => {
    console.log(
      `%c ${profile.email} `,
      'background:#DE4968;color:#0C0D0B;font:600 14px/2 monospace'
    );
    return '↑';
  };

  let keys = '';
  window.addEventListener('keydown', (e) => {
    keys = (keys + e.key).slice(-10);

    if (keys.includes('overfit')) {
      keys = '';
      document.body.style.filter = 'saturate(2.5) contrast(1.3)';
      console.log('%coverfitting — val loss climbing. rolling back in 3s.', 'color:#FE9F6D;font:12px monospace');
      setTimeout(() => { document.body.style.filter = ''; }, 3000);
    }

    /* 100+ tournaments deserve one move */
    if (keys.endsWith('e4')) {
      keys = '';
      console.log('%c1. e4 — best by test.', 'color:#FCFDBF;font:12px monospace');
      document.documentElement.style.setProperty('--accent', '252 253 191');
      setTimeout(() => { document.documentElement.style.removeProperty('--accent'); }, 4000);
    }
  });
}
