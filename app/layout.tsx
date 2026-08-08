import type { Metadata } from "next";
import "./globals.css";
import FeedbackButton from "../components/FeedbackButton";

export const metadata: Metadata = {
  title: "VoidBuild - AI Website Builder for Uganda | UGX, MoMo, WhatsApp",
  description: "Build your shop website in 30 seconds. Professional, fast, WhatsApp-ready. 10 Uganda templates.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "VoidBuild - Build your shop website in 30 seconds",
    description: "Professional websites for Ugandan SMEs - UGX pricing, WhatsApp ready",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="antialiased">
        {children}
        <FeedbackButton />
      </body>
    </html>
  );
}
