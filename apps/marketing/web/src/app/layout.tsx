import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { draftMode } from "next/headers";
import { SanityLive, sanityFetch } from "@/lib/sanity/live";
import { VisualEditing } from "next-sanity/visual-editing";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MaintenanceBanner } from "@/components/MaintenanceBanner";
import { PromoBanner } from "@/components/PromoBanner";
import { GlobalAssistant } from "@/components/GlobalAssistant";
import { MAINTENANCE_BANNER, PROMO_BANNER } from "@/lib/sanity/queries";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sanity Playground",
    template: "%s · Sanity Playground",
  },
  description: "A running log of platform updates, demos, and experiments built with Sanity.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDraftMode = (await draftMode()).isEnabled;

  const [{ data: maintenanceBannerData }, { data: promoBannerData }] =
    await Promise.all([
      sanityFetch({ query: MAINTENANCE_BANNER }),
      sanityFetch({ query: PROMO_BANNER }),
    ]);

  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-accent focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>

        {/* Fixed header */}
        <div className="fixed inset-x-0 top-0 z-50">
          <Navigation />
          <PromoBanner data={promoBannerData} />
          <MaintenanceBanner data={maintenanceBannerData} />
        </div>

        {/* Spacer matching fixed header height */}
        <div aria-hidden="true" className="invisible">
          <Navigation />
          <PromoBanner data={promoBannerData} />
          <MaintenanceBanner data={maintenanceBannerData} />
        </div>

        <main id="main-content">{children}</main>
        <Footer />
        <GlobalAssistant />
        <SanityLive />
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  );
}
