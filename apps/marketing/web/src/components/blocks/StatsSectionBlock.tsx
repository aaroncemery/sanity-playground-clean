import { Container } from "@/components/Container";
import { Section } from "@/components/Section";
import { FadeIn } from "@/components/FadeIn";
import { clsx } from "clsx";

type StatsSectionBlockProps = {
  data: {
    title?: string;
    layout?: "2-column" | "3-column" | "4-column";
    stats?: Array<{
      value?: string;
      label?: string;
      description?: string;
    }>;
  };
};

export function StatsSectionBlock({ data }: StatsSectionBlockProps) {
  const { title, layout = "3-column", stats } = data;

  if (!stats || stats.length === 0) return null;

  return (
    <Section variant="muted">
      <Container>
        <FadeIn>
          {title && (
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950 dark:text-white mb-16 text-center">
              {title}
            </h2>
          )}

          <div
            className={clsx(
              "grid gap-8 md:gap-12",
              layout === "2-column" && "grid-cols-1 md:grid-cols-2",
              layout === "3-column" &&
                "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
              layout === "4-column" &&
                "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
            )}
          >
            {stats.map((stat, index) => (
              <FadeIn key={index} delay={index * 100}>
                <div className="group text-center p-6 rounded-2xl border border-transparent hover:border-accent/20 hover:bg-white dark:hover:bg-neutral-900 transition-all duration-300 hover:shadow-lg">
                  {stat.value && (
                    <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-accent mb-2 transition-transform duration-300 group-hover:scale-110 whitespace-nowrap">
                      {stat.value}
                    </div>
                  )}
                  {stat.label && (
                    <div className="text-lg font-semibold text-neutral-950 dark:text-white mb-2">
                      {stat.label}
                    </div>
                  )}
                  {stat.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {stat.description}
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
