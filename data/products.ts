export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  images: string[];
  description: string;
  shortDescription: string;
  features: string[];
  badge?: string;
  stock: number;
  orders24h: number;
  rating: number;
  reviewCount: number;
}

export const products: Product[] = [
  {
    id: "watch-ice-blue",
    name: "PP Ice Blue",
    price: 4000,
    originalPrice: 5500,
    images: ["/products/pp/single-tone/ice-blue/1.webp"],
    shortDescription:
      "Premium ice-blue dial watch with a luxury-inspired stainless steel design at an affordable price.",
    description:
      "The Patek Philippe Ice Blue Edition is designed for those who appreciate luxury styling without spending a fortune. Featuring a stunning ice-blue textured dial, this timepiece instantly stands out with elegance and modern sophistication. Crafted with a polished stainless steel body and detailed finishing, it delivers a premium feel on the wrist. The luminous markers ensure visibility in low light, while the durable build makes it perfect for everyday wear. Whether you're dressing for a formal event or upgrading your daily style, this watch gives you that luxury presence — without the luxury price tag.",
    features: [
      "Automatic Watch",
      "Date and Time",
      "Water resistant up to 30 metres",
      "Premium Quality",
      "Excellent Finishing",
      "Limited Edition",
      "Dial Size: 42mm",
      "Premium Packing",
    ],
    badge: "Best Seller",
    stock: 7,
    orders24h: 27,
    rating: 4.9,
    reviewCount: 128,
  },
  {
    id: "watch-deep-blue",
    name: "PP Deep Blue",
    price: 4000,
    originalPrice: 5000,
    images: ["/products/pp/single-tone/deep-blue/1.webp"],
    shortDescription:
      "Premium deep-blue dial watch with a luxury-inspired stainless steel design, crafted to deliver high-end look.",
    description:
      "The Patek Philippe Deep Blue Edition is made for those who prefer a stronger, more refined presence on the wrist. Featuring a rich deep-blue textured dial, this timepiece reflects depth, elegance, and modern luxury. The polished stainless steel construction enhances durability while maintaining a sleek, premium finish. Luminous hour markers ensure clear visibility in low light, making it as practical as it is stylish. Perfect for both formal occasions and everyday wear, this watch elevates your style effortlessly — giving you a luxury feel without the premium price.",
    features: [
      "Automatic Watch",
      "Date and Time",
      "Water resistant up to 30 metres",
      "Premium Quality",
      "Excellent Finishing",
      "Limited Edition",
      "Dial Size: 42mm",
      "Premium Packing",
    ],
    badge: "New Arrival",
    stock: 5,
    orders24h: 19,
    rating: 4.8,
    reviewCount: 74,
  },
  {
    id: "watch-classic-brown",
    name: "PP Classic Brown",
    price: 5000,
    originalPrice: 6500,
    images: ["/products/pp/leather-strap/brown/1.webp"],
    shortDescription:
      "Timeless white elegance paired with a sleek premium brown leather strap.",
    description:
      "Exude timeless sophistication with this Patek Philippe Geneve edition, featuring a clean white textured dial that reflects light beautifully from every angle. Crafted with a high-grade stainless steel case and paired with a refined brown leather strap, this timepiece delivers a bold yet classic look. The transparent exhibition back reveals the intricate semi-automatic movement in action, showcasing true mechanical craftsmanship. Designed for the modern gentleman, it combines elegance, durability, and reliable water-resistant performance — perfect for both formal wear and everyday style.",
    features: [
      "White textured dial with horizontal lines & silver-tone markers",
      "Exhibition back case showcasing semi-automatic movement",
      "Polished stainless steel body for durability",
      "Premium stitched brown leather strap",
      "Date window at 3 o'clock position",
      "Water-resistant for everyday use",
      "Elegant contrast of silver steel & black leather",
      "Luxury presentation with refined finishing",
    ],
    badge: "Premium Pick",
    stock: 4,
    orders24h: 14,
    rating: 4.9,
    reviewCount: 96,
  },
  {
    id: "watch-classic-black",
    name: "PP Classic Black",
    price: 5000,
    originalPrice: 6500,
    images: ["/products/pp/leather-strap/black/1.webp"],
    shortDescription:
 "Timeless white elegance paired with a sleek premium black leather strap.",
    description:
      "Exude timeless sophistication with this Patek Philippe Geneve edition, featuring a clean white textured dial that reflects light beautifully from every angle. Crafted with a high-grade stainless steel case and paired with a refined black leather strap, this timepiece delivers a bold yet classic look. The transparent exhibition back reveals the intricate semi-automatic movement in action, showcasing true mechanical craftsmanship. Designed for the modern gentleman, it combines elegance, durability, and reliable water-resistant performance — perfect for both formal wear and everyday style.",
    features: [
    "White textured dial with horizontal lines & silver-tone markers",
      "Exhibition back case showcasing semi-automatic movement",
      "Polished stainless steel body for durability",
      "Premium stitched brown leather strap",
      "Date window at 3 o'clock position",
      "Water-resistant for everyday use",
      "Elegant contrast of silver steel & black leather",
      "Luxury presentation with refined finishing",
    ],
    badge: "Formal Pick",
    stock: 9,
    orders24h: 11,
    rating: 4.8,
    reviewCount: 53,
  },
  {
    id: "tissot-quartz-blue",
    name: "TST Quartz Blue",
    price: 4000,
    originalPrice: 5500,
    images: ["/products/tst/single-tone/deep-blue/1.webp"],
    shortDescription:
      "Sleek blue gradient dial with a stainless steel integrated bracelet — a perfect blend of modern style and Swiss precision.",
    description:
      "The Tissot PRX Blue Dial is a true statement of refined simplicity and contemporary design. Featuring a striking blue gradient dial that shifts beautifully under light, this timepiece captures attention while maintaining a clean, minimalist aesthetic. The integrated stainless steel bracelet and slim case design provide a seamless, comfortable fit on the wrist. Built with Swiss precision and attention to detail, it ensures reliable performance for everyday wear. Whether you're heading to a formal event or elevating your daily style, the PRX delivers timeless elegance with a modern edge.",
    features: [
      "Blue gradient dial with sunburst effect",
      "Slim, minimalist design with clean markers",
      "Integrated stainless steel bracelet",
      "Swiss quartz movement for precise timekeeping",
      "Date display at 3 o'clock position",
      "Durable stainless steel case",
      "Scratch-resistant sapphire crystal",
      "Comfortable and stylish for daily wear",
    ],
    badge: "Most Exclusive",
    stock: 3,
    orders24h: 8,
    rating: 5.0,
    reviewCount: 41,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}