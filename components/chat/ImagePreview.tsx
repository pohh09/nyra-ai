'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ImageIcon, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  image?: string;
  images?: string[];
  onRemove: (index?: number) => void;
};

export default function ImagePreview({ image, images, onRemove }: Props) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const imageList = images && images.length > 0 ? images : image ? [image] : [];

  if (imageList.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2.5 max-w-full">
        {imageList.map((img, idx) => (
          <div
            key={idx}
            className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-purple-400/30 bg-[#130f24] shadow-lg shadow-purple-950/40 backdrop-blur-xl shrink-0 transition-all hover:border-purple-400/60"
          >
            {/* THUMBNAIL */}
            <Image
              src={img}
              alt={`Upload ${idx + 1}`}
              fill
              className="object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
              onClick={() => setLightboxSrc(img)}
            />

            {/* HOVER OVERLAY */}
            <div
              onClick={() => setLightboxSrc(img)}
              className="absolute inset-0 bg-purple-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer pointer-events-none"
            >
              <ZoomIn size={16} className="text-white drop-shadow" />
            </div>

            {/* REMOVE BUTTON */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(idx);
              }}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/75 hover:bg-red-500/90 text-white flex items-center justify-center transition-colors shadow-md z-10 cursor-pointer"
              title="Remove image"
            >
              <X size={12} />
            </button>

            {/* FOOTER BADGE */}
            <div className="absolute bottom-0 inset-x-0 bg-black/65 backdrop-blur-sm px-1.5 py-0.5 flex items-center justify-between text-[9px] font-mono text-purple-200 pointer-events-none">
              <span className="truncate">Img {idx + 1}</span>
              <ImageIcon size={10} className="text-purple-400 shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxSrc(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-purple-400/30 shadow-2xl bg-black"
            >
              <button
                onClick={() => setLightboxSrc(null)}
                className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lightboxSrc} alt="Enlarged preview" className="max-w-full max-h-[80vh] object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
