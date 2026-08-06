import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";
import { primaryNav } from "@/config/nav";
import { Icon } from "@/components/ui/Icon";
import { Heading, BodyText, Eyebrow } from "@/components/ui/Heading";
import { TrialBookingForm } from "@/components/ui/TrialBookingForm";
import { Container } from "./Container";

/**
 * Footer — Homepage-Architecture.md "Footer" (persistent/global element),
 * Component-Architecture.md §7 "Footer" + "LocationCard (footer variant)" +
 * "FooterBrandSignature" + "CopyrightBar".
 *
 * Only real, working links are included — per the original audit's dead-
 * link findings (01-business-analysis.md: 11+ footer links on the live
 * site point to a non-www domain not captured in the mirror). This footer
 * intentionally omits Awards/Jobs/Franchise/etc. until those pages
 * actually exist, rather than re-promising them.
 *
 * Copyright year is computed at request time (new Date().getFullYear()),
 * not hardcoded — this file has no "use client" directive, so it renders
 * as a Server Component and that computation happens once per request on
 * the server, not on every client re-render.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white">
      <Container>
        <div className="grid gap-12 py-16 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <div>
              <Eyebrow>Wanna Try Before You Buy?</Eyebrow>
              <Heading level="section" as="h2" className="mt-2 text-white">
                Sign Up for a Free Trial
              </Heading>
            </div>
            <div id="free-trial" className="rounded-card bg-white p-6 lg:p-8">
              <TrialBookingForm />
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {Object.values(siteConfig.branches).map((branch) => (
              <div key={branch.name} className="flex flex-col gap-3">
                <Heading level="subsection" as="h3" className="text-white">
                  {branch.name}
                </Heading>
                <div className="flex items-start gap-2">
                  <Icon
                    icon={MapPin}
                    size="sm"
                    className="mt-0.5 text-text-secondary-dark"
                  />
                  <BodyText
                    size="standard"
                    className="text-text-secondary-dark"
                  >
                    {branch.address}
                  </BodyText>
                </div>
                <div className="flex items-start gap-2">
                  <Icon
                    icon={Clock}
                    size="sm"
                    className="mt-0.5 text-text-secondary-dark"
                  />
                  <BodyText
                    size="standard"
                    className="text-text-secondary-dark"
                  >
                    {branch.hours.days} · {branch.hours.unisex}
                    {branch.hours.ladiesOnly && (
                      <>
                        <br />
                        Ladies Only · {branch.hours.ladiesOnly}
                      </>
                    )}
                  </BodyText>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 border-t border-border-dark py-12 sm:grid-cols-3">
          <div className="flex flex-col gap-3">
            <Heading level="subsection" as="h3" className="text-white">
              Explore
            </Heading>
            <nav aria-label="Footer">
              <ul className="flex flex-col">
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    {/* min-h-11 (44px) meets the mobile touch-target minimum — §12 Mobile Experience */}
                    <Link
                      href={item.href}
                      // Exit-easing asymmetry: color-in 150ms, color-out 300ms.
                      // background-size underline affordance on hover/focus
                      // (no layout properties).
                      className="group flex min-h-11 items-center font-body text-body text-text-secondary-dark transition-[color,background-size] duration-300 ease-out hover:text-white hover:duration-150 bg-linear-to-r from-brand-yellow to-brand-yellow bg-[length:0%_1px] bg-left-bottom bg-no-repeat hover:bg-[length:100%_1px] focus-visible:bg-[length:100%_1px] focus-visible:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex flex-col">
            <Heading level="subsection" as="h3" className="mb-3 text-white">
              Contact
            </Heading>
            <a
              href={`tel:${siteConfig.contact.phones[0]?.replace(/\s+/g, "")}`}
              className="flex min-h-11 items-center gap-2 font-body text-body text-text-secondary-dark transition-colors duration-300 ease-out hover:text-white hover:duration-150"
            >
              <Icon icon={Phone} size="sm" />
              {siteConfig.contact.phones[0]}
            </a>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="flex items-center gap-2 font-body text-body text-text-secondary-dark transition-colors duration-300 ease-out hover:text-white hover:duration-150"
            >
              <Icon icon={Mail} size="sm" />
              {siteConfig.contact.email}
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <Image
              src="/images/brand/logo.png"
              alt="Infiniti Fitness"
              width={741}
              height={222}
              className="h-9 w-auto"
            />
            <BodyText size="caption" className="text-text-secondary-dark">
              {siteConfig.tagline}
            </BodyText>
          </div>
        </div>

        <div className="border-t border-border-dark py-6">
          <BodyText size="caption" className="text-text-secondary-dark">
            © {year} {siteConfig.name}. All rights reserved.
          </BodyText>
        </div>
      </Container>
    </footer>
  );
}
