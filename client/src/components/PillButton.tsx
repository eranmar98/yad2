import type { ReactNode } from 'react';

type PillButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
};

export default function PillButton({
  children,
  variant = 'primary',
  onClick,
  className = '',
  type = 'button',
}: PillButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-pill px-6 py-3 font-sans font-medium transition-colors';

  const variants = {
    primary: 'bg-lime text-ink hover:bg-lime-soft',
    secondary: 'bg-ink text-lime hover:bg-ink/90',
  };

  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}