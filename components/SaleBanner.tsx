"use client";
import { useState, useEffect } from "react";

const SALE_END = new Date("2026-05-20T23:59:59+05:00");

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function SaleBanner() {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = SALE_END.getTime() - Date.now();
      if (diff <= 0) { setExpired(true); return; }
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (expired) return null;

  return (
    <div className="bg-[#3D1F0F] text-white px-4 py-2.5 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
      <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#C4976A]">
        ☪ Eid ul Azha Sale
      </span>
      <div className="h-3 w-px bg-white/20 hidden sm:block" />
      <div className="flex items-center gap-1 font-mono text-[11px] font-bold">
        <span className="bg-white/10 px-1.5 py-0.5 rounded">{pad(time.d)}d</span>
        <span className="text-white/40">:</span>
        <span className="bg-white/10 px-1.5 py-0.5 rounded">{pad(time.h)}h</span>
        <span className="text-white/40">:</span>
        <span className="bg-white/10 px-1.5 py-0.5 rounded">{pad(time.m)}m</span>
        <span className="text-white/40">:</span>
        <span className="bg-white/10 px-1.5 py-0.5 rounded">{pad(time.s)}s</span>
      </div>
      <div className="h-3 w-px bg-white/20 hidden sm:block" />
      <span className="text-[10px] text-white/50 tracking-wide hidden sm:inline">Ends May 20</span>
    </div>
  );
}
