type FormFieldProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
};

export default function FormField({
  label,
  type = 'text',
  value,
  onChange,
  required,
  placeholder,
  autoComplete,
}: FormFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-right">
      <span className="font-sans text-sm text-ink/70">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-ink/15 bg-white px-4 py-2 font-sans text-ink outline-none transition-colors duration-150 ease-out focus:border-ink focus-visible:ring-2 focus-visible:ring-ink/20"
      />
    </label>
  );
}
