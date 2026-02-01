import { sanityFetch } from "@/lib/sanity/live";
import { PAGE_BY_SLUG } from "@/lib/sanity/queries";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getPage(slug: string) {
  const response = await sanityFetch({
    query: PAGE_BY_SLUG,
    params: { slug },
  });

  return response.data;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {page.pageSections?.map((section: any) => (
        <BlockRenderer key={section._key} block={section} />
      ))}
    </div>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    return {
      title: "Page Not Found",
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
