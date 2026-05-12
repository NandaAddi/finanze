"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Upload, Loader2 } from "lucide-react";
import { compressAndConvertToWebP } from "@/lib/image-utils";
import { toast } from "sonner";
import { useMounted } from "@/hooks/use-mounted";

interface AvatarPickerProps {
  currentAvatar?: string;
  onAvatarChange: (url: string) => void;
  userName?: string;
}

export function AvatarPicker({ currentAvatar, onAvatarChange, userName }: AvatarPickerProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mounted = useMounted();

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
              fileName: `avatar-${Date.now()}.webp`,
              content: base64,
              path: "avatars",
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
      onAvatarChange(url);
      toast.success("Avatar updated!");
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDiceBear = () => {
    const seed = Math.random().toString(36).substring(7);
    const url = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}`;
    onAvatarChange(url);
    toast.success("Generated random avatar!");
  };

  return (
    <div className="relative group">
      <Avatar className="h-24 w-24 border-4 border-background ring-2 ring-primary/20">
        <AvatarImage src={currentAvatar} alt="Profile" className="object-cover" />
        <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
          {mounted ? (userName?.[0]?.toUpperCase() || "?") : "?"}
        </AvatarFallback>
      </Avatar>

      <div className="absolute -bottom-1 -right-1 flex gap-1">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-full shadow-lg border border-border"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-full shadow-lg border border-border"
          onClick={handleDiceBear}
          disabled={loading}
          title="Randomize with DiceBear"
        >
          <RefreshCw className="h-4 w-4" />
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
