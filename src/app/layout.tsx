import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { NewsletterModal } from "@/components/NewsletterModal";
import { PublicOnly } from "@/components/PublicOnly";
import { AuthRecoveryHandler } from "@/components/AuthRecoveryHandler";
import { SiteMotion } from "@/components/motion/SiteMotion";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { site } from "@/config/site";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | A prophetic fellowship led by ${site.leader}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  keywords: [
    "School of Prophets",
    "Prophet Lawrence Iwara",
    "prophetic ministry",
    "interdenominational fellowship",
    "Bible institute",
    "online Bible study",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName: site.name,
    title: `${site.name} | A prophetic fellowship`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | A prophetic fellowship`,
    description: site.description,
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#101317",
  width: "device-width",
  initialScale: 1,
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Church",
  name: site.name,
  alternateName: site.shortName,
  description: site.description,
  url: site.url,
  foundingDate: site.foundedISO,
  slogan: "Watchers · Daniel 4:17",
  founder: {
    "@type": "Person",
    name: site.leader,
    jobTitle: "Founder and overseer",
  },
  sameAs: [site.social.facebookPage, site.social.facebookGroup, site.social.youtube],
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <MotionProvider>
          <AuthRecoveryHandler />
          <PublicOnly>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-3 focus:text-parchment"
            >
              Skip to content
            </a>
            <AnnouncementBar />
            <Header />
            <NewsletterModal />
          </PublicOnly>
          <main id="main">{children}</main>
          <PublicOnly>
            <Footer />
          </PublicOnly>
          <SiteMotion />
        </MotionProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {site.analytics.plausibleDomain && (
          <Script
            defer
            data-domain={site.analytics.plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
