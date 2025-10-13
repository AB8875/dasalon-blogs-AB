"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AdminButton } from "@/components/admin/AdminButton";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettingsPage() {
  const [siteTitle, setSiteTitle] = React.useState("Dasalon Blogs");
  const [logoUrl, setLogoUrl] = React.useState("/placeholder-logo.svg");
  const [twitter, setTwitter] = React.useState(
    "https://twitter.com/yourhandle"
  );
  const [github, setGithub] = React.useState("https://github.com/yourorg");
  const [dark, setDark] = React.useState(false);
  const [about, setAbout] = React.useState(
    "A short description for your blog."
  );

  return (
    <form
      className="mx-auto max-w-2xl space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        // no-op; demo only
      }}
    >
      <h1 className="text-2xl font-semibold text-pretty">Settings</h1>

      <div className="space-y-2">
        <Label htmlFor="title">Site Title</Label>
        <Input
          id="title"
          value={siteTitle}
          onChange={(e) => setSiteTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Logo URL</Label>
        <Input
          id="logo"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter</Label>
          <Input
            id="twitter"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="about">About</Label>
        <Textarea
          id="about"
          rows={5}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch id="theme" checked={dark} onCheckedChange={setDark} />
        <Label htmlFor="theme">Enable Dark Theme</Label>
      </div>

      <div className="flex justify-end">
        <AdminButton aria-label="Save settings" type="submit">
          Save Settings
        </AdminButton>
      </div>
    </form>
  );
}
