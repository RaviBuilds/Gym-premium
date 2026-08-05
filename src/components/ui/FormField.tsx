import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * FormField — Component-Architecture.md §8 "FormField".
 *
 * Real, persistent <label> elements — never placeholder-only text standing
 * in for a label, per §13 Accessibility. Shares the same focus/error
 * visual language as the rest of the input system (yellow focus ring is
 * inherited automatically from the global :focus-visible rule in
 * globals.css — no extra focus styling needed here).
 */
const fieldBaseStyles =
  "w-full rounded-card border border-border-subtle bg-surface-card px-4 py-3 font-body text-body text-text-primary " +
  "placeholder:text-text-secondary transition-colors duration-150 focus:border-brand-yellow";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, id, className, ...props },
  ref
) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const errorId = `${fieldId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="font-body text-caption font-semibold text-text-primary">
        {label}
      </label>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
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
  { label, options, error, id, className, ...props },
  ref
) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="font-body text-caption font-semibold text-text-primary">
        {label}
      </label>
      <select ref={ref} id={fieldId} className={cn(fieldBaseStyles, className)} {...props}>
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

/** Grouped checkboxes (e.g. Morning/Evening time-slot selection) using a real <fieldset>/<legend> pair for group semantics. */
export function CheckboxGroup({ legend, name, options }: CheckboxGroupProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 font-body text-caption font-semibold text-text-primary">{legend}</legend>
      <div className="flex flex-wrap gap-4">
        {options.map((option) => {
          const fieldId = `${name}-${option.value}`;
          return (
            // min-h-11 (44px) meets the mobile touch-target minimum — the 20px
            // checkbox alone falls well short of it, so the label's own
            // clickable area (checkbox + text) is padded out to compensate.
            <label
              key={option.value}
              htmlFor={fieldId}
              className="flex min-h-11 items-center gap-2 py-2"
            >
              <input
                type="checkbox"
                id={fieldId}
                name={name}
                value={option.value}
                className="size-5 rounded-none border-border-subtle text-brand-yellow focus:ring-brand-yellow"
              />
              <span className="font-body text-body text-text-primary">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
