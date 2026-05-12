"use client";

import { useUser } from "@/components/user-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export function ProfileHeader() {
  const { user } = useUser();

  return (
    <div className="relative mb-8">
      {/* Banner */}
      <div className="h-48 w-full rounded-2xl overflow-hidden bg-muted relative">
        {user?.banner_url ? (
          <Image
            src={user.banner_url}
            alt="Banner"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Profile Info Overlay */}
      <div className="absolute -bottom-6 left-8 flex items-end gap-6">
        <Avatar className="h-28 w-28 border-4 border-background shadow-xl ring-2 ring-primary/20">
          <AvatarImage src={user?.avatar_url} alt={user?.full_name || "User"} className="object-cover" />
          <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
            {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>

        <div className="mb-4 text-white drop-shadow-md">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{user?.full_name || "Anonymous User"}</h2>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-90">{user?.email}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
