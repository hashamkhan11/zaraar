import Link from "next/link";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923000000000";
const TIKTOK   = "https://www.tiktok.com/@watchesbyfahad";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E8DDD4] mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

          {/* Brand */}
          <div>
            <p className="text-[#3D1F0F] font-display text-xl font-bold tracking-tight">WatchesByFahad</p>
            <p className="text-sm font-medium text-[#8B6A50] mt-1.5 max-w-xs leading-relaxed">
              Premium inspired design watches. Cash on Delivery across Pakistan.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm font-bold tracking-widest uppercase text-[#8B6A50]">
            <Link href="/#products" className="hover:text-[#3D1F0F] transition-colors">Shop</Link>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
              className="hover:text-[#3D1F0F] transition-colors">WhatsApp</a>
            <a href={TIKTOK} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#3D1F0F] transition-colors">
              <TikTokIcon className="w-3.5 h-3.5" />
              TikTok
            </a>
          </div>
        </div>

        <div className="border-t border-[#E8DDD4] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium text-[#6B5040]">
          <p>© {new Date().getFullYear()} WatchesByFahad. All rights reserved.</p>
          <p>Products are premium inspired designs, not original brand items.</p>
        </div>
      </div>
    </footer>
  );
}
