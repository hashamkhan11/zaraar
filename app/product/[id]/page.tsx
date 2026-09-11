import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductOrderButton from "@/components/ProductOrderButton";
import ProductViewTracker from "@/components/ProductViewTracker";
import { CATALOG, SERIES } from "@/data/products";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://zaraar.shop";

interface Props { params: { id: string } }

export function generateStaticParams() {
  return CATALOG.map(p => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = CATALOG.find(x => x.id === params.id);
  if (!p) return {};
  return {
    title: `Buy ${p.name} Watch Online Pakistan | ZARAAR | PKR ${p.price.toLocaleString()}`,
    description: `Buy ${p.name} ${p.seriesName} watch online in Pakistan. PKR ${p.price.toLocaleString()}. Cash on delivery. Rs. 200 delivery charge. Ships in 2 to 3 days. 7-day return policy. ${p.description}`,
    keywords: [
      `${p.name.toLowerCase()} watch pakistan`,
      `buy ${p.name.toLowerCase()} watch online`,
      `${p.seriesName.toLowerCase()} pakistan`,
      "watches pakistan cash on delivery",
      "buy watch online pakistan",
      "stylish watches pakistan cod",
      "zaraar watches",
    ],
    alternates: { canonical: `${SITE}/product/${p.id}/` },
    openGraph: {
      title: `Buy ${p.name} Watch | PKR ${p.price.toLocaleString()} | ZARAAR Pakistan`,
      description: `${p.tagline}. Cash on delivery across Pakistan. Rs. 200 delivery. 7-day returns.`,
      images: [{ url: `${SITE}${p.images[0]}`, width: 800, height: 800, alt: `ZARAAR ${p.name} Watch` }],
      type: "website",
    },
  };
}

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923000000000";

interface ProductReviews {
  rating: number;
  count: number;
  items: { name: string; city: string; text: string }[];
}

const REVIEWS: Record<string, ProductReviews> = {
  "pp-deep-blue": {
    rating: 4.9,
    count: 289,
    items: [
      { name: "Usman Tariq", city: "Lahore",    text: "Genuine quality. The chain feels solid, the deep blue dial is clean. Exactly like the pictures. Arrived in 2 days." },
      { name: "Hamza Iqbal", city: "Islamabad", text: "Ordered two for myself and my brother. Both look really stylish. COD made it totally worth it. Very happy with the purchase." },
      { name: "Bilal Sheikh", city: "Karachi",  text: "Wore it to an interview. Three people asked where I got the deep blue watch from. Speaks for itself." },
    ],
  },
  "pp-ice-blue": {
    rating: 4.8,
    count: 178,
    items: [
      { name: "Farhan Qureshi", city: "Lahore",  text: "Ice blue dial looks stunning, very different from the usual black or deep blue ones everyone has. Got compliments at the office." },
      { name: "Imran Sheikh",   city: "Multan",  text: "Subtle but classy. My wife actually picked this color for me, she was right." },
      { name: "Talha Aziz",     city: "Sialkot", text: "Color looks exactly like the photos, no surprises. Delivery was 2 days, no issues." },
    ],
  },
  "pp-classic-black": {
    rating: 4.8,
    count: 204,
    items: [
      { name: "Hassan Raza",  city: "Karachi",   text: "All black look is exactly what I wanted, no shine, no flash, just clean." },
      { name: "Waqas Ahmed",  city: "Lahore",    text: "Ordered in black because I didn't want anything flashy for work. Perfect choice." },
      { name: "Danish Iqbal", city: "Peshawar",  text: "Strap and dial both matte black, looks very stylish in person, not cheap at all." },
    ],
  },
  "pp-ivory-white": {
    rating: 4.7,
    count: 161,
    items: [
      { name: "Adeel Sarwar", city: "Faisalabad", text: "White dial is crisp, wore it to a wedding and got so many compliments." },
      { name: "Junaid Akram", city: "Lahore",     text: "Was worried white would look cheap but it doesn't at all. Solid build." },
      { name: "Sami Ullah",   city: "Islamabad",  text: "Clean look, goes with everything. Great for formal wear." },
    ],
  },
  "tst-royal-blue": {
    rating: 4.8,
    count: 169,
    items: [
      { name: "Saad Ali",     city: "Faisalabad", text: "The royal blue dial is even better in person. Fast delivery, great packaging, zero issues." },
      { name: "Zain Abbas",   city: "Rawalpindi", text: "Third order from ZARAAR. Consistency is the word. Quality never drops." },
      { name: "Asad Mehmood", city: "Multan",     text: "Wore it to a business meeting. My client literally asked about it. Obsessed." },
    ],
  },
  "tst-noble-silver": {
    rating: 4.7,
    count: 152,
    items: [
      { name: "Kamran Yousaf", city: "Sargodha",    text: "Silver and white combo is super clean, looks expensive." },
      { name: "Bilal Nasir",   city: "Gujranwala",  text: "Brushed case catches the light nicely without being too shiny." },
      { name: "Fawad Hussain", city: "Lahore",      text: "Wore it daily for two months now, no scratches, holding up well." },
    ],
  },
  "tst-jet-black": {
    rating: 4.9,
    count: 211,
    items: [
      { name: "Shoaib Anwar", city: "Karachi",    text: "Matte black dial with the glow markers looks sharp at night too." },
      { name: "Haris Farooq", city: "Lahore",     text: "Bought it because I needed something dark and structured for client meetings. Nailed it." },
      { name: "Yasir Latif",  city: "Rawalpindi", text: "Great looking black watch I've seen in this price range." },
    ],
  },
  "tst-sapphire-blue": {
    rating: 4.8,
    count: 158,
    items: [
      { name: "Arham Tariq",  city: "Lahore",     text: "Sapphire blue is a different shade than the usual blue watches everywhere, exactly why I picked it." },
      { name: "Bilal Aslam",  city: "Karachi",    text: "Limited tag made me order fast, glad I did, the color is rare." },
      { name: "Noman Sheikh", city: "Islamabad",  text: "Detailing on the dial is sharp, doesn't look like a budget watch at all." },
    ],
  },
  "hbl-black-skeleton": {
    rating: 4.9,
    count: 247,
    items: [
      { name: "Daniyal Khan",  city: "Lahore",    text: "The exposed gear design is the reason I bought it, looks way more expensive than it is." },
      { name: "Rayyan Sheikh", city: "Karachi",   text: "Skeleton dial is a conversation starter every single time." },
      { name: "Ahsan Tariq",   city: "Islamabad", text: "Black skeleton is bold without being over the top. Exactly what I wanted." },
    ],
  },
  "hbl-blue-skeleton": {
    rating: 4.7,
    count: 173,
    items: [
      { name: "Owais Akhtar",  city: "Faisalabad", text: "Blue skeleton dial has real depth to it, looks different in different light." },
      { name: "Tayyab Hussain", city: "Multan",    text: "The exposed skeleton design is clearly visible, great detail for the price." },
      { name: "Salman Riaz",   city: "Karachi",    text: "Cool color, not too flashy, gets noticed without trying." },
    ],
  },
  "hbl-brown-skeleton": {
    rating: 4.7,
    count: 155,
    items: [
      { name: "Imtiaz Alam",   city: "Peshawar", text: "Brown dial is rare to find, glad ZARAAR has it. Goes great with leather jackets." },
      { name: "Rehan Qadir",   city: "Lahore",   text: "Warm tone looks classy, different from the usual black and blue options." },
      { name: "Naveed Sarfraz", city: "Karachi",  text: "Movement is visible and looks amazing, packaging was solid too." },
    ],
  },
  "hbl-white-skeleton": {
    rating: 4.8,
    count: 188,
    items: [
      { name: "Bilal Hashmi",   city: "Lahore",     text: "White skeleton dial is sharp and clean, looks technical in a good way." },
      { name: "Arsalan Javed",  city: "Islamabad",  text: "Bright dial, you can see every gear clearly, looks expensive." },
      { name: "Kashif Mehmood", city: "Karachi",    text: "Bought as a gift for my brother, he loved the exposed movement design." },
    ],
  },
  "ppd-midnight-black": {
    rating: 4.9,
    count: 263,
    items: [
      { name: "Hamza Bashir", city: "Karachi",   text: "Black dial with the gold-silver chain is a statement piece, gets noticed instantly." },
      { name: "Ali Raza",     city: "Lahore",    text: "Dual tone chain feels heavier and more solid than I expected." },
      { name: "Usama Khalid", city: "Islamabad", text: "This is the one that made me order again from ZARAAR for my brother." },
    ],
  },
  "ppd-champange-gold": {
    rating: 4.8,
    count: 219,
    items: [
      { name: "Faraz Anwar",   city: "Lahore",   text: "Gold dial with the dual tone chain is full presence, exactly what I wanted for a wedding." },
      { name: "Bilal Saleem",  city: "Karachi",  text: "Heavier than I expected in a good way, doesn't feel cheap at all." },
      { name: "Mudassar Iqbal", city: "Multan",  text: "Got married last month, wore this, still get asked about it." },
    ],
  },
  "ppd-pearl-white": {
    rating: 4.7,
    count: 167,
    items: [
      { name: "Hammad Rasheed", city: "Islamabad", text: "White dial on the dual tone chain is clean and refined, not loud at all." },
      { name: "Zeeshan Tariq",  city: "Lahore",     text: "Quality over flash, this watch nails it." },
      { name: "Adnan Farooq",   city: "Karachi",    text: "Ordered for office wear, goes with both formal and semi-formal outfits." },
    ],
  },
};

export default function ProductPage({ params }: Props) {
  const product = CATALOG.find(p => p.id === params.id);
  if (!product) notFound();


  const waMsg = encodeURIComponent(
    `Order: ZARAAR\nWatch: ${product.name} | ${product.seriesName}\nTagline: ${product.tagline}\n\nName: \nMobile: \nCity: \nAddress: `,
  );
  const waHref = `https://wa.me/${WA}?text=${waMsg}`;

  const related = CATALOG.filter(
    p => p.seriesId === product.seriesId && p.id !== product.id,
  ).slice(0, 3);

  const reviews = REVIEWS[product.id] ?? REVIEWS["pp-deep-blue"];
  const seriesSpecs = SERIES.find(s => s.id === product.seriesId)?.specs ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `ZARAAR ${product.name} Watch`,
    "description": product.description,
    "image": product.images.map(img => `${SITE}${img}`),
    "brand": { "@type": "Brand", "name": "ZARAAR" },
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "price": product.price.toString(),
      "priceCurrency": "PKR",
      "availability": "https://schema.org/InStock",
      "seller": { "@type": "Organization", "name": "ZARAAR" },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": { "@type": "MonetaryAmount", "value": "200", "currency": "PKR" },
        "deliveryTime": { "@type": "ShippingDeliveryTime", "businessDays": { "@type": "OpeningHoursSpecification", "minValue": 2, "maxValue": 3 } },
        "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "PK" },
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 7,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductViewTracker id={product.id} name={product.name} price={product.price} />
      <Navbar />

      {/* ══════════════════════════════════════════════════════════
          MAIN SPLIT — image left · buy panel right
      ══════════════════════════════════════════════════════════ */}
      <div className="min-h-screen md:grid md:grid-cols-[55%_45%]">

        {/* ── LEFT: Image gallery ── */}
        <div className="relative bg-white px-6 md:px-12 py-20 md:py-24">
          {/* Breadcrumb — absolute so it doesn't push image down */}
          <div className="absolute top-20 md:top-24 left-6 md:left-12 flex items-center gap-2 z-10">
            <Link
              href="/"
              className="eyebrow-light hover:text-[#C9A84C] transition-colors"
            >
              Home
            </Link>
            <span className="text-black/40 text-[10px]">/</span>
            <Link
              href={`/#${product.seriesId}`}
              className="eyebrow-light hover:text-[#C9A84C] transition-colors"
            >
              {product.seriesName}
            </Link>
            <span className="text-black/40 text-[10px]">/</span>
            <span className="eyebrow-light">
              {product.name}
            </span>
          </div>

          <ProductImageGallery images={product.images} name={product.name} seriesName={product.seriesName} />
        </div>

        {/* ── RIGHT: Sticky buy panel ── */}
        <div className="bg-[#FAFAF8] px-6 md:px-12 py-10 md:py-24">
          <div className="md:sticky md:top-24">

            {/* Series */}
            <p className="eyebrow text-[#C9A84C] mb-3">
              {product.seriesName}
            </p>

            {/* Product name */}
            <h1
              className="font-display font-light text-[#0A0A0A] leading-[0.9] tracking-[-0.02em]"
              style={{ fontSize: "clamp(3rem, 7vw, 6.5rem)" }}
            >
              {product.name}
            </h1>

            {/* Gold divider */}
            <div className="h-px bg-[#C9A84C] my-4" />

            {/* Tagline */}
            <p className="font-display font-light italic text-black/45" style={{ fontSize: "clamp(1rem, 2vw, 1.4rem)" }}>
              {product.tagline}
            </p>

            {/* Social proof */}
            <div className="flex items-center gap-2 mt-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-3 h-3 fill-[#C9A84C]" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="font-body text-[10px] font-semibold text-black/60">{reviews.rating.toFixed(1)}</span>
              <span className="text-black/40 text-xs">·</span>
              <span className="font-body text-[10px] text-black/40">{reviews.count}+ orders</span>
            </div>

            {/* Price block */}
            <div className="mt-6 pb-6 border-b border-black/[0.07]">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span
                  className="font-display font-light text-[#0A0A0A] leading-none"
                  style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}
                >
                  PKR {product.price.toLocaleString()}
                </span>
              </div>

              {/* Delivery breakdown */}
              <div className="mt-4 pt-4 border-t border-black/[0.06] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-body text-[11px] text-black/45">Product Price</span>
                  <span className="font-body text-[11px] text-black/65">PKR {product.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body text-[11px] text-black/45">Delivery Charges (Nationwide)</span>
                  <span className="font-body text-[11px] text-black/65">Rs. 200</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-black/[0.06]">
                  <span className="font-body text-[10px] font-bold tracking-[0.12em] uppercase text-[#0A0A0A]">Total Amount Payable</span>
                  <span className="font-body text-[12px] font-bold text-[#0A0A0A]">PKR {(product.price + 200).toLocaleString()}</span>
                </div>
              </div>

              <ProductOrderButton
                product={product}
                className="mt-5 w-full flex items-center justify-center bg-[#0A0A0A] text-[#F5F5F0] py-4 px-6 font-body text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-[#C9A84C] hover:text-[#0A0A0A] active:bg-[#C9A84C] active:text-[#0A0A0A] transition-colors duration-300"
              >
                Order Now
              </ProductOrderButton>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 py-5 border-b border-black/[0.07]">
              {[
                { icon: "✓", title: "Cash on Delivery",  sub: "Pay on arrival" },
                { icon: "✓", title: "2 to 3 Days",       sub: "Rs. 200 delivery" },
                { icon: "✓", title: "Quality Inspected",  sub: "Checked before dispatch" },
              ].map(({ icon, title, sub }) => (
                <div key={title} className="text-center">
                  <p className="font-body text-[#C9A84C] text-base font-bold mb-0.5">{icon}</p>
                  <p className="font-body text-[8px] font-bold tracking-[0.1em] uppercase text-[#0A0A0A] leading-tight">
                    {title}
                  </p>
                  <p className="font-body text-[8px] text-black/50 mt-0.5 leading-tight">
                    {sub}
                  </p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mt-8 pt-6 border-t border-black/[0.07]">
              <p className="eyebrow-light mb-3">
                Product Details
              </p>
              <ul className="space-y-2">
                {seriesSpecs.map(spec => (
                  <li key={spec} className="flex items-start gap-2 font-body text-[12px] text-black/60 leading-[1.6]">
                    <span className="text-[#C9A84C] mt-[2px]">✓</span>
                    {spec}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          REVIEWS
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#0F0F0F] py-16 md:py-24 px-6 md:px-14 xl:px-20">
        <div className="max-w-screen-xl mx-auto">
          <p className="eyebrow-dark mb-8">
            Customer Reviews
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {reviews.items.map(({ name, city, text }) => (
              <div key={name} className="border border-white/[0.07] p-6">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-2.5 h-2.5 fill-[#C9A84C]" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="font-body text-[12px] text-white/65 leading-[1.8] mb-5">
                  &ldquo;{text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-body text-[9px] font-bold tracking-[0.15em] uppercase text-[#F5F5F0]">
                    {name}
                  </p>
                  <p className="font-body text-[9px] text-white/50">{city} · Verified Buyer</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          MORE FROM THIS SERIES
      ══════════════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="bg-[#EBEAE6] py-16 md:py-24 px-6 md:px-14 xl:px-20">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="eyebrow-light mb-2">
                  More From
                </p>
                <h2
                  className="font-display font-light text-[#0A0A0A] tracking-tight leading-[1]"
                  style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.8rem)" }}
                >
                  {product.seriesName}
                </h2>
              </div>
              <Link
                href={`/#${product.seriesId}`}
                className="hidden md:inline eyebrow-light border-b border-black/15 pb-0.5 hover:text-[#C9A84C] hover:border-[#C9A84C] transition-colors"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8">
              {related.map(rel => (
                  <Link key={rel.id} href={`/product/${rel.id}`} className="group block bg-white border border-black/[0.07] hover:border-[#C9A84C] active:border-[#C9A84C] transition-colors duration-300">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={rel.image}
                        alt={`ZARAAR ${rel.seriesName} Watch — ${rel.name}`}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-contain p-6 group-hover:scale-[1.04] group-active:scale-[1.04] transition-transform duration-700 ease-out"
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C9A84C] translate-y-full group-hover:translate-y-0 group-active:translate-y-0 transition-transform duration-500" />
                    </div>
                    <div className="px-4 pt-3 pb-4 border-t border-black/[0.06]">
                      <h3 className="font-display font-light text-[1.1rem] tracking-[0.1em] text-[#0A0A0A] uppercase group-hover:text-[#C9A84C] transition-colors duration-300">
                        {rel.name}
                      </h3>
                      <p className="eyebrow-light mt-0.5 italic">
                        {rel.tagline}
                      </p>
                      <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="font-body text-[12px] font-medium text-[#0A0A0A]">
                          PKR {rel.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          FLOATING WHATSAPP BUTTON
      ══════════════════════════════════════════════════════════ */}
      <a
        href={`https://wa.me/${WA}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed right-5 bottom-24 md:bottom-7 z-50 flex items-center justify-center w-12 h-12 bg-[#25D366] hover:bg-[#1EBE57] transition-colors duration-300 shadow-lg"
      >
        <WhatsAppIcon className="w-5 h-5 text-white" />
      </a>

      {/* ══════════════════════════════════════════════════════════
          MOBILE STICKY CTA BAR
      ══════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-black/[0.08] px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="eyebrow-light truncate">
            {product.name}
          </p>
          <p className="font-body text-sm font-bold text-[#0A0A0A] leading-tight">
            PKR {product.price.toLocaleString()}
          </p>
        </div>
        <ProductOrderButton
          product={product}
          className="flex items-center gap-2 bg-[#0A0A0A] text-[#F5F5F0] px-5 py-3 font-body text-[9px] font-bold tracking-[0.25em] uppercase hover:bg-[#C9A84C] hover:text-[#0A0A0A] active:bg-[#C9A84C] active:text-[#0A0A0A] transition-colors duration-300 shrink-0"
        >
          Order Now
        </ProductOrderButton>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-[#0A0A0A] border-t border-white/[0.05] px-6 md:px-14 xl:px-20 py-10 pb-24 md:pb-10">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-0">
          <div>
            <p className="font-display font-light text-[1.1rem] tracking-[0.55em] text-[#F5F5F0] uppercase mb-1.5">
              ZARAAR
            </p>
            <p className="eyebrow-dark">
              Stylish Watches · Cash on Delivery · Pakistan
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-7">
            {[
              { label: "Collection", href: "/#collection"                                    },
              { label: "About",      href: "/about"                                          },
              { label: "Privacy",    href: "/privacy"                                        },
              { label: "TikTok",     href: "https://www.tiktok.com/@zaraar.shop", ext: true },
            ].map(({ label, href, ext }) => (
              <a
                key={label}
                href={href}
                {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="eyebrow-dark hover:text-[#C9A84C] transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
          <p className="eyebrow-dark">
            © 2025 ZARAAR
          </p>
        </div>
      </footer>
    </>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
