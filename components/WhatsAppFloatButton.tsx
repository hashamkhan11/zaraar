const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923000000000";

export default function WhatsAppFloatButton() {
  return (
    <a
      href={`https://wa.me/${WA}?text=${encodeURIComponent("Hi! I'm interested in ZARAAR watches.")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed left-5 bottom-5 z-50 flex items-center justify-center w-11 h-11 bg-[#0A0A0A] text-[#C9A84C] border border-[#C9A84C]/30 shadow-lg hover:bg-[#C9A84C] hover:text-[#0A0A0A] active:bg-[#C9A84C] active:text-[#0A0A0A] transition-all duration-300"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.5 1.34 5.02L2 22l5.12-1.34A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm0 18.18c-1.6 0-3.16-.43-4.52-1.24l-.32-.19-3.04.8.81-2.96-.21-.3a8.17 8.17 0 0 1-1.26-4.29c0-4.52 3.68-8.2 8.2-8.2s8.2 3.68 8.2 8.2-3.68 8.2-8.2 8.2Zm4.5-6.13c-.25-.12-1.45-.72-1.67-.8-.22-.08-.38-.12-.55.12-.16.25-.63.8-.77.96-.14.16-.28.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.22-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.28.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.16 1.73 2.64 4.2 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.45-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.47-.28Z"/>
      </svg>
    </a>
  );
}
