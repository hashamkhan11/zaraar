import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Inter, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import TikTokPageView from "@/components/TikTokPageView";

const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

export const viewport: Viewport = { themeColor: "#0A0A0A" };

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const urdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  variable: "--font-urdu",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zaraar.pk"),
  title: {
    default: "ZARAAR | Buy Premium Watches Online Pakistan | Cash on Delivery",
    template: "%s | ZARAAR Pakistan",
  },
  description: "Buy premium watches online in Pakistan with cash on delivery. Tissot, Hublot and Patek Philippe inspired designs. Rs. 200 delivery charge. Ships in 2 to 3 days. 7-day returns. 2,000+ happy customers.",
  keywords: [
    "buy watches online pakistan",
    "watches pakistan cash on delivery",
    "premium watches pakistan",
    "watches cod pakistan",
    "tissot watches pakistan",
    "hublot watches pakistan",
    "patek philippe watches pakistan",
    "skeleton dial watches pakistan",
    "watches for men pakistan",
    "luxury watches pakistan",
    "affordable premium watches pakistan",
    "watches lahore",
    "watches karachi",
    "watches islamabad",
    "watches faisalabad",
    "wrist watch pakistan",
    "branded watches pakistan",
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
    title: "ZARAAR | Buy Premium Watches Online Pakistan",
    description: "Premium watches with cash on delivery across Pakistan. Tissot, Hublot and Patek Philippe inspired. Rs. 200 delivery. 7-day returns.",
    siteName: "ZARAAR",
    type: "website",
    locale: "en_PK",
    url: "https://zaraar.pk",
    images: [{ url: "https://zaraar.pk/logo.svg", width: 973, height: 499, alt: "ZARAAR Premium Watches Pakistan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZARAAR | Premium Watches Pakistan",
    description: "Buy premium watches online in Pakistan. Cash on delivery. Rs. 200 delivery charge.",
  },
  alternates: {
    canonical: "https://zaraar.pk",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} ${urdu.variable}`}>
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
