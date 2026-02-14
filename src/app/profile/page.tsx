"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { createClient } from "@/lib/supabase/client";

const MAX_PHOTOS = 3;

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUserPhotos } = useApp();
  const [photos, setPhotos] = useState<(File | null)[]>([null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!user) {
      router.replace("/signup");
      return;
    }
    // Load existing photos into previews
    if (user.photos && user.photos.length > 0) {
      const existingPreviews = [...previews];
      user.photos.forEach((url, i) => {
        if (i < MAX_PHOTOS) existingPreviews[i] = url;
      });
      setPreviews(existingPreviews);
    }
  }, [user, router]);

  const handleFileSelect = (index: number, file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setError(null);
    setSuccess(false);
    const newPhotos = [...photos];
    newPhotos[index] = file;
    setPhotos(newPhotos);

    const reader = new FileReader();
    reader.onload = (e) => {
      const newPreviews = [...previews];
      newPreviews[index] = e.target?.result as string;
      setPreviews(newPreviews);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    const newPreviews = [...previews];
    newPhotos[index] = null;
    newPreviews[index] = null;
    setPhotos(newPhotos);
    setPreviews(newPreviews);
    setSuccess(false);
    if (fileInputs.current[index]) {
      fileInputs.current[index]!.value = "";
    }
  };

  const handleUpload = async () => {
    if (!user) {
      setError("You must be signed in");
      return;
    }

    // Check if any new files were selected
    const hasNewFiles = photos.some((p) => p !== null);
    if (!hasNewFiles) {
      setError("Please select at least one new photo to upload");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured");
      setUploading(false);
      return;
    }

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < previews.length; i++) {
        const file = photos[i];
        const preview = previews[i];

        // If there's a new file, upload it
        if (file) {
          const fileExt = file.name.split(".").pop() ?? "jpg";
          const filePath = `${user.id}/${i}-${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("profile-photos")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: true,
            });

          if (uploadError) {
            setError(`Upload failed: ${uploadError.message}`);
            setUploading(false);
            return;
          }

          const { data: urlData } = supabase.storage
            .from("profile-photos")
            .getPublicUrl(filePath);

          uploadedUrls.push(urlData.publicUrl);
        } else if (preview) {
          // Keep existing photo URL
          uploadedUrls.push(preview);
        }
      }

      const { error: saveError } = await updateUserPhotos(uploadedUrls);
      if (saveError) {
        setError(saveError.message);
        setUploading(false);
        return;
      }

      setSuccess(true);
      setPhotos([null, null, null]); // Clear the new file selections
      setUploading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setUploading(false);
    }
  };

  if (!user) return null;

  const hasChanges = photos.some((p) => p !== null);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-6 px-4 border-b border-[#550015]">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/matches" className="text-[#A89888] hover:text-[#F5F0E8] text-sm">
            ← Matches
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-medium text-[#F5F0E8] [font-family:var(--font-cormorant)] mb-1">
          {user.name}
        </h1>
        <p className="text-[#D4C9BC] text-sm mb-8">
          {user.age} · {user.location}
        </p>

        <section className="mt-8">
          <h2 className="text-lg font-medium text-[#F5F0E8] mb-4">Your photos</h2>
          <p className="text-[#D4C9BC] text-sm mb-6">
            Click on a photo to replace it, or add new ones. Up to {MAX_PHOTOS} photos.
          </p>

          {error && (
            <p className="text-sm text-[#940128] bg-[#940128]/10 rounded-xl px-4 py-2 mb-6">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-[#800022] bg-[#800022]/10 rounded-xl px-4 py-2 mb-6">
              Photos updated successfully!
            </p>
          )}

          <div className="grid grid-cols-3 gap-4 mb-6">
            {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
              <div key={i} className="relative aspect-[3/4]">
                {previews[i] ? (
                  <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-[#800022] group">
                    <Image
                      src={previews[i]!}
                      alt={`Photo ${i + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => fileInputs.current[i]?.click()}
                        className="px-3 py-1.5 rounded-lg bg-[#F5F0E8] text-[#3F1414] text-xs font-medium hover:bg-white transition-colors"
                      >
                        Replace
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#3F1414]/80 text-[#F5F0E8] flex items-center justify-center text-sm hover:bg-[#940128] transition-colors z-10"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputs.current[i]?.click()}
                    className="w-full h-full rounded-2xl border-2 border-dashed border-[#800022]/40 bg-[#550015]/30 flex flex-col items-center justify-center text-[#A89888] hover:border-[#800022] hover:text-[#D4C9BC] transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-8 h-8 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    <span className="text-xs">Add photo</span>
                  </button>
                )}
                <input
                  ref={(el) => { fileInputs.current[i] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(i, e.target.files?.[0] ?? null)}
                />
              </div>
            ))}
          </div>

          {hasChanges && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="w-full rounded-xl bg-[#940128] text-[#F5F0E8] py-3 font-medium hover:bg-[#800022] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading…" : "Save photos"}
            </button>
          )}
        </section>
      </main>
    </div>
  );
}
