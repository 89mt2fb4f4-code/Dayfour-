import type { Metadata, Viewport } from "next";
import "./globals.css";

const DESCRIPTION = "DɅYFOVR — Film. Commercial. Documentary. Private.";
const SHARE_IMAGE = { url: "/og.jpg", width: 1200, height: 630, alt: "DɅYFOVR" };

export const metadata: Metadata = {
  // Share cards need absolute image links; this is the live address.
  metadataBase: new URL("https://dayfour.studio"),
  title: "DɅYFOVR",
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: "/",
    siteName: "DɅYFOVR",
    title: "DɅYFOVR",
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "DɅYFOVR",
    description: DESCRIPTION,
    images: [SHARE_IMAGE.url],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* The portal wordmark measures its own ink, so its face must be ready before it mounts. */}
        <link rel="preload" href="/fonts/CormorantGaramond-700-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
