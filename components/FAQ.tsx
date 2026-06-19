"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Are these original watches from Patek Philippe, Tissot, or Hublot?",
    a: "No, and we are completely upfront about this. ZARAAR sells premium quality watches inspired by the designs of these iconic houses. They are independently manufactured to a high standard. We do not claim brand affiliation. What you see in the photos is exactly what arrives at your door.",
  },
  {
    q: "How do I place an order?",
    a: "Fill the order form on this page, or message us directly on WhatsApp. We will call you within the hour to confirm your order. You pay cash on delivery. Nothing upfront, nothing at risk on your end.",
  },
  {
    q: "Can I return the watch if I am not satisfied?",
    a: "Yes, absolutely. If you are unhappy for any reason, we accept returns within 7 days of delivery and issue a full refund, no questions asked. Just message us on WhatsApp and we will sort it out personally.",
  },
  {
    q: "How long does delivery take?",
    a: "Orders placed before 4pm are dispatched the same day. Orders placed on Sunday are dispatched on Monday. Delivery normally takes 2 to 3 business days, door to door, anywhere in Pakistan. In rare cases where a courier issue arises, it can take up to 5 days.",
  },
  {
    q: "What are the delivery charges?",
    a: "There is a flat Rs. 200 delivery charge on all orders, nationwide. This covers door to door courier delivery across all of Pakistan. You pay the product price plus Rs. 200 only when your watch arrives. Nothing is paid in advance.",
  },
  {
    q: "What if my watch arrives with a defect?",
    a: "It is extremely rare, but if it happens, photograph it and message us on WhatsApp immediately. We will replace the watch at no cost, or issue a full refund. Your choice. We stand behind every piece we ship.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-[#FAFAF8] py-20 md:py-28 px-6 md:px-14 xl:px-20 border-t border-black/[0.05]">
      <div className="max-w-screen-xl mx-auto">

        <div className="mb-14">
          <p className="font-body text-[8px] tracking-[0.38em] uppercase text-black/30 mb-4">
            Frequently Asked
          </p>
          <h2
            className="font-display font-light text-[#0A0A0A] tracking-tight leading-[1]"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
          >
            Common Questions.
          </h2>
        </div>

        <div>
          {FAQS.map((faq, i) => (
            <div key={i} className={`border-t border-black/[0.07] ${i === FAQS.length - 1 ? "border-b" : ""}`}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-start justify-between gap-6 py-6 text-left group"
                aria-expanded={open === i}
              >
                <span className="font-display font-light text-[1.05rem] md:text-[1.15rem] tracking-[0.02em] text-[#0A0A0A] group-hover:text-[#C9A84C] transition-colors duration-200 leading-snug">
                  {faq.q}
                </span>
                <span
                  className={`shrink-0 w-5 h-5 flex items-center justify-center font-body text-lg font-light transition-all duration-300 mt-0.5 ${
                    open === i ? "text-[#C9A84C] rotate-0" : "text-black/28"
                  }`}
                >
                  {open === i ? "−" : "+"}
                </span>
              </button>

              {open === i && (
                <div className="pb-8 pr-11">
                  <p className="font-body text-[13px] text-black/55 leading-[1.95]">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
