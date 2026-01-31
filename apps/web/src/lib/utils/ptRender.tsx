import type {
  PortableTextComponents,
  PortableTextMarkComponentProps,
} from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

type LinkValue = {
  _type: "link";
  href?: string;
  blank?: boolean;
};

export const portableTextComponents: PortableTextComponents = {
  block: {
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold tracking-tight text-neutral-950 mt-12 mb-6">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 mt-10 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-semibold tracking-tight text-neutral-950 mt-8 mb-3">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="text-lg leading-8 text-neutral-600 mb-6">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-neutral-200 pl-6 italic text-neutral-700 my-8">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }: PortableTextMarkComponentProps<LinkValue>) => (
      <a
        href={value?.href}
        className="text-neutral-950 underline decoration-1 underline-offset-4 hover:decoration-2"
        target={value?.blank ? "_blank" : undefined}
        rel={value?.blank ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),
    strong: ({ children }: PortableTextMarkComponentProps) => (
      <strong className="font-semibold text-neutral-950">{children}</strong>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-6 text-neutral-600">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-6 text-neutral-600">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-7">{children}</li>,
    number: ({ children }) => <li className="leading-7">{children}</li>,
  },
};
