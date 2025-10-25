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
    site_name: "",
    site_description: "",
    logo_url: "",
    favicon_url: "",
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    linkedin_url: "",
    theme: "light",
    posts_per_page: 10,
    updated_at: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const data = await apiFetch<SiteSettings>("/settings");
      if (data) {
        setSettings(data);
        setFormData(data);
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
      updated_at: new Date().toISOString(),
    };

    try {
      if (settings) {
        await apiFetch(`/settings/${settings._id}`, {
          method: "PUT",
          body: JSON.stringify(updateData),
        });
        toast({
          title: "Settings saved",
          description: "Settings updated successfully.",
        });
      } else {
        await apiFetch("/settings", {
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
              <Label htmlFor="site_name">Site Name</Label>
              <Input
                id="site_name"
                value={formData.site_name}
                onChange={(e) =>
                  setFormData({ ...formData, site_name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="site_description">Site Description</Label>
              <Textarea
                id="site_description"
                value={formData.site_description}
                onChange={(e) =>
                  setFormData({ ...formData, site_description: e.target.value })
                }
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) =>
                    setFormData({ ...formData, logo_url: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="favicon_url">Favicon URL</Label>
                <Input
                  id="favicon_url"
                  type="url"
                  value={formData.favicon_url}
                  onChange={(e) =>
                    setFormData({ ...formData, favicon_url: e.target.value })
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
              <Label htmlFor="facebook_url">Facebook</Label>
              <Input
                id="facebook_url"
                value={formData.facebook_url}
                onChange={(e) =>
                  setFormData({ ...formData, facebook_url: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="twitter_url">Twitter</Label>
              <Input
                id="twitter_url"
                value={formData.twitter_url}
                onChange={(e) =>
                  setFormData({ ...formData, twitter_url: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="instagram_url">Instagram</Label>
              <Input
                id="instagram_url"
                value={formData.instagram_url}
                onChange={(e) =>
                  setFormData({ ...formData, instagram_url: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="linkedin_url">LinkedIn</Label>
              <Input
                id="linkedin_url"
                value={formData.linkedin_url}
                onChange={(e) =>
                  setFormData({ ...formData, linkedin_url: e.target.value })
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
                onValueChange={(value: any) =>
                  setFormData({ ...formData, theme: value })
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
              <Label htmlFor="posts_per_page">Posts Per Page</Label>
              <Input
                id="posts_per_page"
                type="number"
                min={1}
                max={50}
                value={formData.posts_per_page}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    posts_per_page: parseInt(e.target.value),
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
