"use client";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CldImage } from "next-cloudinary";
import { slugify } from "@/utils/slugify";
import AuthorSelect from "@/components/admin/AuthorSelect";

const RichTextEditor = dynamic(
  () => import("@/components/admin/RichTextEditor"),
  { ssr: false }
);

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getCloudinaryPublicId(url?: string) {
  if (!url) return "";
  const match = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
  return match && match[1] ? match[1] : "";
}
function cryptoRandomId() {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID)
    return (crypto as any).randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type UserItem = { _id: string; name: string; email?: string };

type MenuItem = {
  _id: string;
  name: string;
  submenus: Array<{ _id: string; name: string }>;
};

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams(); // { id }
  const id = (params as any)?.id;

  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState<MenuItem[]>([]);

  // form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  // replaced string author with type-safe selected user
  const [authorSelected, setAuthorSelected] = useState<UserItem | null>(null);

  const [shareUrl, setShareUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState("published");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState<any>("");
  const [images, setImages] = useState<string[]>([]);
  const [menuPairs, setMenuPairs] = useState<
    Array<{ id: string; menu: string; submenu: string }>
  >([]);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const postImagesInputRef = useRef<HTMLInputElement | null>(null);

  // cloudinary same config
  const CLOUD_NAME = "ddzhzrlcb";
  const UPLOAD_PRESET = "unsigned_preset";

  useEffect(() => {
    if (!id) return;
    loadPost();
    loadMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadMenus() {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setMenus([]);
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/api/menu/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("failed menus");
      const data = await res.json();
      setMenus(
        Array.isArray(data)
          ? (data as any[]).map((m: any) => ({
              _id: m._id || m.menu?._id,
              name: m.name || m.menu?.name,
              submenus: m.submenus || [],
            }))
          : []
      );
    } catch (err) {
      console.error("menus load", err);
      setMenus([]);
    }
  }

  async function loadPost() {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/blogs/${id}`);
      if (!res.ok) throw new Error(`failed get post (${res.status})`);
      const p = await res.json();

      // prefill form
      setTitle(p.title || "");
      setSlug(p.slug || "");
      setDescription(p.description || "");
      setThumbnail(p.thumbnail || "");
      setShareUrl(p.shareUrl || "");
      setFeatured(!!p.featured);
      setStatus(p.status || "published");
      setTags(p.tags || []);
      setContent(p.content || "");
      setImages(p.images || []);

      // restore menuPairs: if backend has menus[]
      if (Array.isArray(p.menus) && p.menus.length > 0) {
        setMenuPairs(
          p.menus.map((m: any) => ({
            id: cryptoRandomId(),
            menu: m.menu || "",
            submenu: m.submenu || "",
          }))
        );
      } else {
        // fallback to legacy fields
        setMenuPairs([
          {
            id: cryptoRandomId(),
            menu: p.menu || "",
            submenu: p.submenu || "",
          },
        ]);
      }

      // Resolve author: backend may return authors: [id] or legacy author string
      // Prefer authors array (IDs) -> fetch user detail
      if (Array.isArray(p.authors) && p.authors.length > 0) {
        const aid = p.authors[0];
        try {
          const token =
            typeof window !== "undefined"
              ? localStorage.getItem("token")
              : null;
          const ures = await fetch(`${apiUrl}/api/users/${aid}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (ures.ok) {
            const u = await ures.json();
            setAuthorSelected({
              _id: u._id || u.id,
              name: u.name,
              email: u.email,
            });
          } else {
            // fallback to author string (if present)
            if (p.author) {
              setAuthorSelected({ _id: aid, name: p.author, email: "" });
            } else {
              setAuthorSelected(null);
            }
          }
        } catch (err) {
          // network/resolve error: fallback to legacy author or null
          if (p.author)
            setAuthorSelected({ _id: p.author, name: p.author, email: "" });
          else setAuthorSelected(null);
        }
      } else if (p.author) {
        // legacy single author string available
        setAuthorSelected({ _id: p.author, name: p.author, email: "" });
      } else {
        setAuthorSelected(null);
      }
    } catch (err) {
      console.error("loadPost error:", err);
      alert("Failed to load post");
    } finally {
      setLoading(false);
    }
  }

  // upload helpers
  async function uploadToCloudinary(file: File): Promise<string> {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(url, { method: "POST", body: fd });
    if (!res.ok) {
      let err = "";
      try {
        const j = await res.json();
        err = j.error?.message || JSON.stringify(j);
      } catch {}
      throw new Error(`Cloudinary upload failed: ${res.status} ${err}`);
    }
    const json = await res.json();
    if (!json.secure_url)
      throw new Error("Cloudinary response missing secure_url");
    return json.secure_url;
  }

  const handleThumbnailFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const url = await uploadToCloudinary(file);
      setThumbnail(url);
    } catch (err) {
      console.error(err);
      alert("Thumbnail upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    try {
      setLoading(true);
      for (const f of files) {
        const url = await uploadToCloudinary(f);
        setImages((p) => [...p, url]);
      }
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  // tags/menu helpers same pattern as create
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      tagInput.trim() &&
      !tags.includes(tagInput.trim())
    ) {
      e.preventDefault();
      setTags((p) => [...p, tagInput.trim()]);
      setTagInput("");
    }
  };
  const handleRemoveTag = (t: string) =>
    setTags((p) => p.filter((x) => x !== t));

  function addMenuPair() {
    setMenuPairs((p) => [
      ...p,
      { id: cryptoRandomId(), menu: "", submenu: "" },
    ]);
  }
  function removeMenuPair(id: string) {
    setMenuPairs((p) => p.filter((x) => x.id !== id));
  }
  function updateMenuPair(
    id: string,
    partial: Partial<{ menu: string; submenu: string }>
  ) {
    setMenuPairs((p) => p.map((m) => (m.id === id ? { ...m, ...partial } : m)));
  }

  // update (PUT)
  async function handleUpdate() {
    if (!id) return;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const first = menuPairs[0] || { menu: "", submenu: "" };
    const payload: any = {
      title,
      slug,
      description,
      thumbnail,
      menu: first.menu || "",
      submenu: first.submenu || "",
      // send author IDs (if available)
      authors: authorSelected ? [authorSelected._id] : [],
      shareUrl,
      featured,
      status,
      tags,
      content,
      images,
      menus: menuPairs.map((m) => ({ menu: m.menu, submenu: m.submenu })),
    };

    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/blogs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Update failed (${res.status})`);
      }
      alert("Updated successfully");
      router.push("/admin/posts");
    } catch (err) {
      console.error("update error:", err);
      alert("Failed to update - see console");
    } finally {
      setLoading(false);
    }
  }

  // delete
  async function handleDelete() {
    if (!id) return;
    if (!confirm("Delete this post?")) return;
    try {
      setLoading(true);
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${apiUrl}/api/blogs/${id}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Delete failed (${res.status})`);
      }
      router.push("/admin/posts");
    } catch (err) {
      console.error("delete error:", err);
      alert("Failed to delete - see console");
    } finally {
      setLoading(false);
    }
  }

  const thumbnailId = getCloudinaryPublicId(thumbnail);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Post</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/posts")}>
            Back
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Working…" : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Title/slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Blog Title</Label>
            <Input
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label>Slug (auto)</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <textarea
            className="w-full mt-2 p-2 border rounded resize-vertical min-h-[80px]"
            placeholder="Short summary"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Thumbnail / images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Label>Thumbnail</Label>
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                title="Upload thumbnail"
                className="ml-2"
              >
                <ImagePlus />
              </button>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleThumbnailFile}
              />
            </div>

            <Input
              placeholder="Thumbnail URL"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
            />
            {thumbnailId ? (
              <CldImage
                src={thumbnailId}
                width="600"
                height="350"
                crop="auto"
                alt="Thumbnail"
                className="w-full h-40 object-cover rounded-md mt-2 border"
              />
            ) : null}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Label>Post Images</Label>
              <button
                type="button"
                onClick={() => postImagesInputRef.current?.click()}
                title="Upload images"
                className="ml-2"
              >
                <ImagePlus />
              </button>
              <input
                ref={postImagesInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {images.map((img, idx) => {
                const id = getCloudinaryPublicId(img);
                if (!id) return null;
                return (
                  <div key={idx} className="relative">
                    <CldImage
                      src={id}
                      width="120"
                      height="80"
                      crop="thumb"
                      alt={`img-${idx}`}
                      className="w-28 h-20 object-cover rounded-md border"
                    />
                    <button
                      onClick={() =>
                        setImages((p) => p.filter((_, i) => i !== idx))
                      }
                      className="absolute -top-1 -right-1 bg-white rounded-full px-1 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Author + share url */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Author</Label>
            <div className="mt-2">
              <AuthorSelect
                value={authorSelected}
                onChange={(u: UserItem | null) => setAuthorSelected(u)}
                apiUrl={apiUrl}
              />
            </div>
          </div>
          <div>
            <Label>Share URL</Label>
            <Input
              placeholder="share-url"
              value={shareUrl}
              onChange={(e) => setShareUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Featured + status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="flex items-center gap-3">
            <Label>Featured</Label>
            <Switch checked={featured} onCheckedChange={setFeatured} />
          </div>
          <div>
            <Label>Status</Label>
            <select
              className="w-full mt-2 p-2 border rounded"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Menus */}
        <div>
          <Label>Menus & Submenus</Label>
          <div className="space-y-3 mt-2">
            {menuPairs.map((pair) => (
              <div key={pair.id} className="flex gap-3 items-center">
                <div className="flex-1">
                  <Select
                    value={pair.menu}
                    onValueChange={(val) =>
                      updateMenuPair(pair.id, { menu: val, submenu: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select menu" />
                    </SelectTrigger>
                    <SelectContent>
                      {menus.map((m) => (
                        <SelectItem key={m._id} value={m.name}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Select
                    value={pair.submenu}
                    onValueChange={(val) =>
                      updateMenuPair(pair.id, { submenu: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select submenu" />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        menus.find((mm) => mm.name === pair.menu)?.submenus ||
                        []
                      ).map((sm: { _id: string; name: string }) => (
                        <SelectItem key={sm._id} value={sm.name}>
                          {sm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeMenuPair(pair.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            <div>
              <Button size="sm" onClick={() => addMenuPair()} className="mt-2">
                Add Menu
              </Button>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <div className="flex flex-wrap items-center gap-2 border mt-2 rounded-md p-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-xs hover:text-red-500 ml-1"
                >
                  ✕
                </button>
              </Badge>
            ))}
            <input
              className="flex-1 min-w-[100px] outline-none text-sm bg-transparent"
              placeholder="Add tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <Label>Content</Label>
          <div className="mt-2 border rounded-md min-h-[200px]">
            {/* @ts-ignore */}
            <RichTextEditor content={content} onChange={setContent} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => router.push("/admin/posts")}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Working…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
