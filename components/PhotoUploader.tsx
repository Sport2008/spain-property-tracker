"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { savePhotoRecord, deletePhoto } from "@/actions/photos";
import type { PropertyPhoto } from "@/lib/types";

interface Props {
  propertyId: string;
  userId: string;
  existingPhotos: PropertyPhoto[];
}

interface LocalPhoto {
  id: string;
  url: string;
  storagePath: string;
}

export default function PhotoUploader({ propertyId, userId, existingPhotos }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const getPublicUrl = (path: string) =>
    supabase.storage.from("property-photos").getPublicUrl(path).data.publicUrl;

  const [photos, setPhotos] = useState<LocalPhoto[]>(
    existingPhotos.map((p) => ({
      id: p.id,
      url: getPublicUrl(p.storage_path),
      storagePath: p.storage_path,
    }))
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) {
        setError("Max file size is 10 MB.");
        continue;
      }

      const ext = file.name.split(".").pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const storagePath = `${userId}/${propertyId}/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("property-photos")
        .upload(storagePath, file, { upsert: false });

      if (uploadError) {
        setError(uploadError.message);
        continue;
      }

      const { error: dbError } = await savePhotoRecord(propertyId, storagePath);
      if (dbError) {
        setError(dbError);
        continue;
      }

      const url = getPublicUrl(storagePath);
      setPhotos((prev) => [
        ...prev,
        { id: storagePath, url, storagePath },
      ]);
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete(photo: LocalPhoto) {
    const dbPhoto = existingPhotos.find((p) => p.storage_path === photo.storagePath);
    if (!dbPhoto) {
      setPhotos((prev) => prev.filter((p) => p.storagePath !== photo.storagePath));
      return;
    }

    const { error } = await deletePhoto(dbPhoto.id, photo.storagePath, propertyId);
    if (error) {
      setError(error);
    } else {
      setPhotos((prev) => prev.filter((p) => p.storagePath !== photo.storagePath));
    }
  }

  return (
    <div className="space-y-3">
      {/* Thumbnails */}
      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {photos.map((photo) => (
            <div key={photo.storagePath} className="relative w-24 h-24 rounded-xl overflow-hidden">
              <Image src={photo.url} alt="" fill className="object-cover" sizes="96px" />
              <button
                type="button"
                onClick={() => handleDelete(photo)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-orange-400 hover:text-orange-500 transition disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4-4 4 4 4-8 4 8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 20h20" />
        </svg>
        {uploading ? "Uploading…" : "Add photos"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
