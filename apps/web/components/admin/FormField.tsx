interface Props {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, hint, error, required, children }: Props) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-bold mb-1.5 text-ink uppercase tracking-wide"
      >
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-xs text-ink/60">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs font-bold text-primary">{error}</p>
      )}
    </div>
  );
}
