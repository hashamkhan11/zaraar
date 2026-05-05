export interface Variant {
  id: string;
  name: string;
  swatch: string;
  swatchBorder?: boolean; // true for light colors that need a border on white bg
  images: string[];
  cardImage?: string;    // override thumbnail shown on homepage card (defaults to images[0])
  badge?: string;
  placeholder?: boolean; // true = real photo not added yet, using temp image
  comingSoon?: boolean;  // true = color not yet available, shown as disabled swatch
}

export interface ProductGroup {
  id: string;
  categoryId: string;
  name: string;
  fullName: string;
  price: number;
  originalPrice: number;
  shortDescription: string;
  description: string;
  features: string[];
  rating: number;
  reviewCount: number;
  orders24h: number;
  badge?: string;
  variants: Variant[];
  defaultVariant: string;
  comingSoon?: boolean;
}

export interface BrandCategory {
  id: string;
  name: string;
  groups: ProductGroup[];
}

// Image path helper
// Pattern: /products/{brand}/{style}/{color}/{n}.webp


export const catalog: BrandCategory[] = [
  {
    id: "pp",
    name: "PP",
    groups: [

      //PP Single Tone Chain 
      {
        id: "pp-single-tone",
        categoryId: "pp",
        name: "Single Tone Chain",
        fullName: "PP Single Tone Chain",
        badge: "Best Seller",
        price: 3999,
        originalPrice: 5500,
        shortDescription: "Silver stainless steel chain bracelet — 4 dial colors.",
        description:
          "The PP Single Tone Chain collection pairs a polished all-silver stainless steel case and integrated chain bracelet with five distinct dial personalities. From the cool calm of Ice Blue to the deep authority of Deep Blue, and from Pearl White to Midnight Black and Forest Green — each shares the same premium build, automatic movement, luminous markers, and date display. One watch family, five moods.",
        features: [
          "Movement : Quartz",
          "Water Resistance: Yes",
          "Strap Material: Stainless Steel",
          "Watch Case Shape: Rounded Square",
          "Watch Case Size: 30mm to 32mm",
          "Dial size: 32mm",
          "Watch Feature: Date",
          "Available in 5 dial colors",
        ],
        rating: 4.9,
        reviewCount: 312,
        orders24h: 58,
        defaultVariant: "deep-blue",
        variants: [
          {
            id: "deep-blue",
            name: "Deep Blue",
            swatch: "#1E3D6B",
            images: ["/products/pp/single-tone/deep-blue/1.webp"],
            badge: "New Arrival",
          },
          {
            id: "ice-blue",
            name: "Ice Blue",
            swatch: "#8EC9D8",
            images: ["/products/pp/single-tone/ice-blue/1.webp"],
            badge: "Best Seller",
          },
          {
            id: "white",
            name: "Pearl White",
            swatch: "#E8E8E8",
            swatchBorder: true,
            images: ["/products/pp/single-tone/white/1.webp"],
          },
          {
            id: "black",
            name: "Midnight Black",
            swatch: "#1A1A1A",
            images: ["/products/pp/single-tone/black/1.webp"],
          },
        ],
      },

      // ── PP Leather Strap ──────────────────────────────────────────────────
      {
        id: "pp-leather-strap",
        categoryId: "pp",
        name: "Leather Strap",
        fullName: "PP Leather Strap",
        badge: "Premium Pick",
        price: 4999,
        originalPrice: 7000,
        shortDescription: "White exhibition dial with premium leather strap — Brown or Black.",
        description:
          "The PP Leather Strap collection pairs a clean white textured dial with refined leather craftsmanship. The exhibition case back reveals the semi-automatic movement in action. Choose Classic Brown for a warm day-to-night look, or Classic Black for sharp formal occasions. Both feature a polished stainless steel case, date window, and water-resistant build.",
        features: [
          "White textured dial with exhibition case back",
          "Semi-automatic movement visible through case back",
          "Polished stainless steel body",
          "Premium stitched leather strap",
          "Date Feature",
          "Water-resistant for everyday use",
          "Available in Brown & Black leather",
        ],
        rating: 4.9,
        reviewCount: 486,
        orders24h: 40,
        defaultVariant: "black",
        variants: [
          {
            id: "black",
            name: "Classic Black",
            swatch: "#1A1A1A",
            images: [
              "/products/pp/leather-strap/black/1.webp",
              "/products/pp/leather-strap/black/2.webp",
              "/products/pp/leather-strap/black/3.webp",
              "/products/pp/leather-strap/black/4.webp",
              "/products/pp/leather-strap/black/5.webp",
            ],
            badge: "Formal Pick",
          },
          {
            id: "brown",
            name: "Classic Brown",
            swatch: "#7B4B2A",
            images: [
              "/products/pp/leather-strap/brown/1.webp",
              "/products/pp/leather-strap/brown/2.webp",
              "/products/pp/leather-strap/brown/3.webp",
              "/products/pp/leather-strap/brown/4.webp",
              "/products/pp/leather-strap/brown/5.webp",
            ],
            badge: "Premium Pick",
          },
        ],
      },

      // ── PP Dual Tone Chain ────────────────────────────────────────────────
      {
        id: "pp-dual-tone",
        categoryId: "pp",
        name: "Dual Tone Chain",
        fullName: "PP Dual Tone Chain",
        badge: "New Arrival",
        price: 4499,
        originalPrice: 6500,
        shortDescription: "Gold and silver two-tone chain bracelet — 3 dial colors.",
        description:
          "The PP Dual Tone Chain makes a statement with its distinctive gold and silver two-tone integrated bracelet. Available in three classic dial options — Black for authority, White for elegance, and Gold for maximum impact. The mixed-metal construction delivers a high-jewelry look at a fraction of the cost. Same automatic movement, same build quality, just more presence on the wrist.",
        features: [
          "Movement : Quartz",
          "Water Resistance: Yes",
          "Strap Material: Gold/Silver Color Stainless Steel",
          "Watch Case Shape: Rounded Square",
          "Watch Case Size: 30mm to 32mm",
          "Dial size: 32mm",
          "Watch Feature: Date",
          "Available in 3 dial colors",
        ],
        rating: 4.8,
        reviewCount: 0,
        orders24h: 0,
        defaultVariant: "white",
        variants: [
          {
            id: "white",
            name: "Ivory White",
            swatch: "#E8E8E8",
            swatchBorder: true,
            cardImage: "/products/pp/dual-tone/white/1.webp",
            images: ["/products/pp/dual-tone/white/3.webp", "/products/pp/dual-tone/white/2.webp"],
          },
          {
            id: "black",
            name: "Midnight Black",
            swatch: "#1A1A1A",
            cardImage: "/products/pp/dual-tone/black/1.webp",
            images: ["/products/pp/dual-tone/black/3.webp", "/products/pp/dual-tone/black/2.webp"],
            badge: "New Arrival",
          },
          {
            id: "gold",
            name: "Champagne Gold",
            swatch: "#D4AF37",
            cardImage: "/products/pp/dual-tone/gold/1.webp",
            images: ["/products/pp/dual-tone/gold/3.webp", "/products/pp/dual-tone/gold/2.webp"],
          },
        ],
      },

    ],
  },

  {
    id: "tst",
    name: "TST",
    groups: [

      // ── TST Single Tone Chain ─────────────────────────────────────────────
      {
        id: "tst-single-tone",
        categoryId: "tst",
        name: "Single Tone Chain",
        fullName: "TST Single Tone Chain",
        badge: "Most Exclusive",
        price: 3999,
        originalPrice: 5500,
        shortDescription: "Shine-finish dial with integrated silver chain bracelet.",
        description:
          "The TST Single Tone Chain is defined by its distinctive shine-finish dial that catches and reflects light beautifully under any condition. The integrated stainless steel bracelet and slim case profile give it a seamless, modern silhouette. Sharing the same Swiss-inspired quartz movement, sapphire crystal, and precise date display.",
        features: [
          "Shine-finish dial with sunburst light effect",
          "Swiss quartz movement for precise timekeeping",
          "Integrated silver stainless steel bracelet",
          "Scratch-resistant sapphire crystal",
          "Date display at 3 o'clock",
          "Slim minimalist case design",
          "Water-resistant build",
        ],
        rating: 4.9,
        reviewCount: 89,
        orders24h: 18,
        defaultVariant: "silver",
        variants: [
          {
            id: "silver",
            name: "Deep Blue",
            swatch: "#1E3D6B",
            cardImage: "/products/tst/single-tone/deep-blue/2.webp",
            images: [
              "/products/tst/single-tone/deep-blue/1.webp",
              "/products/tst/single-tone/deep-blue/2.webp",
              "/products/tst/single-tone/deep-blue/3.webp",
            ],
            badge: "Most Exclusive",
          },
        ],
      },

    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getGroupById(id: string): ProductGroup | undefined {
  for (const cat of catalog) {
    const g = cat.groups.find((g) => g.id === id);
    if (g) return g;
  }
  return undefined;
}

export function getVariant(group: ProductGroup, variantId: string): Variant {
  return (
    group.variants.find((v) => v.id === variantId) ??
    group.variants.find((v) => v.id === group.defaultVariant) ??
    group.variants[0]
  );
}

// Old individual product IDs → new group URL with color param
export const LEGACY_REDIRECTS: Record<string, string> = {
  "watch-ice-blue":      "/product/pp-single-tone/?color=ice-blue",
  "watch-deep-blue":     "/product/pp-single-tone/?color=deep-blue",
  "watch-classic-brown": "/product/pp-leather-strap/?color=brown",
  "watch-classic-black": "/product/pp-leather-strap/?color=black",
  "tissot-quartz-blue":  "/product/tst-single-tone/",
};

export function getAllProductRouteIds(): string[] {
  const groupIds = catalog.flatMap((c) => c.groups.map((g) => g.id));
  const legacyIds = Object.keys(LEGACY_REDIRECTS);
  return [...groupIds, ...legacyIds];
}
