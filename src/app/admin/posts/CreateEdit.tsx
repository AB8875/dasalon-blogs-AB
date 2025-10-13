"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AdminButton } from "@/components/admin/AdminButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export type PostFormValues = {
  title: string;
  slug: string;
  categoryId: string;
  tags: string[];
  thumbnailUrl?: string;
  content: string;
  status: "draft" | "published";
};

const demoCategories = [
  { id: "c1", name: "News" },
  { id: "c2", name: "Guides" },
  { id: "c3", name: "Releases" },
];

export function CreateEditPostForm({
  initial,
  onSubmit,
}: {
  initial?: Partial<PostFormValues>;
  onSubmit: (values: PostFormValues) => void;
}) {
  const [values, setValues] = React.useState<PostFormValues>({
    title: "",
    slug: "",
    categoryId: demoCategories[0].id,
    tags: [],
    thumbnailUrl: "",
    content: "",
    status: "draft",
    ...initial,
  });

  function set<K extends keyof PostFormValues>(key: K, v: PostFormValues[K]) {
    setValues((s) => ({ ...s, [key]: v }));
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
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
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={values.slug}
            onChange={(e) => set("slug", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={values.categoryId}
            onValueChange={(v) => set("categoryId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {demoCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="thumb">Thumbnail URL</Label>
          <Input
            id="thumb"
            value={values.thumbnailUrl ?? ""}
            onChange={(e) => set("thumbnailUrl", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2">
          {["nextjs", "mongodb", "release", "guide", "admin"].map((t) => {
            const active = values.tags.includes(t);
            return (
              <Badge
                key={t}
                variant={active ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() =>
                  set(
                    "tags",
                    active
                      ? values.tags.filter((x) => x !== t)
                      : Array.from(new Set([...values.tags, t]))
                  )
                }
                aria-label={`Toggle tag ${t}`}
                role="button"
                tabIndex={0}
              >
                {t}
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={values.content}
          onChange={(e) => set("content", e.target.value)}
          rows={8}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id="status"
            checked={values.status === "published"}
            onCheckedChange={(v) => set("status", v ? "published" : "draft")}
          />
          <Label htmlFor="status">Published</Label>
        </div>
        <AdminButton aria-label="Save post" type="submit">
          Save Post
        </AdminButton>
      </div>
    </form>
  );
}
