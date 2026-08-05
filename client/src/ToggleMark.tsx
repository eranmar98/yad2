// אייקון הלוגו: גלולה שחורה עם נקודת ליים - כמו מתג הפעלה.
// dir="ltr" מקובע במכוון כדי שהלוגו לא "יתהפך" גם כשהאתר כולו ב-RTL
type ToggleMarkProps = {
    className?: string;
  };
  
  export default function ToggleMark({ className = "h-8 w-14" }: ToggleMarkProps) {
    return (
      <span
        dir="ltr"
        className={`inline-flex items-center justify-end rounded-pill bg-ink p-1 transition-transform duration-150 ease-out group-hover:scale-105 ${className}`}
      >
        <span className="aspect-square h-full rounded-full bg-lime" />
      </span>
    );
  }