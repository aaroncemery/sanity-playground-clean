export const portableTextComponents = {
  block: {
    h1: ({ children }: any) => (
      <h1 className="text-4xl font-bold tracking-tight text-neutral-950 mt-12 mb-6">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 mt-10 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-2xl font-semibold tracking-tight text-neutral-950 mt-8 mb-3">
        {children}
      </h3>
    ),
    normal: ({ children }: any) => (
      <p className="text-lg leading-8 text-neutral-600 mb-6">{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-neutral-200 pl-6 italic text-neutral-700 my-8">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }: any) => (
      <a
        href={value.href}
        className="text-neutral-950 underline decoration-1 underline-offset-4 hover:decoration-2"
        target={value.blank ? "_blank" : undefined}
        rel={value.blank ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-neutral-950">{children}</strong>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc list-inside space-y-2 mb-6 text-neutral-600">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-inside space-y-2 mb-6 text-neutral-600">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => <li className="leading-7">{children}</li>,
    number: ({ children }: any) => <li className="leading-7">{children}</li>,
  },
};
