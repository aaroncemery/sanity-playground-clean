import { Container } from "@/components/Container";
import { Section } from "@/components/Section";
import { FadeIn } from "@/components/FadeIn";
import { urlFor } from "@/lib/sanity/image";
import Image from "next/image";
import { Quote } from "lucide-react";

type TestimonialsBlockProps = {
  data: {
    title?: string;
    testimonials?: Array<{
      quote?: string;
      author?: string;
      role?: string;
      company?: string;
      avatar?: any;
    }>;
  };
};

export function TestimonialsBlock({ data }: TestimonialsBlockProps) {
  const { title, testimonials } = data;

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <Section>
      <Container>
        <FadeIn>
          {title && (
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950 dark:text-white mb-16 text-center">
              {title}
            </h2>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <FadeIn key={index} delay={index * 100}>
                <div className="group h-full bg-surface dark:bg-neutral-800 rounded-2xl p-8 shadow-sm border border-transparent hover:border-accent/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <Quote className="h-8 w-8 text-accent mb-4 transition-transform duration-300 group-hover:scale-110" />

                  {testimonial.quote && (
                    <blockquote className="text-neutral-700 dark:text-neutral-200 mb-6 leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                  )}

                  <div className="flex items-center gap-4">
                    {testimonial.avatar ? (
                      <Image
                        src={urlFor(testimonial.avatar)
                          .width(48)
                          .height(48)
                          .url()}
                        alt={testimonial.author || "Testimonial author"}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-accent font-semibold">
                          {testimonial.author?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}

                    <div>
                      {testimonial.author && (
                        <div className="font-semibold text-neutral-950 dark:text-white">
                          {testimonial.author}
                        </div>
                      )}
                      {(testimonial.role || testimonial.company) && (
                        <div className="text-sm text-neutral-600 dark:text-neutral-300">
                          {[testimonial.role, testimonial.company]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
