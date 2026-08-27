import type { Metadata, Viewport } from "next";
import "./globals.css";
import FeedbackButton from "@/components/FeedbackButton";

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://voidbuild.com"),
  title: {
    default: "VoidBuild — Professional Business Websites for Small Businesses | East Africa Friendly",
    template: "%s | VoidBuild",
  },
  description:
    "Launch a professional business website with pricing, customer contact, mobile-friendly design, and setup support. Built in Kampala for SMEs in Uganda and across East Africa.",
  applicationName: "VoidBuild",
  authors: [{ name: "VoidBuild Uganda", url: "https://voidbuild.com" }],
  generator: "Next.js",
  keywords: [
    "professional business website",
    "small business website East Africa",
    "website builder Kampala",
    "Ugandan SME website",
    "mobile money website",
    "WhatsApp contact website",
    "salon website Kampala",
    "pharmacy website Uganda",
    "shop website East Africa",
    "business website Uganda",
    "voidbuild",
  ],
  referrer: "origin-when-cross-origin",
  creator: "VoidBuild",
  publisher: "VoidBuild",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: "https://voidbuild.com",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_UG",
    url: "https://voidbuild.com",
    siteName: "VoidBuild",
    title: "VoidBuild — Professional Business Websites for Small Businesses",
    description:
      "Launch a business website with pricing, customer contact, and setup support. Built in Kampala for SMEs in Uganda and across East Africa.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VoidBuild — Professional Business Websites for Small Businesses",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VoidBuild — Professional Websites for Ugandan Businesses",
    description:
      "Launch your business website with UGX pricing, WhatsApp inquiries, and local support from Kampala.",
    images: ["/og-image.png"],
    creator: "@voidbuild",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://voidbuild.com/#organization",
      name: "VoidBuild",
      url: "https://voidbuild.com",
      logo: {
        "@type": "ImageObject",
        url: "https://voidbuild.com/logo.png",
        width: 1024,
        height: 1024,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+256-751-391318",
        contactType: "customer service",
        areaServed: "UG",
        availableLanguage: ["en", "Luganda"],
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Kampala",
        addressCountry: "UG",
      },
      email: "hello@voidbuild.com",
    },
    {
      "@type": "WebSite",
      "@id": "https://voidbuild.com/#website",
      url: "https://voidbuild.com",
      name: "VoidBuild",
      description: "Professional business websites for SMEs with pricing, customer contact, and local support from Kampala.",
      publisher: {
        "@id": "https://voidbuild.com/#organization",
      },
      inLanguage: "en-UG",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://voidbuild.com/#software",
      name: "VoidBuild Website Builder for Small Businesses in East Africa",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser (Mobile & Desktop)",
      offers: [
        {
          "@type": "Offer",
          name: "Free Forever",
          price: "0",
          priceCurrency: "UGX",
          description: "1 website free forever with WhatsApp ordering",
        },
        {
          "@type": "Offer",
          name: "Starter Plan",
          price: "15000",
          priceCurrency: "UGX",
          description: "1 website with custom subdomain & high-speed hosting",
        },
        {
          "@type": "Offer",
          name: "Business Plan",
          price: "35000",
          priceCurrency: "UGX",
          description: "3 websites with visitor analytics and assisted domain connection rollout",
        },
        {
          "@type": "Offer",
          name: "Pro Plan",
          price: "75000",
          priceCurrency: "UGX",
          description: "10 websites with priority VIP support & store catalog",
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "128",
        bestRating: "5",
        worstRating: "1",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        {children}
        <FeedbackButton />
      </body>
    </html>
  );
}
