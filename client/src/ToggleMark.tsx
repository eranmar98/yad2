import { useState } from 'react';

type ToggleMarkProps = {
  className?: string;
};

export default function ToggleMark({ className = "h-8 w-14" }: ToggleMarkProps) {
  const [isOn, setIsOn] = useState(true);

  return (
    <button
      type="button"
      onClick={() => setIsOn((prev) => !prev)}
      dir="ltr"
      className={`inline-flex items-center rounded-pill p-1 transition-[background-color,transform] duration-150 ease-out hover:scale-105 ${
        isOn
          ? 'animate-gradient-flow justify-end bg-gradient-to-r from-navy via-sky-500 to-navy-soft'
          : 'justify-start bg-gray-300'
      } ${className}`}
    >
      <span className="aspect-square h-full rounded-full bg-white transition-all duration-200 ease-out" />
    </button>
  );
}