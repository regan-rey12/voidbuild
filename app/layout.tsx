import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoidBuild - AI Website Builder for Uganda | UGX, MoMo, WhatsApp",
  description: "Build your shop website in 30 seconds. UGX pricing, WhatsApp-ready, MTN MoMo & Airtel Money. 10 Uganda templates.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Flutterwave SDK for MoMo payments - Day 5 */}
        <script src="https://checkout.flutterwave.com/v3.js" async></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
