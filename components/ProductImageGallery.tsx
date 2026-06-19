"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface Props {
  images: string[];
  name: string;
}

const MAX_SCALE = 3;

function dist(a: React.Touch, b: React.Touch) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

export default function ProductImageGallery({ images, name }: Props) {
  const loop = images.length > 1;
  // Clone last image before the first, and first image after the last,
  // so swiping past either end continues seamlessly into the other.
  const slides = loop ? [images[images.length - 1], ...images, images[0]] : images;

  const [index, setIndex] = useState(loop ? 1 : 0);
  const [withTransition, setWithTransition] = useState(true);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef(0);

  // Pinch-to-zoom state (applies to the active slide only)
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zooming, setZooming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pinchRef = useRef<{ startDist: number; startScale: number } | null>(null);
  const panRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const prevTouchCountRef = useRef(0);

  const realIndex = loop ? (index - 1 + images.length) % images.length : index;

  const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(1, s));

  const clampPan = (x: number, y: number, s: number) => {
    const el = containerRef.current;
    const maxX = el ? (el.clientWidth * (s - 1)) / 2 : 0;
    const maxY = el ? (el.clientHeight * (s - 1)) / 2 : 0;
    return { x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) };
  };

  const resetZoom = () => { setScale(1); setPan({ x: 0, y: 0 }); };

  const goToReal = (i: number) => {
    resetZoom();
    setWithTransition(true);
    setIndex(loop ? i + 1 : i);
  };

  const step = (delta: number) => {
    resetZoom();
    setWithTransition(true);
    setIndex(i => i + delta);
  };

  // Single handler for touchstart/move/end — re-anchors the gesture
  // whenever the number of fingers on screen changes (pinch <-> pan <-> swipe).
  const handleTouches = (touches: React.TouchList) => {
    const count = touches.length;

    if (count !== prevTouchCountRef.current) {
      if (count === 2) {
        pinchRef.current = { startDist: dist(touches[0], touches[1]), startScale: scale };
        panRef.current = null;
        setDragging(false);
        setDragX(0);
        setZooming(true);
      } else if (count === 1) {
        pinchRef.current = null;
        if (scale > 1) {
          panRef.current = {
            startX: touches[0].clientX, startY: touches[0].clientY,
            originX: pan.x, originY: pan.y,
          };
          setDragging(false);
          setDragX(0);
          setZooming(true);
        } else if (loop) {
          panRef.current = null;
          startXRef.current = touches[0].clientX;
          setDragging(true);
        }
      } else if (count === 0) {
        pinchRef.current = null;
        panRef.current = null;
        setZooming(false);
        if (scale < 1.05) resetZoom();
        if (dragging) {
          setDragging(false);
          const threshold = 50;
          if (dragX > threshold) step(-1);
          else if (dragX < -threshold) step(1);
          setDragX(0);
        }
      }
      prevTouchCountRef.current = count;
    }

    if (count === 2 && pinchRef.current) {
      const next = clampScale(pinchRef.current.startScale * (dist(touches[0], touches[1]) / pinchRef.current.startDist));
      setScale(next);
      setPan(p => clampPan(p.x, p.y, next));
    } else if (count === 1) {
      if (panRef.current) {
        const dx = touches[0].clientX - panRef.current.startX;
        const dy = touches[0].clientY - panRef.current.startY;
        setPan(clampPan(panRef.current.originX + dx, panRef.current.originY + dy, scale));
      } else if (dragging) {
        setDragX(touches[0].clientX - startXRef.current);
      }
    }
  };

  const onTouchStart = (e: React.TouchEvent) => handleTouches(e.touches);
  const onTouchMove  = (e: React.TouchEvent) => handleTouches(e.touches);
  const onTouchEnd   = (e: React.TouchEvent) => handleTouches(e.touches);

  // After sliding into a cloned edge slide, snap invisibly to the matching
  // real slide on the other end so the next swipe can continue the loop.
  const onTrackTransitionEnd = () => {
    if (!loop) return;
    if (index === 0) {
      setWithTransition(false);
      setIndex(images.length);
    } else if (index === images.length + 1) {
      setWithTransition(false);
      setIndex(1);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main image — swipeable + pinch-to-zoom on touch, loops past either end */}
      <div
        ref={containerRef}
        className="relative aspect-square bg-white overflow-hidden touch-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          onTransitionEnd={onTrackTransitionEnd}
          className={`flex h-full ${dragging || !withTransition ? "" : "transition-transform duration-300 ease-out"}`}
          style={{ transform: `translateX(calc(${-index * 100}% + ${dragX}px))` }}
        >
          {slides.map((img, i) => (
            <div key={`${img}-${i}`} className="relative w-full h-full shrink-0 overflow-hidden">
              <div
                className={`relative w-full h-full ${zooming ? "" : "transition-transform duration-200 ease-out"}`}
                style={i === index ? { transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` } : undefined}
              >
                <Image
                  src={img}
                  alt={`ZARAAR ${name}`}
                  fill
                  priority={loop ? i === 1 : i === 0}
                  loading={(loop ? i === 1 : i === 0) ? undefined : "eager"}
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-contain p-5 md:p-16"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goToReal(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === realIndex ? "w-5 bg-[#C9A84C]" : "w-1.5 bg-black/15"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className={`grid gap-2 ${images.length === 2 ? "grid-cols-2" : images.length === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => goToReal(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative aspect-square bg-white overflow-hidden border transition-all duration-200 active:opacity-100 ${
                i === realIndex
                  ? "border-[#C9A84C] opacity-100"
                  : "border-black/[0.07] opacity-45 hover:opacity-75"
              }`}
            >
              <Image
                src={img}
                alt=""
                fill
                sizes="15vw"
                className="object-contain p-3"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
