import Link from "next/link";
import { Megaphone } from "lucide-react";

type PromoBannerData = {
  enabled: boolean | null;
  headline: string | null;
  subtext?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
} | null;

export function PromoBanner({ data }: { data: PromoBannerData }) {
  if (!data || !data.enabled || !data.headline) return null;

  const now = new Date();
  if (data.startDate && now < new Date(data.startDate)) return null;
  if (data.endDate && now > new Date(data.endDate)) return null;

  return (
    <div className="w-full bg-accent/10 border-b border-accent/20 px-4 py-2.5 flex items-center justify-center gap-4 text-sm flex-wrap">
      <div className="flex items-center gap-2">
        <Megaphone className="h-4 w-4 text-accent flex-shrink-0" aria-hidden="true" />
        <span className="font-semibold text-foreground">{data.headline}</span>
        {data.subtext && (
          <span className="text-text-secondary hidden sm:inline">{data.subtext}</span>
        )}
      </div>
      {data.ctaText && data.ctaUrl && (
        <Link
          href={data.ctaUrl}
          className="rounded-full bg-accent px-4 py-1 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
        >
          {data.ctaText}
        </Link>
      )}
    </div>
  );
}
