/* The one piece of furniture every project page shares.
   It ships no colour, no face and no size — each page styles `.pj-back` and
   `.pj-back__label` inside its own scope, so the same element reads as a
   nursery-monitor label on one page and a rubber-stamped drawer tab on another. */
import { Link } from 'react-router-dom';

export default function BackLink({
  label = 'Index',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <Link to="/" className={`pj-back ${className}`.trim()} aria-label="Back to the index">
      <svg className="pj-back__arrow" viewBox="0 0 24 12" aria-hidden="true" focusable="false">
        <path d="M23 6H1M7 1 1 6l6 5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      <span className="pj-back__label">{label}</span>
    </Link>
  );
}
