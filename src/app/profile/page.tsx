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
  const { user, updateUserPhotos, updateUserLocation, changePassword, deleteAccount, signOut } = useApp();
  const [photos, setPhotos] = useState<(File | null)[]>([null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Location editing state
  const [location, setLocation] = useState("");
  const [locationSaving, setLocationSaving] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/signup");
      return;
    }
    // Load existing photos into previews
    if (user.photos && user.photos.length > 0) {
      const existingPreviews: (string | null)[] = [null, null, null];
      user.photos.forEach((url, i) => {
        if (i < MAX_PHOTOS) existingPreviews[i] = url;
      });
      setPreviews(existingPreviews);
    }
    setLocation(user.location || "");
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
      setPhotos([null, null, null]);
      setUploading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setUploading(false);
    }
  };

  const handleLocationSave = async () => {
    const trimmed = location.trim();
    if (!trimmed) {
      setLocationError("Location cannot be empty");
      return;
    }
    if (trimmed === user?.location) return;

    setLocationSaving(true);
    setLocationError(null);
    setLocationSuccess(false);

    const { error } = await updateUserLocation(trimmed);
    if (error) {
      setLocationError(error.message);
    } else {
      setLocationSuccess(true);
      setTimeout(() => setLocationSuccess(false), 2000);
    }
    setLocationSaving(false);
  };

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const { error } = await deleteAccount();
    if (error) {
      setDeleting(false);
      setShowDeleteConfirm(false);
      return;
    }
    router.push("/");
  };

  if (!user) return null;

  const hasPhotoChanges = photos.some((p) => p !== null);
  const locationChanged = location.trim() !== (user.location || "");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-6 px-4 border-b border-[#550015]">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/matches" className="text-[#A89888] hover:text-[#F5F0E8] text-sm">
            ← Matches
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-10">
        {/* Profile Info */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-medium text-[#F5F0E8] [font-family:var(--font-cormorant)]">
              Profile settings
            </h1>
            <Link
              href="/settings"
              className="text-sm text-[#D4C9BC] hover:text-[#F5F0E8] transition-colors"
            >
              Change password →
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#A89888] mb-1">Email</label>
              <p className="text-sm text-[#D4C9BC] bg-[#550015]/30 rounded-xl px-4 py-3 border border-[#800022]/20">
                {user.email}
              </p>
            </div>

            <div>
              <label className="block text-xs text-[#A89888] mb-1">Name</label>
              <p className="text-sm text-[#D4C9BC] bg-[#550015]/30 rounded-xl px-4 py-3 border border-[#800022]/20">
                {user.name}
              </p>
            </div>

            <div>
              <label className="block text-xs text-[#A89888] mb-1">Age</label>
              <p className="text-sm text-[#D4C9BC] bg-[#550015]/30 rounded-xl px-4 py-3 border border-[#800022]/20">
                {user.age}
              </p>
            </div>

            <div>
              <label className="block text-xs text-[#A89888] mb-1">City</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setLocationSuccess(false);
                    setLocationError(null);
                  }}
                  className="flex-1 text-sm text-[#F5F0E8] bg-[#550015] rounded-xl px-4 py-3 border border-[#800022]/30 focus:border-[#800022] focus:outline-none"
                />
                {locationChanged && (
                  <button
                    type="button"
                    onClick={handleLocationSave}
                    disabled={locationSaving}
                    className="rounded-xl bg-[#940128] text-[#F5F0E8] px-5 py-3 text-sm font-medium hover:bg-[#800022] transition-colors disabled:opacity-60"
                  >
                    {locationSaving ? "Saving…" : "Save"}
                  </button>
                )}
              </div>
              {locationError && (
                <p className="text-xs text-[#940128] mt-1">{locationError}</p>
              )}
              {locationSuccess && (
                <p className="text-xs text-green-400 mt-1">Location updated</p>
              )}
            </div>
          </div>
        </section>

        {/* Photos */}
        <section>
          <h2 className="text-lg font-medium text-[#F5F0E8] mb-2">Your photos</h2>
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

          {hasPhotoChanges && (
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

        {/* Account actions */}
        <section className="border-t border-[#2A2A2E] pt-8 space-y-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full rounded-xl border border-[#800022]/30 bg-[#550015]/30 text-[#F5F0E8] py-3 text-sm font-medium hover:bg-[#550015] transition-colors"
          >
            Sign out
          </button>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full rounded-xl border border-[#940128]/30 text-[#940128] py-3 text-sm font-medium hover:bg-[#940128]/10 transition-colors"
            >
              Delete account
            </button>
          ) : (
            <div className="rounded-xl border border-[#940128]/40 bg-[#940128]/10 p-4 space-y-3">
              <p className="text-sm text-[#F5F0E8]">
                Are you sure? This will permanently delete your account, matches, and all conversations.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-[#940128] text-white py-2.5 text-sm font-medium hover:bg-[#800022] transition-colors disabled:opacity-60"
                >
                  {deleting ? "Deleting…" : "Yes, delete my account"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-xl border border-[#2A2A2E] text-[#D4C9BC] py-2.5 text-sm font-medium hover:bg-[#2A2A2E]/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
