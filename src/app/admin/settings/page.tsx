"use client";

import { useEffect } from "react";
import { Save } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SiteSettings } from "@/types/settings";
import { useSettings } from "@/hooks/useSettings";
import ImageUpload from "@/components/admin/ImageUpload";
import { MetaPreview } from "@/components/admin/MetaPreview";
import LogOut from "@/components/admin/LogOut";

type FormValues = {
  siteName: string;
  siteDescription: string;
  logo?: string;
  favicon?: string;
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  theme: "light" | "dark" | "system";
  postsPerPage: number;
  updatedAt?: string;
};

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: settings, isLoading, save, isSaving } = useSettings();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { isDirty, errors },
  } = useForm<FormValues>({
    defaultValues: {
      siteName: "",
      siteDescription: "",
      logo: "",
      favicon: "",
      social: {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
      },
      theme: "light",
      postsPerPage: 10,
      updatedAt: "",
    },
    mode: "onBlur",
  });

  // when settings load, populate the form
  useEffect(() => {
    if (settings) {
      reset({
        siteName: settings.siteName || "",
        siteDescription: settings.siteDescription || "",
        logo: settings.logo || "",
        favicon: settings.favicon || "",
        social: {
          facebook: settings.social?.facebook || "",
          twitter: settings.social?.twitter || "",
          instagram: settings.social?.instagram || "",
          linkedin: settings.social?.linkedin || "",
        },
        theme: (settings.theme as FormValues["theme"]) || "light",
        postsPerPage: settings.postsPerPage ?? 10,
        updatedAt: settings.updatedAt || "",
      });
    }
  }, [settings, reset]);

  const watchAll = watch();

  async function onSubmit(values: FormValues) {
    try {
      const payload: Partial<SiteSettings> = {
        ...values,
        updatedAt: new Date().toISOString(),
      };

      await save(payload);
      toast({
        title: "Settings saved",
        description: "Settings updated successfully.",
      });
      // reset dirty flag by resetting with latest values
      reset(values);
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
          Settings
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your site preferences and configuration
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="rounded-2xl shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                {...register("siteName", { required: "Site name is required" })}
              />
              {errors.siteName && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.siteName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                {...register("siteDescription", {
                  required: "Site description is required",
                  minLength: { value: 5, message: "Description is too short" },
                })}
                rows={3}
              />
              {errors.siteDescription && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.siteDescription.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="logo">Logo URL</Label>
                {/* ImageUpload will call setValue when upload completes */}
                <ImageUpload
                  label="Logo"
                  value={watchAll.logo}
                  onChange={(url) =>
                    setValue("logo", url, { shouldDirty: true })
                  }
                />
                <Input
                  id="logo"
                  type="url"
                  {...register("logo", {
                    pattern: {
                      value:
                        /^(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))?$/,
                      message: "Please enter a valid URL",
                    },
                  })}
                />
                {errors.logo && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.logo.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="favicon">Favicon URL</Label>
                <ImageUpload
                  label="Favicon"
                  value={watchAll.favicon}
                  onChange={(url) =>
                    setValue("favicon", url, { shouldDirty: true })
                  }
                />
                <Input
                  id="favicon"
                  type="url"
                  {...register("favicon", {
                    pattern: {
                      value:
                        /^(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))?$/,
                      message: "Please enter a valid URL",
                    },
                  })}
                />
                {errors.favicon && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.favicon.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input id="facebook" {...register("social.facebook")} />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input id="twitter" {...register("social.twitter")} />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" {...register("social.instagram")} />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input id="linkedin" {...register("social.linkedin")} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle>Display Preferences</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Controller
                control={control}
                name="theme"
                defaultValue="light"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value: string) => field.onChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="postsPerPage">Posts Per Page</Label>
              <Input
                id="postsPerPage"
                type="number"
                min={1}
                max={50}
                {...register("postsPerPage", {
                  valueAsNumber: true,
                  min: { value: 1, message: "Minimum is 1" },
                  max: { value: 50, message: "Maximum is 50" },
                })}
              />
              {errors.postsPerPage && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.postsPerPage.message as unknown as string}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <MetaPreview
              title={watchAll.siteName}
              description={watchAll.siteDescription}
              logo={watchAll.logo}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="gap-2"
            disabled={isSaving || !isDirty}
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : isDirty ? "Save Settings" : "No changes"}
          </Button>
        </div>
      </form>

      {/* Logout Section at Bottom */}
      <div className="mt-10 border-t pt-6 relative z-10">
        <p className="text-sm text-gray-500 mb-2">
          Want to sign out of your admin account?
        </p>
        <LogOut />
      </div>
    </div>
  );
}
