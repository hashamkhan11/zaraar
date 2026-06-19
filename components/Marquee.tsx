const PHRASES = [
  "PREMIUM QUALITY",
  "CASH ON DELIVERY",
  "ZARAAR",
  "WEAR TIME WELL",
  "2 TO 3 DAY DELIVERY",
  "2,000+ ORDERS",
  "RS. 200 DELIVERY CHARGE",
  "PAKISTAN WIDE",
];

export default function Marquee() {
  const doubled = [...PHRASES, ...PHRASES];

  return (
    <div className="bg-[#C9A84C] py-3 overflow-hidden select-none" aria-hidden="true">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((phrase, i) => (
          <span key={i} className="inline-flex items-center gap-6 px-6">
            <span className="font-body text-[8.5px] font-bold tracking-[0.4em] uppercase text-[#0A0A0A]">
              {phrase}
            </span>
            <span className="text-[#0A0A0A]/20 text-xs leading-none">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
