"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Sparkles, CheckCircle } from "lucide-react";
import { TextField, SelectField, CheckboxGroup } from "./FormField";
import { Button } from "./Button";
import { Heading, BodyText } from "./Heading";
import { Icon } from "./Icon";

/**
 * TrialBookingForm — Premium form with sparkle CTA, full-width button,
 * and polished success state with celebration.
 */
export function TrialBookingForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    // TODO: wire to real API endpoint
    window.setTimeout(() => setStatus("success"), 600);
  }

  if (status === "success") {
    return (
      <div role="status" className="flex flex-col items-center gap-4 rounded-card border border-brand-yellow/30 bg-brand-yellow/[0.04] p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-brand-yellow/10">
          <Icon icon={CheckCircle} size="xl" className="text-brand-yellow" />
        </div>
        <Heading level="subsection" as="h3" className="text-ink">
          You&apos;re booked in!
        </Heading>
        <BodyText className="max-w-xs text-text-secondary">
          We&apos;ll reach out shortly to confirm your free trial slot. Get ready to train.
        </BodyText>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" aria-busy={status === "submitting"}>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Full Name" name="name" type="text" autoComplete="name" required placeholder="Your full name" />
        <TextField label="Phone Number" name="phone" type="tel" autoComplete="tel" required placeholder="+91 98765 43210" />
      </div>
      <TextField label="Email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
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
      <Button
        type="submit"
        variant="primary"
        isLoading={status === "submitting"}
        icon={status !== "submitting" ? <Sparkles className="size-4" /> : undefined}
        className="w-full justify-center sm:w-auto sm:self-stretch"
      >
        {status === "submitting" ? "Sending..." : "Book Free Trial"}
      </Button>
    </form>
  );
}
