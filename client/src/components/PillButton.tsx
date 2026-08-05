import { useState, type ReactNode } from 'react';

type PillButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'inverse';
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  toggleable?: boolean;
};

const base =
  'inline-flex items-center justify-center rounded-pill px-6 py-3 font-sans font-medium ' +
  'transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] ' +
  'outline-none focus-visible:ring-2 focus-visible:ring-navy/40 focus-visible:ring-offset-2 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

const variants = {
  primary: 'animate-gradient-flow bg-gradient-to-r from-navy via-sky-500 to-navy-soft text-white',
  secondary:
    'border-2 border-navy text-navy bg-white hover:text-white hover:bg-gradient-to-r hover:from-navy hover:via-sky-500 hover:to-navy-soft hover:bg-[length:200%_200%] hover:animate-gradient-flow',
  inverse: 'bg-white text-navy hover:bg-white/90',
};

export default function PillButton({
  children,
  variant = 'primary',
  onClick,
  className = '',
  type = 'button',
  disabled = false,
  toggleable = false,
}: PillButtonProps) {
  const [isOn, setIsOn] = useState(true);

  const handleClick = () => {
    if (toggleable) setIsOn((prev) => !prev);
    onClick?.();
  };

  const appliedClasses = toggleable
    ? isOn
      ? 'animate-gradient-flow bg-gradient-to-r from-navy via-sky-500 to-navy-soft text-white'
      : 'bg-gray-300 text-gray-500'
    : variants[variant];

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`${base} ${appliedClasses} ${className}`}
    >
      {children}
    </button>
  );
}