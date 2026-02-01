import { HeroBlock } from "./HeroBlock";
import { FeaturesBlock } from "./FeaturesBlock";
import { TextMediaBlock } from "./TextMediaBlock";
import { CtaSectionBlock } from "./CtaSectionBlock";
import { FaqSectionBlock } from "./FaqSectionBlock";
import { StatsSectionBlock } from "./StatsSectionBlock";
import { TestimonialsBlock } from "./TestimonialsBlock";

type Block = {
  _type: string;
  _key: string;
  [key: string]: any;
};

type BlockRendererProps = {
  block: Block;
};

export function BlockRenderer({ block }: BlockRendererProps) {
  // Remove _type and _key from the data object
  const { _type, _key, ...data } = block;

  switch (_type) {
    case "hero":
      return <HeroBlock data={data} />;
    case "features":
      return <FeaturesBlock data={data} />;
    case "textMedia":
      return <TextMediaBlock data={data} />;
    case "ctaSection":
      return <CtaSectionBlock data={data} />;
    case "faqSection":
      return <FaqSectionBlock data={data} />;
    case "statsSection":
      return <StatsSectionBlock data={data} />;
    case "testimonials":
      return <TestimonialsBlock data={data} />;
    default:
      console.warn(`Unknown block type: ${_type}`);
      return null;
  }
}
