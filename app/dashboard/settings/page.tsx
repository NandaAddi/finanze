"use client";

import { useTheme } from "next-themes";
import { useUser } from "@/components/user-provider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { updateProfile } from "@/app/actions/finance";
import { toast } from "sonner";
import { Check, User, Palette, Shield, Loader2, Image as ImageIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AvatarPicker } from "@/components/profile/avatar-picker";
import { BannerPicker } from "@/components/profile/banner-picker";
import { useMounted } from "@/hooks/use-mounted";

const settingsSchema = z.object({
  full_name: z.string().max(100, "Name must be 100 characters or less").optional(),
  avatar_url: z.string().url("Invalid URL").or(z.literal("")).optional(),
  banner_url: z.string().url("Invalid URL").or(z.literal("")).optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, refreshUser } = useUser();
  const [saving, setSaving] = useState(false);
  const mounted = useMounted();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      avatar_url: user?.avatar_url || "",
      banner_url: user?.banner_url || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        full_name: user.full_name || "",
        avatar_url: user.avatar_url || "",
        banner_url: user.banner_url || "",
      });
    }
  }, [user, form]);

  async function onSubmit(values: SettingsFormValues) {
    if (!user?.id) return;
    setSaving(true);
    
    try {
      const result = await updateProfile(user.id, {
        full_name: values.full_name,
        avatar_url: values.avatar_url,
        banner_url: values.banner_url,
      });

      if (!result.success) throw new Error(result.error);
      
      await refreshUser();
      toast.success("Settings updated successfully!");
    } catch (err: any) {
      toast.error("Failed to update: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  const handleAvatarChange = (url: string) => {
    form.setValue("avatar_url", url, { shouldDirty: true });
    // Auto-save
    const currentValues = form.getValues();
    onSubmit({ ...currentValues, avatar_url: url });
  };

  const handleBannerChange = (url: string) => {
    form.setValue("banner_url", url, { shouldDirty: true });
    // Auto-save
    const currentValues = form.getValues();
    onSubmit({ ...currentValues, banner_url: url });
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-fade-in">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-lora), serif' }}>
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences and application appearance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Account & Profile */}
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <User className="h-4 w-4 text-emerald-500" />
              </div>
              <h2 className="text-xl font-medium">Profile Customization</h2>
            </div>
            
            <div className="p-8 border border-border/50 rounded-2xl bg-card space-y-10">
              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Profile Picture</label>
                <div className="flex items-center gap-8">
                  <AvatarPicker 
                    currentAvatar={form.watch("avatar_url")} 
                    onAvatarChange={handleAvatarChange}
                    userName={user?.full_name}
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Avatar</p>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                      Upload a photo or generate a random one. Images are stored securely on GitHub.
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/10" />

              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Profile Banner</label>
                <BannerPicker 
                  currentBanner={form.watch("banner_url")} 
                  onBannerChange={handleBannerChange}
                />
                <p className="text-[10px] text-muted-foreground">
                  This banner will be displayed at the top of your dashboard header.
                </p>
              </div>

              <Separator className="bg-border/10" />

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          {...form.register("full_name")}
                          placeholder="Enter your name"
                          disabled={saving}
                          className="bg-transparent border-border/50 h-11 focus:border-emerald-500/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" disabled={saving || !form.formState.isDirty} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 h-11">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Palette className="h-4 w-4 text-blue-500" />
              </div>
              <h2 className="text-xl font-medium">Appearance</h2>
            </div>
            
            <div className="p-8 border border-border/50 rounded-2xl bg-card space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Dark Mode</label>
                  <p className="text-xs text-muted-foreground">Switch between light and dark visual themes.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Off</span>
                  {mounted ? (
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                    />
                  ) : (
                    <div className="w-11 h-6 bg-muted animate-pulse rounded-full" />
                  )}
                  <span className="text-xs text-emerald-500 uppercase tracking-widest font-bold">On</span>
                </div>
              </div>

              <Separator className="bg-border/10" />

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Application Accent</label>
                  <p className="text-xs text-muted-foreground">The UI uses a curated Emerald palette for a financial feel.</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                    <Check className="w-3 h-3" /> Emerald Finance (Default)
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Security & Info */}
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-rose-500" />
              </div>
              <h2 className="text-lg font-medium">Security</h2>
            </div>
            <div className="p-6 border border-border/50 rounded-2xl bg-card space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed truncate">
                Email: {mounted ? (user?.email || "...") : "..."}
              </p>
              <Button variant="outline" className="w-full text-xs border-border/50 hover:bg-muted/50 h-10 rounded-xl">
                Reset Password
              </Button>
            </div>
          </section>

          <div className="p-6 border border-emerald-500/10 bg-emerald-500/5 rounded-2xl">
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-2">Storage Status</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Connected to GitHub Assets: <span className="text-foreground font-mono">NandaAddi/task-manager-assets</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
