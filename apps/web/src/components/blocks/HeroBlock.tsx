import { Container } from "@/components/Container";
import { Section } from "@/components/Section";
import { FadeIn } from "@/components/FadeIn";
import { Button } from "@/components/Button";
import {
  urlFor,
  getImageBlurData,
  getImageDimensions,
} from "@/lib/sanity/image";
import Image from "next/image";
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

type HeroBlockProps = {
  data: {
    headline?: string;
    subtext?: string;
    primaryCta?: LinkType;
    secondaryCta?: LinkType;
    media?: any;
    variant?: "centered" | "left-aligned";
    backgroundVariant?: "light" | "dark" | "gradient";
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

export function HeroBlock({ data }: HeroBlockProps) {
  const {
    headline,
    subtext,
    primaryCta,
    secondaryCta,
    media,
    variant = "centered",
    backgroundVariant = "light",
  } = data;

  const sectionVariant =
    backgroundVariant === "dark"
      ? "dark"
      : backgroundVariant === "gradient"
        ? "gradient"
        : "default";

  // Debug: Log the media object structure
  if (media) {
    console.log("Hero media object:", JSON.stringify(media, null, 2));
    console.log("Has asset?", !!media.asset);
    console.log("Has asset._ref?", media.asset?._ref);
    console.log("Has asset.metadata?", !!media.asset?.metadata);
  }

  // Check if image is valid - either has _ref OR has metadata (Media Library format)
  const hasValidImage =
    media && media.asset && (media.asset._ref || media.asset.metadata);

  // For Media Library images without _ref, get dimensions from metadata directly
  const dimensions = hasValidImage
    ? media.asset.metadata?.dimensions || getImageDimensions(media)
    : null;

  const blurData = hasValidImage
    ? media.asset.metadata?.lqip || getImageBlurData(media)
    : null;

  const primaryCtaUrl = getLinkUrl(primaryCta);
  const secondaryCtaUrl = getLinkUrl(secondaryCta);

  return (
    <Section variant={sectionVariant}>
      <Container>
        <FadeIn>
          <div
            className={clsx(
              "flex flex-col gap-12",
              variant === "centered"
                ? "items-center text-center"
                : "items-start text-left lg:flex-row lg:items-center",
            )}
          >
            {/* Content */}
            <div
              className={clsx(
                variant === "centered" ? "max-w-4xl" : "lg:flex-1",
              )}
            >
              {headline && (
                <h1
                  className={clsx(
                    "text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6",
                    backgroundVariant === "dark"
                      ? "text-white"
                      : "text-neutral-950 dark:text-white",
                  )}
                >
                  {headline}
                </h1>
              )}
              {subtext && (
                <p
                  className={clsx(
                    "text-lg sm:text-xl leading-8 mb-8",
                    backgroundVariant === "dark"
                      ? "text-neutral-200"
                      : "text-neutral-600 dark:text-neutral-300",
                  )}
                >
                  {subtext}
                </p>
              )}
              {(primaryCta || secondaryCta) && (
                <div
                  className={clsx(
                    "flex flex-col sm:flex-row gap-4",
                    variant === "centered" ? "justify-center" : "justify-start",
                  )}
                >
                  {primaryCta?.text && primaryCtaUrl && (
                    <Button href={primaryCtaUrl}>{primaryCta.text}</Button>
                  )}
                  {secondaryCta?.text && secondaryCtaUrl && (
                    <Button href={secondaryCtaUrl} invert>
                      {secondaryCta.text}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Media */}
            {hasValidImage && dimensions && (
              <div
                className={clsx(
                  "relative w-full group",
                  variant === "centered" ? "max-w-4xl" : "lg:flex-1",
                )}
              >
                <Image
                  src={urlFor(media).width(1200).height(675).url()}
                  alt={media.alt || headline || "Hero image"}
                  width={dimensions.width}
                  height={dimensions.height}
                  className="rounded-2xl shadow-2xl transition-all duration-500 group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] group-hover:scale-[1.02]"
                  placeholder={blurData ? "blur" : "empty"}
                  blurDataURL={blurData || undefined}
                  priority
                />
              </div>
            )}
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
