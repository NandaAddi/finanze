"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { compressAndConvertToWebP } from "@/lib/image-utils";
import { toast } from "sonner";
import Image from "next/image";

interface BannerPickerProps {
  currentBanner?: string;
  onBannerChange: (url: string) => void;
}

export function BannerPicker({ currentBanner, onBannerChange }: BannerPickerProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToGithub = async (file: File) => {
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        try {
          const res = await fetch("/api/upload/github", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: `banner-${Date.now()}.webp`,
              content: base64,
              path: "banners",
            }),
          });
          const data = await res.json();
          if (data.url) resolve(data.url);
          else reject(new Error(data.error || "Upload failed"));
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const compressed = await compressAndConvertToWebP(file);
      const url = await uploadToGithub(compressed);
      onBannerChange(url);
      toast.success("Banner updated!");
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-40 rounded-xl overflow-hidden bg-muted group">
      {currentBanner ? (
        <Image
          src={currentBanner}
          alt="Banner"
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-primary/10 via-primary/5 to-background flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No banner set</p>
        </div>
      )}

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Change Banner
        </Button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
