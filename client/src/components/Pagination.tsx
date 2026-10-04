import type { ReactNode } from 'react';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight } from 'react-icons/fa';

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

type PageToken = number | 'ellipsis-start' | 'ellipsis-end';

// Always shows the first and last page, plus the current page and one neighbour on each side.
// When the current page is near an edge, the first/last 3 pages show, e.g. 1 2 3 … 10 or 1 … 4 5 6 … 10.
function getPageTokens(page: number, totalPages: number): PageToken[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const start = Math.max(2, Math.min(page - 1, totalPages - 3));
  const end = Math.min(totalPages - 1, Math.max(page + 1, 3));

  const tokens: PageToken[] = [1];
  if (start > 2) tokens.push('ellipsis-start');
  for (let p = start; p <= end; p++) tokens.push(p);
  if (end < totalPages - 1) tokens.push('ellipsis-end');
  tokens.push(totalPages);
  return tokens;
}

const buttonBase =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2 font-sans text-sm ' +
  'transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-navy/40 ' +
  'disabled:cursor-not-allowed disabled:opacity-30';

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`${buttonBase} text-ink/70 hover:bg-navy/5 hover:text-navy disabled:hover:bg-transparent`}
    >
      {children}
    </button>
  );
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  // The site is RTL: "first/previous" sit on the right and point right, "next/last" point left.
  return (
    <nav
      aria-label="ניווט בין עמודים"
      className="flex shrink-0 flex-wrap items-center justify-center gap-1 border-t border-ink/10 py-3"
    >
      <NavButton label="עמוד ראשון" disabled={isFirst} onClick={() => onPageChange(1)}>
        <FaAngleDoubleRight />
      </NavButton>
      <NavButton label="עמוד קודם" disabled={isFirst} onClick={() => onPageChange(page - 1)}>
        <FaAngleRight />
      </NavButton>

      {getPageTokens(page, totalPages).map((token) =>
        typeof token === 'number' ? (
          <button
            key={token}
            type="button"
            aria-label={`עמוד ${token}`}
            aria-current={token === page ? 'page' : undefined}
            onClick={() => onPageChange(token)}
            className={`${buttonBase} ${
              token === page ? 'bg-navy font-bold text-white' : 'text-ink hover:bg-navy/5 hover:text-navy'
            }`}
          >
            {token}
          </button>
        ) : (
          <span key={token} className="px-1 font-sans text-sm text-ink/40" aria-hidden="true">
            …
          </span>
        ),
      )}

      <NavButton label="עמוד הבא" disabled={isLast} onClick={() => onPageChange(page + 1)}>
        <FaAngleLeft />
      </NavButton>
      <NavButton label="עמוד אחרון" disabled={isLast} onClick={() => onPageChange(totalPages)}>
        <FaAngleDoubleLeft />
      </NavButton>
    </nav>
  );
}
