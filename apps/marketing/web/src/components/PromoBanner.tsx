import Link from "next/link";
import { Megaphone } from "lucide-react";

type Cta = {
  text?: string | null;
  linkType?: string | null;
  internalLink?: { _type: string; slug: string | null } | null;
  externalUrl?: string | null;
  openInNewTab?: boolean | null;
} | null;

type PromoBannerData = {
  enabled: boolean | null;
  headline: string | null;
  subtext?: string | null;
  cta?: Cta;
  startDate?: string | null;
  endDate?: string | null;
} | null;

function resolveHref(cta: Cta): string | null {
  if (!cta) return null;
  if (cta.linkType === "internal") {
    const slug = cta.internalLink?.slug;
    return slug ? `/${slug}` : "/";
  }
  return cta.externalUrl ?? null;
}

export function PromoBanner({ data }: { data: PromoBannerData }) {
  if (!data || !data.enabled || !data.headline) return null;

  const now = new Date();
  if (data.startDate && now < new Date(data.startDate)) return null;
  if (data.endDate && now > new Date(data.endDate)) return null;

  const href = resolveHref(data.cta ?? null);
  const openInNewTab = data.cta?.openInNewTab ?? false;

  return (
    <div className="w-full bg-background border-b border-border px-4 py-2.5 flex items-center justify-center gap-4 text-sm flex-wrap">
      <div className="flex items-center gap-2">
        <Megaphone
          className="h-4 w-4 text-accent flex-shrink-0"
          aria-hidden="true"
        />
        <span className="font-semibold text-foreground">{data.headline}</span>
        {data.subtext && (
          <span className="text-text-secondary hidden sm:inline">
            {data.subtext}
          </span>
        )}
      </div>
      {data.cta?.text && href && (
        <Link
          href={href}
          target={openInNewTab ? "_blank" : undefined}
          rel={openInNewTab ? "noopener noreferrer" : undefined}
          className="rounded-full bg-accent px-4 py-1 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
        >
          {data.cta.text}
        </Link>
      )}
    </div>
  );
}
