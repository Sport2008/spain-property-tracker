"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  urls: string[];
}

export default function PhotoGallery({ urls }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (urls.length === 0) return null;

  return (
    <>
      {/* Thumbnail grid */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {urls.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="relative flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden"
          >
            <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="112px" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white text-3xl leading-none z-10 p-2"
            onClick={() => setLightboxIndex(null)}
          >
            ×
          </button>

          {/* Prev */}
          {lightboxIndex > 0 && (
            <button
              type="button"
              className="absolute left-4 text-white text-4xl leading-none z-10 p-2"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i ?? 1) - 1); }}
            >
              ‹
            </button>
          )}

          <div
            className="relative w-full max-w-lg h-80"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={urls[lightboxIndex]}
              alt={`Photo ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="512px"
            />
          </div>

          {/* Next */}
          {lightboxIndex < urls.length - 1 && (
            <button
              type="button"
              className="absolute right-4 text-white text-4xl leading-none z-10 p-2"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i ?? 0) + 1); }}
            >
              ›
            </button>
          )}

          <p className="absolute bottom-6 text-white/60 text-sm">
            {lightboxIndex + 1} / {urls.length}
          </p>
        </div>
      )}
    </>
  );
}
