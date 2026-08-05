"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { TextField, SelectField, CheckboxGroup } from "./FormField";
import { Button } from "./Button";
import { Heading, BodyText } from "./Heading";

/**
 * TrialBookingForm — Component-Architecture.md §8 "TrialBookingForm".
 *
 * Field structure matches the real, existing free-trial form already on
 * the live site (name/email/phone/preferred day/branch/time-slot) — per
 * 08-conversion-strategy.md, this structure is "already reasonable and
 * doesn't need reinvention, just better visual integration."
 *
 * No backend/API route exists yet in this codebase, so submission is a
 * client-side stub (see the comment in handleSubmit below) rather than a
 * real network call — building a fake-success form that silently drops
 * real lead data would be worse than being explicit about the gap. This is
 * flagged clearly for whoever wires up the real submission endpoint.
 */
export function TrialBookingForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    // TODO: no backend endpoint exists yet — wire this to a real API route
    // (or a third-party form service) before this form goes live. Left as
    // an explicit stub rather than a real fetch() to a non-existent route.
    window.setTimeout(() => setStatus("success"), 600);
  }

  if (status === "success") {
    return (
      <div role="status" className="flex flex-col gap-2 rounded-card border border-brand-yellow bg-surface-card p-6">
        <Heading level="subsection" as="h3" className="text-ink">
          You&apos;re booked in.
        </Heading>
        <BodyText className="text-text-secondary">
          We&apos;ll reach out shortly to confirm your free trial slot.
        </BodyText>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" aria-busy={status === "submitting"}>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Full Name" name="name" type="text" autoComplete="name" required />
        <TextField label="Phone Number" name="phone" type="tel" autoComplete="tel" required />
      </div>
      <TextField label="Email" name="email" type="email" autoComplete="email" required />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Branch"
          name="branch"
          required
          options={[
            { value: "", label: "Select a branch" },
            { value: "gachibowli", label: "Gachibowli" },
            { value: "rethibowli", label: "Rethibowli" },
          ]}
        />
        <TextField label="Preferred Day" name="preferredDay" type="date" required />
      </div>
      <CheckboxGroup
        legend="Preferred Time"
        name="timeSlot"
        options={[
          { value: "morning", label: "Morning (6AM–11AM)" },
          { value: "evening", label: "Evening (5PM–10PM)" },
        ]}
      />
      <Button type="submit" variant="primary" isLoading={status === "submitting"} className="self-start">
        {status === "submitting" ? "Sending..." : "Book Free Trial"}
      </Button>
    </form>
  );
}
