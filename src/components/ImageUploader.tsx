'use client';

import { useState, useRef, ChangeEvent } from 'react';

interface ImageUploaderProps {
  onImageSelect?: (file: File) => void;
  onUpload?: () => void;
}

export default function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageSelect?.(file);
  };

  const handleClear = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!previewUrl ? (
        <button
          onClick={handleClick}
          className="w-full h-32 sm:h-48 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg
                     flex flex-col items-center justify-center gap-2
                     hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800
                     transition-colors"
        >
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Optional: Add image
          </span>
        </button>
      ) : (
        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-contain"
          />

          {/* 操作按钮 */}
          <div className="absolute bottom-2 right-2 flex gap-1">
            <button
              onClick={handleClear}
              className="p-2 bg-white/90 dark:bg-black/80 rounded-full
                         hover:bg-white dark:hover:bg-black transition-colors"
              aria-label="Remove image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
