import { sanityFetch } from "@/lib/sanity/live";
import { HOME } from "@/lib/sanity/queries";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import type { Metadata } from "next";

async function getHomePage() {
  const response = await sanityFetch({
    query: HOME,
  });

  return response.data;
}

export default async function Home() {
  const page = await getHomePage();

  // If no homepage exists yet, show a placeholder
  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-neutral-950 dark:text-white mb-4">
            Welcome to DevTools
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8">
            Create the Homepage document in Sanity Studio to get started.
          </p>
          <a
            href="http://localhost:3333"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover transition-all duration-300"
          >
            Open Sanity Studio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {page.pageSections?.map((section: any) => (
        <BlockRenderer key={section._key} block={section} />
      ))}
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePage();

  if (!page) {
    return {
      title: "DevTools - Build Better Developer Tools",
      description: "Building better developer tools for modern teams.",
    };
  }

  const seoTitle = page.seo?.title || page.title;
  const seoDescription = page.seo?.description;
  const ogTitle = page.openGraph?.title || seoTitle;
  const ogDescription = page.openGraph?.description || seoDescription;

  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: ogTitle || page.title,
      description: ogDescription,
      type: "website",
    },
  };
}
