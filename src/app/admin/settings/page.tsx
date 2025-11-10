"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
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
import { apiFetch } from "@/lib/api";
import LogOut from "@/components/admin/LogOut";

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<SiteSettings>({
    siteName: "",
    siteDescription: "",
    logo: "",
    favicon: "",
    social: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
    }, // always defined
    theme: "light",
    postsPerPage: 10,
    updatedAt: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const data = await apiFetch<SiteSettings>("/api/settings");
      if (data) {
        setSettings(data);
        setFormData({
          siteName: data.siteName || "",
          siteDescription: data.siteDescription || "",
          logo: data.logo || "",
          favicon: data.favicon || "",
          social: {
            facebook: data.social?.facebook || "",
            twitter: data.social?.twitter || "",
            instagram: data.social?.instagram || "",
            linkedin: data.social?.linkedin || "",
          },
          theme: data.theme || "light",
          postsPerPage: data.postsPerPage || 10,
          updatedAt: data.updatedAt || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const updateData = {
      ...formData,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (settings?._id) {
        await apiFetch(`/api/settings/${settings._id}`, {
          method: "PUT",
          body: JSON.stringify(updateData),
        });
        toast({
          title: "Settings saved",
          description: "Settings updated successfully.",
        });
      } else {
        await apiFetch("/api/settings", {
          method: "POST",
          body: JSON.stringify(updateData),
        });
        toast({
          title: "Settings created",
          description: "Settings created successfully.",
        });
      }
      fetchSettings();
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
    setIsLoading(false);
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="rounded-2xl shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={formData.siteName}
                onChange={(e) =>
                  setFormData({ ...formData, siteName: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={formData.siteDescription}
                onChange={(e) =>
                  setFormData({ ...formData, siteDescription: e.target.value })
                }
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  type="url"
                  value={formData.logo}
                  onChange={(e) =>
                    setFormData({ ...formData, logo: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="favicon">Favicon URL</Label>
                <Input
                  id="favicon"
                  type="url"
                  value={formData.favicon}
                  onChange={(e) =>
                    setFormData({ ...formData, favicon: e.target.value })
                  }
                />
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
              <Input
                id="facebook"
                value={formData.social?.facebook}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social: { ...formData.social, facebook: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={formData.social?.twitter}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social: { ...formData.social, twitter: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.social?.instagram}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social: { ...formData.social, instagram: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={formData.social?.linkedin}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social: { ...formData.social, linkedin: e.target.value },
                  })
                }
              />
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
              <Select
                value={formData.theme}
                onValueChange={(value: string) =>
                  setFormData({
                    ...formData,
                    theme: value as "light" | "dark" | "system",
                  })
                }
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
            </div>
            <div>
              <Label htmlFor="postsPerPage">Posts Per Page</Label>
              <Input
                id="postsPerPage"
                type="number"
                min={1}
                max={50}
                value={formData.postsPerPage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    postsPerPage: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="gap-2" disabled={isLoading}>
            <Save className="w-4 h-4" />
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>

      {/* Logout Section at Bottom */}
      <div className="mt-10 border-t pt-6">
        <p className="text-sm text-gray-500 mb-2">
          Want to sign out of your admin account?
        </p>
        <LogOut />
      </div>
    </div>
  );
}
