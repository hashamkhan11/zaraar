export type SeriesId = "pp" | "ppd" | "tst" | "hbl" | "exp";

export interface ZararProduct {
  id: string;
  name: string;
  seriesId: SeriesId;
  seriesName: string;
  tagline: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  images: string[];
  tag?: string;
}

const _SERIES: { id: SeriesId; name: string; slug: string; description: string; specs: string[] }[] = [
  {
    id:          "exp",
    name:        "Explorer Series",
    slug:        "explorer",
    description: "Field-ready cushion case with genuine leather strap and dual circular date rollers. Built for the man who moves between the boardroom and the outdoors without missing a beat.",
    specs: [
      "Quartz movement for precise timekeeping",
      "Genuine leather strap",
      "Stainless steel case & dial",
      "Dual circular date roller display",
      "Sub-seconds counter",
      "Water resistant to 43 meters",
      "Cushion case design with luminous hour markers",
      "Available in 4 colorways",
    ],
  },
  {
    id:          "tst",
    name:        "Urban Series",
    slug:        "urban",
    description: "Bold, structured, and built for the modern achiever. Clean dials, integrated bracelet, and a design that works in every room.",
    specs: [
      "Shine-finish dial with sunburst light effect",
      "Quartz movement for precise timekeeping",
      "Integrated silver stainless steel bracelet",
      "Scratch-resistant mineral crystal glass",
      "Date display at 3 o'clock",
      "Slim minimalist case design",
      "Splash-resistant build",
    ],
  },
  {
    id:          "hbl",
    name:        "Skeleton Series",
    slug:        "skeleton",
    description: "Contemporary power meets bold expression. For the man who doesn't follow trends. He sets them.",
    specs: [
      "Quartz movement",
      "Date display",
      "Crown lock mechanism",
      "Stylish build quality & finishing",
      "Open skeleton dial design",
    ],
  },
  {
    id:          "pp",
    name:        "Classic Series — Single Tone",
    slug:        "classic-single-tone",
    description: "Presidential elegance in its purest form. Clean dials, refined lines, and the quiet confidence of a man who has already arrived. Pure silver chain.",
    specs: [
      "Movement: Quartz",
      "Water resistance: Splash resistant",
      "Strap material: Stainless steel",
      "Watch case shape: Rounded square",
      "Watch case size: 30mm to 32mm",
      "Dial size: 32mm",
      "Watch feature: Date",
      "Available in 4 dial colors",
    ],
  },
  {
    id:          "ppd",
    name:        "Prestige Series — Dual Tone",
    slug:        "prestige-dual-tone",
    description: "Gold and silver combined in a single integrated chain bracelet. Three dial personalities, one unmistakable presence. The watch that announces itself before you say a word.",
    specs: [
      "Movement: Quartz",
      "Water resistance: Splash resistant",
      "Strap material: Gold/silver stainless steel",
      "Watch case shape: Rounded square",
      "Watch case size: 30mm to 32mm",
      "Dial size: 32mm",
      "Watch feature: Date",
      "Available in 3 dial colors",
    ],
  },
];

const _CATALOG: ZararProduct[] = [

  // ─── Classic Series — Single Tone ──────────────────────────────────────────
  {
    id:            "pp-deep-blue",
    name:          "DEEP BLUE",
    seriesId:      "pp",
    seriesName:    "Classic Series",
    tagline:       "The Signature",
    description:   "Deep blue dial with silver-tone chain bracelet. Clean. Minimal. Commanding. A watch for the man who leads without raising his voice.",
    price:         3599,
    originalPrice: 5000,
    image:         "/products/pp/single-tone/deep-blue/1.webp",
    images:        ["/products/pp/single-tone/deep-blue/1.webp"],
    tag: "Bestseller",
  },
  {
    id:            "pp-ice-blue",
    name:          "ICE BLUE",
    seriesId:      "pp",
    seriesName:    "Classic Series",
    tagline:       "Cool & Deliberate",
    description:   "Ice blue dial with a silver chain. Subtle. Cool. Effortlessly elegant. A watch that works for every occasion, boardroom to wedding.",
    price:         3599,
    originalPrice: 5000,
    image:         "/products/pp/single-tone/ice-blue/1.webp",
    images:        ["/products/pp/single-tone/ice-blue/1.webp"],
  },
  {
    id:            "pp-classic-black",
    name:          "CLASSIC BLACK",
    seriesId:      "pp",
    seriesName:    "Classic Series",
    tagline:       "Bold & Silent",
    description:   "All black. No compromises. This is the watch you wear when your presence alone is the statement.",
    price:         3599,
    originalPrice: 5000,
    image:         "/products/pp/single-tone/black/1.webp",
    images:        ["/products/pp/single-tone/black/1.webp"],
  },
  {
    id:            "pp-ivory-white",
    name:          "IVORY WHITE",
    seriesId:      "pp",
    seriesName:    "Classic Series",
    tagline:       "Pure Refinement",
    description:   "Crisp white dial on a silver chain. The watch you wear when everything else needs to be perfect.",
    price:         3599,
    originalPrice: 5000,
    image:         "/products/pp/single-tone/white/1.webp",
    images:        ["/products/pp/single-tone/white/1.webp"],
  },

  // ─── Urban Series ────────────────────────────────────────────────────────────
  {
    id:            "tst-royal-blue",
    name:          "ROYAL BLUE",
    seriesId:      "tst",
    seriesName:    "Urban Series",
    tagline:       "Reach Higher",
    description:   "Deep blue precision dial. A watch that means business every day without exception. Wear it to the office. Wear it to close the deal.",
    price:         3799,
    originalPrice: 6000,
    image:         "/products/tst/single-tone/deep-blue/1.webp",
    images:        [
      "/products/tst/single-tone/deep-blue/1.webp",
      "/products/tst/single-tone/deep-blue/2.webp",
      "/products/tst/single-tone/deep-blue/3.webp",
      "/products/tst/single-tone/deep-blue/4.webp",
      "/products/tst/single-tone/deep-blue/5.webp",
    ],
    tag: "New",
  },
  {
    id:            "tst-noble-silver",
    name:          "NOBLE SILVER",
    seriesId:      "tst",
    seriesName:    "Urban Series",
    tagline:       "Polished Precision",
    description:   "Clean white dial, brushed silver case. Precision-crafted for the everyday achiever who understands that detail is everything.",
    price:         3799,
    originalPrice: 6000,
    image:         "/products/tst/single-tone/white/1.webp",
    images:        [
      "/products/tst/single-tone/white/1.webp",
      "/products/tst/single-tone/white/2.webp",
    ],
  },
  {
    id:            "tst-jet-black",
    name:          "JET BLACK",
    seriesId:      "tst",
    seriesName:    "Urban Series",
    tagline:       "Dark Precision",
    description:   "Matte black dial. Structured case. Luminous hour markers. For the man who operates in the dark and is still the sharpest in the room.",
    price:         3799,
    originalPrice: 6000,
    image:         "/products/tst/single-tone/black/1.webp",
    images:        [
      "/products/tst/single-tone/black/1.webp",
      "/products/tst/single-tone/black/2.webp",
    ],
  },
  {
    id:            "tst-sapphire-blue",
    name:          "SAPPHIRE BLUE",
    seriesId:      "tst",
    seriesName:    "Urban Series",
    tagline:       "Cool by Nature",
    description:   "Sapphire blue dial with precision detailing. When everyone else is wearing black or deep blue, you're wearing something they've never seen.",
    price:         3799,
    originalPrice: 6000,
    image:         "/products/tst/single-tone/sapphire-blue/1.webp",
    images:        [
      "/products/tst/single-tone/sapphire-blue/1.webp",
      "/products/tst/single-tone/sapphire-blue/2.webp",
    ],
    tag: "Limited",
  },

  // ─── Skeleton Series ────────────────────────────────────────────────────────
  {
    id:            "hbl-black-skeleton",
    name:          "BLACK SKELETON",
    seriesId:      "hbl",
    seriesName:    "Skeleton Series",
    tagline:       "Pure Blackout",
    description:   "Black skeleton dial. Every gear, every bridge, fully exposed. This is a watch that does not hide anything, because it has nothing to hide.",
    price:         3200,
    originalPrice: 5000,
    image:         "/products/hbl/skeleton-dial/black/1.webp",
    images:        ["/products/hbl/skeleton-dial/black/1.webp"],
    tag: "Stylish",
  },
  {
    id:            "hbl-green-skeleton",
    name:          "GREEN SKELETON",
    seriesId:      "hbl",
    seriesName:    "Skeleton Series",
    tagline:       "Bold & Raw",
    description:   "Forest green skeleton dial with a fully exposed open skeleton design. Striking, rare, and unmistakably bold. For the man who refuses to be invisible.",
    price:         3200,
    originalPrice: 5000,
    image:         "/products/hbl/skeleton-dial/green/1.webp",
    images:        ["/products/hbl/skeleton-dial/green/1.webp"],
  },
  {
    id:            "hbl-brown-skeleton",
    name:          "BROWN SKELETON",
    seriesId:      "hbl",
    seriesName:    "Skeleton Series",
    tagline:       "Warm Authority",
    description:   "Brown skeleton dial. Warm tones, structured movement, serious presence. The rare combination of warmth and weight that turns heads in any room.",
    price:         3200,
    originalPrice: 5000,
    image:         "/products/hbl/skeleton-dial/brown/1.webp",
    images:        ["/products/hbl/skeleton-dial/brown/1.webp"],
  },
  {
    id:            "hbl-white-skeleton",
    name:          "WHITE SKELETON",
    seriesId:      "hbl",
    seriesName:    "Skeleton Series",
    tagline:       "Clean Power",
    description:   "White skeleton dial. Bright, sharp, and technical. The movement is the design. Worn by the man who understands that precision is its own statement.",
    price:         3200,
    originalPrice: 5000,
    image:         "/products/hbl/skeleton-dial/white/1.webp",
    images:        ["/products/hbl/skeleton-dial/white/1.webp"],
  },

  // ─── Explorer Series ────────────────────────────────────────────────────────
  {
    id:            "exp-olive",
    name:          "OLIVE",
    seriesId:      "exp",
    seriesName:    "Explorer Series",
    tagline:       "Built for the Field",
    description:   "Army-green leather strap, olive cushion dial with dual date rollers. Rugged without being rough. The watch that holds its composure in every terrain.",
    price:         3799,
    originalPrice: 5500,
    image:         "/products/exp/leather/olive/1.webp",
    images:        ["/products/exp/leather/olive/1.webp"],
    tag: "New",
  },
  {
    id:            "exp-navy",
    name:          "NAVY",
    seriesId:      "exp",
    seriesName:    "Explorer Series",
    tagline:       "Deep & Dependable",
    description:   "Navy blue leather strap and matching dial. The kind of watch that looks right whether you're closing a deal or charting new ground.",
    price:         3799,
    originalPrice: 5500,
    image:         "/products/exp/leather/navy/1.webp",
    images:        ["/products/exp/leather/navy/1.webp"],
    tag: "New",
  },
  {
    id:            "exp-cognac",
    name:          "COGNAC",
    seriesId:      "exp",
    seriesName:    "Explorer Series",
    tagline:       "Warm & Worn-In",
    description:   "Tan cognac leather strap with a matching warm brown dial. Classic field-watch character with a modern finish — like a great leather jacket, it only gets better with time.",
    price:         3799,
    originalPrice: 5500,
    image:         "/products/exp/leather/cognac/1.webp",
    images:        ["/products/exp/leather/cognac/1.webp"],
  },
  {
    id:            "exp-slate",
    name:          "SLATE",
    seriesId:      "exp",
    seriesName:    "Explorer Series",
    tagline:       "Stealth & Precision",
    description:   "Charcoal slate leather strap with a dark gray dial. Understated power. The watch for the man who moves quietly and arrives first.",
    price:         3799,
    originalPrice: 5500,
    image:         "/products/exp/leather/slate/1.webp",
    images:        ["/products/exp/leather/slate/1.webp"],
  },

  // ─── Prestige Series — Dual Tone ─────────────────────────────────────────
  {
    id:            "ppd-midnight-black",
    name:          "MIDNIGHT BLACK",
    seriesId:      "ppd",
    seriesName:    "Prestige Series",
    tagline:       "Dark Authority",
    description:   "Black dial on a gold and silver two-tone chain bracelet. Contrast that commands the room. This is not a watch you wear to blend in.",
    price:         3799,
    originalPrice: 5400,
    image:         "/products/pp/dual-tone/black/1.webp",
    images:        [
      "/products/pp/dual-tone/black/1.webp",
      "/products/pp/dual-tone/black/2.webp",
      "/products/pp/dual-tone/black/3.webp",
      "/products/pp/dual-tone/black/4.webp",
    ],
    tag: "Bestseller",
  },
  {
    id:            "ppd-champange-gold",
    name:          "CHAMPAGNE GOLD",
    seriesId:      "ppd",
    seriesName:    "Prestige Series",
    tagline:       "Maximum Impact",
    description:   "Gold dial, gold and silver bracelet. Full presence, no apology. The watch that walks into a room before you do.",
    price:         3799,
    originalPrice: 5400,
    image:         "/products/pp/dual-tone/gold/1.webp",
    images:        [
      "/products/pp/dual-tone/gold/1.webp",
      "/products/pp/dual-tone/gold/2.webp",
      "/products/pp/dual-tone/gold/3.webp",
      "/products/pp/dual-tone/gold/4.webp",
    ],
  },
  {
    id:            "ppd-pearl-white",
    name:          "PEARL WHITE",
    seriesId:      "ppd",
    seriesName:    "Prestige Series",
    tagline:       "Quiet Elegance",
    description:   "White dial on a dual tone chain. Clean, refined, unmistakably stylish. The choice of the man who lets design do the talking.",
    price:         3799,
    originalPrice: 5400,
    image:         "/products/pp/dual-tone/white/1.webp",
    images:        [
      "/products/pp/dual-tone/white/1.webp",
      "/products/pp/dual-tone/white/2.webp",
      "/products/pp/dual-tone/white/3.webp",
      "/products/pp/dual-tone/white/4.webp",
    ],
  },
];

// Temporarily active series — restore pp/ppd by adding them back to this array
const ACTIVE_SERIES: SeriesId[] = ["exp", "hbl", "tst", "ppd", "pp"];
export const SERIES = _SERIES.filter(s => ACTIVE_SERIES.includes(s.id));
export const CATALOG = _CATALOG.filter(p => ACTIVE_SERIES.includes(p.seriesId));

// Flat COD delivery surcharge added on top of the product price at checkout.
// Shared by the storefront (display) and the create-order function
// (authoritative total), so it only needs to change in one place.
export const DELIVERY_FEE = 200;
