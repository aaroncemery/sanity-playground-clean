import { Container } from "@/components/Container";
import { Section } from "@/components/Section";
import { FadeIn } from "@/components/FadeIn";
import { Accordion } from "@/components/Accordion";
import { PortableText } from "@portabletext/react";
import { portableTextComponents } from "@/lib/utils/ptRender";

type FaqSectionBlockProps = {
  data: {
    title?: string;
    faqs?: Array<{
      question?: string;
      answer?: any;
    }>;
  };
};

export function FaqSectionBlock({ data }: FaqSectionBlockProps) {
  const { title, faqs } = data;

  if (!faqs || faqs.length === 0) return null;

  const accordionItems = faqs
    .filter((faq) => faq.question && faq.answer)
    .map((faq) => ({
      question: faq.question!,
      answer: <PortableText value={faq.answer} components={portableTextComponents} />,
    }));

  if (accordionItems.length === 0) return null;

  return (
    <Section>
      <Container>
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            {title && (
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950 dark:text-white mb-12 text-center">
                {title}
              </h2>
            )}
            <Accordion items={accordionItems} />
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
