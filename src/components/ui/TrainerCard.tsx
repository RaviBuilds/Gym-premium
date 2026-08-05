import Image from "next/image";
import { Card, CardMedia } from "./Card";
import { Heading, BodyText } from "./Heading";
import { Badge } from "./Badge";
import type { Trainer } from "@/types/content";

/**
 * TrainerCard — Homepage-Architecture.md §5 Meet the Trainers, Design-System.md §7.
 *
 * Not a link — per Homepage-Architecture.md: "No hard CTA per card required —
 * trainers reinforce trust rather than directly converting." Name/title are
 * always visible (never hover-reveal-only, since touch has no hover — a hard
 * requirement from that section's accessibility note).
 *
 * No image zoom on hover, unlike ProgramCard: per Design-System.md §6,
 * "a trainer's face zooming on hover can feel slightly uncanny at close
 * crop — reserve zoom for action/program shots... not portraits." Hover
 * feedback instead comes from a small accent underline growing beneath the
 * name (`group-hover`, `Card` is not the hover target itself since it has
 * no `group` class of its own — added here on a wrapping div) plus Card's
 * existing default lift/shadow.
 *
 * `ratio="portrait"` swapped for a taller `aspect-[3/4]` override — the
 * elevation brief's "trainers should feel like elite coaches with large
 * photography" ask, without introducing a fourth CardMedia ratio token for
 * a one-section-only variant.
 */
export function TrainerCard({ trainer }: { trainer: Trainer }) {
  return (
    <div className="group h-full">
      <Card className="flex h-full flex-col">
        <CardMedia ratio="portrait" className="aspect-[3/4]">
          <Image
            src={trainer.imageSrc}
            alt={trainer.imageAlt}
            fill
            sizes="(min-width: 1024px) 16vw, (min-width: 640px) 45vw, 85vw"
            className="object-cover"
          />
          {trainer.achievementBadge && (
            <div className="absolute left-3 top-3 z-10">
              <Badge variant="achievement">{trainer.achievementBadge}</Badge>
            </div>
          )}
        </CardMedia>
        <Heading level="subsection" as="h3" className="text-ink">
          <span className="bg-linear-to-r from-brand-yellow to-brand-yellow bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-300 ease-out group-hover:bg-[length:100%_2px]">
            {trainer.name}
          </span>
        </Heading>
        <BodyText size="standard" className="mt-1 text-text-secondary">
          {trainer.title}
        </BodyText>
      </Card>
    </div>
  );
}
