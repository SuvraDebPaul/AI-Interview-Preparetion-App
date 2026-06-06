"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface Props {
  onChange: (file: File | null) => void; // URL এর বদলে File pass করো
}

export default function ImageUpload({ onChange }: Props) {
  const [preview, setPreview] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // শুধু local preview — Cloudinary upload এখানে না
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    onChange(file); // File object parent-এ pass করো
  }

  function handleRemove() {
    setPreview("");
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/30 overflow-hidden cursor-pointer hover:border-primary transition-colors bg-muted"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <Image src={preview} alt="Preview" fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs">Photo</span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          {preview ? "Change" : "Upload photo"}
        </button>
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
