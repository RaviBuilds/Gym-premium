import Image from "next/image";
import { MapPin, Clock } from "lucide-react";
import { Card, CardMedia } from "./Card";
import { Heading, BodyText } from "./Heading";
import { Badge } from "./Badge";
import { ButtonLink } from "./Button";
import { Icon } from "./Icon";
import type { LocationSummary } from "@/types/content";

/**
 * LocationCard — Homepage-Architecture.md §7 Two Locations, One Standard.
 *
 * Uses CardMedia ratio="landscape" (16:10) for both Program and Location
 * cards per Design-System.md §7's documented ratio table — the spec's
 * separate "16:9 for Location cards" note was normalized to the same
 * landscape token as Program cards when CardMedia was built, to avoid a
 * fourth near-duplicate aspect ratio for a visually negligible difference.
 *
 * The ladies-only slot badge pairs an explicit informational Badge (color +
 * real text, never a color-only dot) per §13 Accessibility — this is a real
 * scheduling detail, not decoration.
 */
export function LocationCard({ location }: { location: LocationSummary }) {
  return (
    <Card className="flex h-full flex-col">
      <CardMedia ratio="landscape">
        <Image
          src={location.imageSrc}
          alt={location.imageAlt}
          fill
          sizes="(min-width: 1024px) 45vw, 90vw"
          className="object-cover"
        />
      </CardMedia>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Heading level="subsection" as="h3" className="text-ink">
            {location.name}
          </Heading>
          {location.ladiesOnlySlot && (
            <Badge variant="informational">{`Ladies Only · ${location.ladiesOnlySlot}`}</Badge>
          )}
        </div>

        <div className="flex items-start gap-2">
          <Icon icon={MapPin} size="sm" className="mt-0.5 text-text-secondary" />
          <BodyText size="standard" className="text-text-secondary">
            {location.address}
          </BodyText>
        </div>

        <div className="flex items-start gap-2">
          <Icon icon={Clock} size="sm" className="mt-0.5 text-text-secondary" />
          <BodyText size="standard" className="text-text-secondary">
            {location.hoursSummary}
          </BodyText>
        </div>

        <ButtonLink href={location.href} variant="secondary" size="compact" className="mt-auto self-start">
          {`View ${location.name} Details`}
        </ButtonLink>
      </div>
    </Card>
  );
}
