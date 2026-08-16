import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * FormField — Premium styled form inputs.
 *
 * Upgraded from default browser styling to:
 *   - Larger padding for comfortable touch targets
 *   - Subtle inner shadow for depth
 *   - Softer borders at rest
 *   - Gold focus ring glow (not just outline)
 *   - Smooth transition on focus
 */
const fieldBaseStyles =
  "w-full rounded-card border border-ink/10 bg-surface-card px-5 py-3.5 font-body text-body text-text-primary " +
  "shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] " +
  "placeholder:text-text-secondary/60 " +
  "transition-[border-color,box-shadow] duration-200 ease-out " +
  "focus:border-brand-yellow focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.03),0_0_0_3px_rgba(255,222,1,0.1)] focus:outline-none";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, id, className, required, ...props },
  ref
) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const errorId = `${fieldId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="font-body text-caption font-semibold text-text-primary">
        {label}
        {required && <span className="ml-0.5 text-brand-yellow/60">*</span>}
      </label>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        required={required}
        className={cn(fieldBaseStyles, error && "border-error", className)}
        {...props}
      />
      {error && (
        <p id={errorId} className="font-body text-caption text-error">
          {error}
        </p>
      )}
    </div>
  );
});

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, options, error, id, className, required, ...props },
  ref
) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="font-body text-caption font-semibold text-text-primary">
        {label}
        {required && <span className="ml-0.5 text-brand-yellow/60">*</span>}
      </label>
      <select ref={ref} id={fieldId} required={required} className={cn(fieldBaseStyles, "appearance-none", className)} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="font-body text-caption text-error">{error}</p>}
    </div>
  );
});

export interface CheckboxGroupProps {
  legend: string;
  name: string;
  options: { value: string; label: string }[];
}

export function CheckboxGroup({ legend, name, options }: CheckboxGroupProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 font-body text-caption font-semibold text-text-primary">{legend}</legend>
      <div className="flex flex-wrap gap-4">
        {options.map((option) => {
          const fieldId = `${name}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={fieldId}
              className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-card border border-ink/10 px-4 py-2.5 transition-[border-color,background-color] duration-200 hover:border-brand-yellow/30 hover:bg-brand-yellow/[0.03] has-[:checked]:border-brand-yellow/40 has-[:checked]:bg-brand-yellow/[0.05]"
            >
              <input
                type="checkbox"
                id={fieldId}
                name={name}
                value={option.value}
                className="size-4 rounded-sm border-ink/20 text-brand-yellow accent-brand-yellow focus:ring-brand-yellow/30"
              />
              <span className="font-body text-body text-text-primary">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
