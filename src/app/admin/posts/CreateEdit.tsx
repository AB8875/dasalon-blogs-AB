// path: src/app/admin/posts/CreateEdit.tsx
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AdminButton } from "@/components/admin/AdminButton"; // adjust if default export differs

type PostFormValues = {
  title: string;
  slug: string;
  content: string;
  thumbnailUrl?: string;
  categories: string[];
  tags: string[];
  status: "draft" | "published";
};

export default function CreateEdit({
  onSubmit,
  initial,
}: {
  onSubmit: (v: PostFormValues) => Promise<void> | void;
  initial?: Partial<PostFormValues>;
}) {
  const [values, setValues] = React.useState<PostFormValues>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    content: initial?.content ?? "",
    thumbnailUrl: initial?.thumbnailUrl ?? "",
    categories: initial?.categories ?? [],
    tags: initial?.tags ?? [],
    status: (initial?.status as "draft" | "published") ?? "draft",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [autoSlug, setAutoSlug] = React.useState(true);

  React.useEffect(() => {
    if (autoSlug) {
      const s = values.title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setValues((v) => ({ ...v, slug: s }));
    }
  }, [values.title, autoSlug]);

  function set<K extends keyof PostFormValues>(key: K, v: PostFormValues[K]) {
    setValues((s) => ({ ...s, [key]: v }));
  }

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!values.title.trim()) {
          alert("Title is required");
          return;
        }
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (err) {
          console.error(err);
          alert("Failed to save");
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="slug">Slug</Label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoSlug}
                onChange={(e) => setAutoSlug(e.target.checked)}
              />
              Auto
            </label>
          </div>
          <Input
            id="slug"
            value={values.slug}
            onChange={(e) => {
              setAutoSlug(false);
              set("slug", e.target.value);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="thumb">Thumbnail URL</Label>
          <Input
            id="thumb"
            value={values.thumbnailUrl ?? ""}
            onChange={(e) => set("thumbnailUrl", e.target.value)}
          />
          {values.thumbnailUrl ? (
            <img
              src={values.thumbnailUrl}
              alt="thumb"
              className="mt-2 h-24 w-40 object-cover rounded"
            />
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Categories (comma separated)</Label>
          <Input
            value={values.categories.join(", ")}
            onChange={(e) =>
              set(
                "categories",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <Textarea
          value={values.content}
          onChange={(e) => set("content", e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={values.status === "published"}
              onCheckedChange={(v) => set("status", v ? "published" : "draft")}
            />
            <span>{values.status === "published" ? "Published" : "Draft"}</span>
          </label>
        </div>

        <div>
          <button
            type="submit"
            className="rounded bg-primary px-4 py-2 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}
