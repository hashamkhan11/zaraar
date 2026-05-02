"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

interface SocialProofProps {
  stock: number;
}

export default function SocialProof({ stock }: SocialProofProps) {
  const [viewers, setViewers] = useState(() => Math.floor(Math.random() * 22) + 8);

  useEffect(() => {
    const t = setInterval(() => {
      setViewers((v) => Math.max(5, Math.min(55, v + Math.floor(Math.random() * 3) - 1)));
    }, 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-5 my-5">
      {/* Viewers — subtle, no colored box */}
      <span className="flex items-center gap-1.5 text-xs text-gray-500">
        <Eye className="w-3.5 h-3.5 text-gray-400" />
        <span>{viewers} viewing now</span>
      </span>

      {/* Low stock — only when relevant, no dramatic styling */}
      {stock <= 5 && (
        <span className="text-xs text-gray-500">
          Only <span className="font-medium text-gray-800">{stock} left</span> in stock
        </span>
      )}
    </div>
  );
}
