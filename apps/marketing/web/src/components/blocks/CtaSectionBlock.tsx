import { Container } from "@/components/Container";
import { Section } from "@/components/Section";
import { FadeIn } from "@/components/FadeIn";
import { Button } from "@/components/Button";
import { clsx } from "clsx";

type LinkType = {
  text?: string;
  linkType?: "internal" | "external";
  internalLink?: {
    _type: string;
    slug?: {
      current?: string;
    };
  };
  externalUrl?: string;
  openInNewTab?: boolean;
};

type CtaSectionBlockProps = {
  data: {
    heading?: string;
    description?: string;
    primaryButton?: LinkType;
    secondaryButton?: LinkType;
    backgroundVariant?: "neutral" | "accent" | "gradient";
  };
};

// Helper function to resolve link URL
function getLinkUrl(link?: LinkType): string | undefined {
  if (!link) return undefined;

  if (link.linkType === "internal" && link.internalLink) {
    // For home page
    if (link.internalLink._type === "home") {
      return "/";
    }
    // For other pages
    return `/${link.internalLink.slug?.current || ""}`;
  }

  if (link.linkType === "external" && link.externalUrl) {
    return link.externalUrl;
  }

  return undefined;
}

export function CtaSectionBlock({ data }: CtaSectionBlockProps) {
  const {
    heading,
    description,
    primaryButton,
    secondaryButton,
    backgroundVariant = "neutral",
  } = data;

  const sectionVariant =
    backgroundVariant === "accent"
      ? "dark"
      : backgroundVariant === "gradient"
        ? "gradient"
        : "muted";

  const primaryButtonUrl = getLinkUrl(primaryButton);
  const secondaryButtonUrl = getLinkUrl(secondaryButton);

  return (
    <Section variant={sectionVariant}>
      <Container>
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto">
            {heading && (
              <h2
                className={clsx(
                  "text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6",
                  backgroundVariant === "accent"
                    ? "text-white"
                    : "text-neutral-950 dark:text-white",
                )}
              >
                {heading}
              </h2>
            )}
            {description && (
              <p
                className={clsx(
                  "text-lg sm:text-xl leading-8 mb-8",
                  backgroundVariant === "accent"
                    ? "text-neutral-200"
                    : "text-neutral-600 dark:text-neutral-300",
                )}
              >
                {description}
              </p>
            )}
            {(primaryButton || secondaryButton) && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {primaryButton?.text && primaryButtonUrl && (
                  <Button href={primaryButtonUrl}>{primaryButton.text}</Button>
                )}
                {secondaryButton?.text && secondaryButtonUrl && (
                  <Button href={secondaryButtonUrl} invert>
                    {secondaryButton.text}
                  </Button>
                )}
              </div>
            )}
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
