import type { ReactNode } from 'react';

type PillButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
};

export default function PillButton({
  children,
  variant = 'primary',
  onClick,
  className = '',
  type = 'button',
  disabled = false,
}: PillButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-pill px-6 py-3 font-sans font-medium ' +
    'transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] ' +
    'outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const variants = {
    primary: 'bg-lime text-ink hover:bg-lime-soft',
    secondary: 'bg-ink text-lime hover:bg-ink/90',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}