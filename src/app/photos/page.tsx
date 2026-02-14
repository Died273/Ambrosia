"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { createClient } from "@/lib/supabase/client";

const MAX_PHOTOS = 3;

export default function PhotosPage() {
  const router = useRouter();
  const { user, updateUserPhotos } = useApp();
  const [photos, setPhotos] = useState<(File | null)[]>([null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!user) {
      router.replace("/signup");
    }
  }, [user, router]);

  const handleFileSelect = (index: number, file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setError(null);
    const newPhotos = [...photos];
    newPhotos[index] = file;
    setPhotos(newPhotos);

    // Create preview
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
    // Reset the file input
    if (fileInputs.current[index]) {
      fileInputs.current[index]!.value = "";
    }
  };

  const handleUpload = async () => {
    const filesToUpload = photos.filter((p): p is File => p !== null);
    if (filesToUpload.length === 0) {
      setError("Please select at least one photo");
      return;
    }

    if (!user) {
      setError("You must be signed in");
      return;
    }

    setUploading(true);
    setError(null);

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured");
      setUploading(false);
      return;
    }

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        if (!file) continue;

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
      }

      // Save photo URLs to profile
      const { error: saveError } = await updateUserPhotos(uploadedUrls);
      if (saveError) {
        setError(saveError.message);
        setUploading(false);
        return;
      }

      router.push("/matches");
    } catch {
      setError("Something went wrong. Please try again.");
      setUploading(false);
    }
  };

  if (!user) return null;

  const photoCount = photos.filter((p) => p !== null).length;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-4">
        <button
          type="button"
          onClick={() => router.push("/matches")}
          className="text-[#A89888] hover:text-[#F5F0E8] text-sm"
        >
          Skip for now →
        </button>
      </header>
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-medium text-[#F5F0E8] [font-family:var(--font-cormorant)] mb-2">
          Add your photos
        </h1>
        <p className="text-[#D4C9BC] text-sm mb-8">
          Upload up to {MAX_PHOTOS} photos. These will be blurred until your matches get to know you.
        </p>

        {error && (
          <p className="text-sm text-[#940128] bg-[#940128]/10 rounded-xl px-4 py-2 mb-6">
            {error}
          </p>
        )}

        <div className="grid grid-cols-3 gap-4 mb-8">
          {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
            <div key={i} className="relative aspect-[3/4]">
              {previews[i] ? (
                <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-[#800022]">
                  <img
                    src={previews[i]!}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#3F1414]/80 text-[#F5F0E8] flex items-center justify-center text-sm hover:bg-[#940128] transition-colors"
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
                  <span className="text-xs">Photo {i + 1}</span>
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

        <p className="text-center text-xs text-[#A89888] mb-6">
          {photoCount} of {MAX_PHOTOS} photos selected · Max 5MB each
        </p>

        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || photoCount === 0}
          className="w-full rounded-xl bg-[#940128] text-[#F5F0E8] py-3.5 font-medium hover:bg-[#800022] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading…" : "Upload & continue"}
        </button>
      </main>
    </div>
  );
}
