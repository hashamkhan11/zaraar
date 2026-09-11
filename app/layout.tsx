import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import TikTokPageView from "@/components/TikTokPageView";

const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

export const viewport: Viewport = { themeColor: "#0A0A0A" };

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zaraar.shop"),
  title: {
    default: "ZARAAR | Buy Stylish Watches Online Pakistan | Cash on Delivery",
    template: "%s | ZARAAR Pakistan",
  },
  description: "Buy stylish watches online in Pakistan with cash on delivery. Classic, Skeleton and Prestige series. Rs. 200 delivery charge. Ships in 2 to 3 days. 7-day returns. 2,000+ happy customers.",
  keywords: [
    "buy watches online pakistan",
    "watches pakistan cash on delivery",
    "stylish watches pakistan",
    "watches cod pakistan",
    "skeleton dial watches pakistan",
    "chain bracelet watches pakistan",
    "watches for men pakistan",
    "unique design watches pakistan",
    "affordable watches pakistan",
    "watches lahore",
    "watches karachi",
    "watches islamabad",
    "watches faisalabad",
    "wrist watch pakistan",
    "zaraar watches",
    "zaraar watch pakistan",
    "cash on delivery watches lahore",
    "cash on delivery watches karachi",
    "men watches online pakistan",
    "buy watch online pakistan",
  ],
  authors: [{ name: "ZARAAR" }],
  creator: "ZARAAR",
  publisher: "ZARAAR",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: "ZARAAR | Buy Stylish Watches Online Pakistan",
    description: "Stylish ZARAAR watches with cash on delivery across Pakistan. Classic, Skeleton and Prestige series. Rs. 200 delivery. 7-day returns.",
    siteName: "ZARAAR",
    type: "website",
    locale: "en_PK",
    url: "https://zaraar.shop/",
    images: [{ url: "https://zaraar.shop/logo.svg", width: 973, height: 499, alt: "ZARAAR Stylish Watches Pakistan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZARAAR | Stylish Watches Pakistan",
    description: "Buy stylish watches online in Pakistan. Cash on delivery. Rs. 200 delivery charge.",
  },
  alternates: {
    canonical: "https://zaraar.shop/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-[#0A0A0A] text-[#F5F5F0] antialiased font-body">
        {TIKTOK_PIXEL_ID && (
          <Script id="tiktok-pixel" strategy="afterInteractive">
            {`
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<e.methods.length;n++)ttq.setAndDefer(e,e.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                ttq.load('${TIKTOK_PIXEL_ID}');
                ttq.page();
              }(window, document, 'ttq');
            `}
          </Script>
        )}
        <TikTokPageView />
        {children}
      </body>
    </html>
  );
}
