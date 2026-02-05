import { Container } from "@/components/Container";
import { Section } from "@/components/Section";
import { FadeIn } from "@/components/FadeIn";
import { clsx } from "clsx";

type FeaturesBlockProps = {
  data: {
    title?: string;
    description?: string;
    layout?: "2-column" | "3-column";
    features?: Array<{
      icon?: string;
      title?: string;
      description?: string;
    }>;
  };
};

export function FeaturesBlock({ data }: FeaturesBlockProps) {
  const { title, description, layout = "3-column", features } = data;

  if (!features || features.length === 0) return null;

  return (
    <Section>
      <Container>
        <FadeIn>
          {/* Section Header */}
          {(title || description) && (
            <div className="text-center mb-16 max-w-3xl mx-auto">
              {title && (
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-950 dark:text-white mb-4">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-lg text-neutral-600 dark:text-neutral-300">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Features Grid */}
          <div
            className={clsx(
              "grid gap-8 md:gap-12",
              layout === "2-column"
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {features.map((feature, index) => (
              <FadeIn key={index} delay={index * 100}>
                <div className="group h-full p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-all duration-300 hover:border-accent hover:shadow-lg hover:-translate-y-1">
                  {/* Icon */}
                  {feature.icon && (
                    <div className="mb-4 text-4xl transition-transform duration-300 group-hover:scale-110">
                      {feature.icon}
                    </div>
                  )}

                  {/* Title */}
                  {feature.title && (
                    <h3 className="text-xl font-semibold text-neutral-950 dark:text-white mb-3 transition-colors duration-300 group-hover:text-accent">
                      {feature.title}
                    </h3>
                  )}

                  {/* Description */}
                  {feature.description && (
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {feature.description}
                    </p>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
