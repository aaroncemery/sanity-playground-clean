import { Container } from "@/components/Container";
import { Section } from "@/components/Section";
import { FadeIn } from "@/components/FadeIn";
import { PortableText } from "@portabletext/react";
import { portableTextComponents } from "@/lib/utils/ptRender";
import {
  urlFor,
  getImageBlurData,
  getImageDimensions,
} from "@/lib/sanity/image";
import Image from "next/image";
import { clsx } from "clsx";

type TextMediaBlockProps = {
  data: {
    heading?: string;
    content?: any;
    media?: any;
    mediaPosition?: "left" | "right";
    reverse?: boolean;
  };
};

export function TextMediaBlock({ data }: TextMediaBlockProps) {
  const {
    heading,
    content,
    media,
    mediaPosition = "right",
    reverse = false,
  } = data;

  const dimensions = media ? getImageDimensions(media) : null;
  const blurData = media ? getImageBlurData(media) : null;

  // Determine the actual position considering reverse flag
  const isMediaRight = reverse
    ? mediaPosition === "left"
    : mediaPosition === "right";

  return (
    <Section>
      <Container>
        <FadeIn>
          <div
            className={clsx(
              "flex flex-col lg:flex-row items-center gap-12 lg:gap-16",
              isMediaRight ? "lg:flex-row" : "lg:flex-row-reverse",
            )}
          >
            {/* Text Content */}
            <div className="flex-1">
              {heading && (
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950 dark:text-white mb-6">
                  {heading}
                </h2>
              )}
              {content && (
                <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
                  <PortableText
                    value={content}
                    components={portableTextComponents}
                  />
                </div>
              )}
            </div>

            {/* Media */}
            {media && dimensions && (
              <div className="flex-1 w-full group">
                <Image
                  src={urlFor(media).width(800).height(600).url()}
                  alt={media.alt || heading || "Section image"}
                  width={dimensions.width}
                  height={dimensions.height}
                  className="rounded-2xl shadow-lg w-full transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02]"
                  placeholder={blurData ? "blur" : "empty"}
                  blurDataURL={blurData || undefined}
                />
              </div>
            )}
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
