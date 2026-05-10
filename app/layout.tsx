import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};
import Script from "next/script";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import SaleBanner from "@/components/SaleBanner";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "D7F8KV3C77U751P3JU3G";

export const metadata: Metadata = {
  metadataBase: new URL("https://watchesbyfahad.com"),
  title: {
    default: "WatchesByFahad — Premium Watches | Cash on Delivery Pakistan",
    template: "%s | WatchesByFahad",
  },
  description:
    "Shop premium quality watches in Pakistan. Free Cash on Delivery across all major cities — Karachi, Lahore, Islamabad, Faisalabad & more.",
  keywords: [
    "watches pakistan",
    "luxury watches cod pakistan",
    "watches cash on delivery",
    "watches lahore karachi islamabad",
    "premium watches pakistan",
  ],
  appleWebApp: { title: "WBF" },
  openGraph: {
    title: "WatchesByFahad — Premium Watches Pakistan",
    description: "Premium watches with Cash on Delivery across Pakistan.",
    url: "https://watchesbyfahad.com",
    siteName: "WatchesByFahad",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WatchesByFahad — Premium Watches",
    description: "Premium watches. COD across Pakistan.",
    images: ["/og-image.jpg"],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "https://watchesbyfahad.com" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <head>
        {/* next/font/google self-hosts fonts at build time — no Google DNS needed */}


        {/* Microsoft Clarity — session recordings & heatmaps */}
        <Script id="clarity" strategy="afterInteractive">{`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "wk1y19ouk6");
        `}</Script>

        {/* Google Analytics 4 */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-9NHS787E2D" strategy="afterInteractive" />
        <Script id="ga4" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-9NHS787E2D');
        `}</Script>

        {/* TikTok Pixel — loads after page is interactive */}
        <Script id="tiktok-pixel" strategy="afterInteractive">{`
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
            ttq.load('${PIXEL_ID}');
            ttq.page();
          }(window, document, 'ttq');
        `}</Script>
      </head>
      <body className="font-sans">
        <SaleBanner />
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
