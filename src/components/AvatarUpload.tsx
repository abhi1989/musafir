"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  currentAvatarUrl?: string | null;
  userId: string;
  fullName?: string | null;
}

export default function AvatarUpload({
  currentAvatarUrl,
  userId,
  fullName,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);

      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-yellow-100 border-4 border-white shadow-md flex items-center justify-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl font-bold text-yellow-700">
              {fullName?.charAt(0)?.toUpperCase() || "?"}
            </span>
          )}
        </div>

        <label className="absolute bottom-0 right-0 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-gray-800 transition">
          {uploading ? (
            <span className="text-xs">...</span>
          ) : (
            <span className="text-sm">📷</span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
      )}
      {uploading && (
        <p className="text-gray-500 text-xs mt-2">Uploading...</p>
      )}
    </div>
  );
}