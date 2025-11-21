"use client";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Plus, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AuthorSelect from "@/components/admin/AuthorSelect";
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

const RichTextEditor = dynamic(
  () => import("@/components/admin/RichTextEditor"),
  { ssr: false }
);

interface MenuType {
  _id: string;
  name: string;
  submenus: Array<{ _id: string; name: string }>;
}
type UserItem = { _id: string; name: string; email?: string };

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

// debounce helper
function debounce<T extends (...args: any[]) => void>(fn: T, ms = 300) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export default function CreatePostPage() {
  const router = useRouter();
  const [menus, setMenus] = useState<MenuType[]>([]);
  const [authorsList, setAuthorsList] = useState<UserItem[]>([]);
  const [authorQuery, setAuthorQuery] = useState("");
  // <-- changed to UserItem | null (matches AuthorSelect)
  const [authorSelected, setAuthorSelected] = useState<UserItem | null>(null);
  const [authorSearching, setAuthorSearching] = useState(false);

  // fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState("published");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState<any>("");
  const [images, setImages] = useState<string[]>([]);
  const [menuPairs, setMenuPairs] = useState<
    Array<{ id: string; menu: string; submenu: string }>
  >([{ id: cryptoRandomId(), menu: "", submenu: "" }]);
  const [loading, setLoading] = useState(false);
  const [isShareUrlManuallyEdited, setIsShareUrlManuallyEdited] =
    useState(false);

  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const postImagesInputRef = useRef<HTMLInputElement | null>(null);

  // Cloudinary settings (default)
  const CLOUD_NAME = "ddzhzrlcb";
  const UPLOAD_PRESET = "unsigned_preset";

  useEffect(() => {
    setSlug(slugify(title));
    if (!isShareUrlManuallyEdited) setShareUrl(slugify(title));
  }, [title, isShareUrlManuallyEdited]);

  // load menus (admin)
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setMenus([]);
      return;
    }
    fetch(`${apiUrl}/api/menu/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setMenus([]);
          return;
        }
        setMenus(
          data.map((m: any) => ({
            _id: m._id || m.menu?._id,
            name: m.name || m.menu?.name,
            submenus: m.submenus || [],
          }))
        );
      })
      .catch(() => setMenus([]));
  }, []);

  // author search: debounced query to backend users list (client-side filter fallback)
  useEffect(() => {
    // immediate local filter if authorsList already loaded
    if (!authorQuery) return;
    debouncedSearch(authorQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorQuery]);

  const debouncedSearch = debounce((q: string) => {
    doAuthorSearch(q);
  }, 250);

  async function doAuthorSearch(q: string) {
    setAuthorSearching(true);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      // your backend `GET /api/users` returns { items: users } - we'll request and filter.
      const res = await fetch(`${apiUrl}/api/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      let items: any[] = [];
      if (Array.isArray(data?.items)) items = data.items;
      else if (Array.isArray(data)) items = data;
      // filter by name/email
      const filtered = items
        .map((u) => ({ _id: u._id || u.id, name: u.name, email: u.email }))
        .filter(
          (u) =>
            (u.name || "").toLowerCase().includes(q.toLowerCase()) ||
            (u.email || "").toLowerCase().includes(q.toLowerCase())
        );
      setAuthorsList(filtered);
    } catch (err) {
      // fallback: no authors
      setAuthorsList([]);
      console.error("authors search failed", err);
    } finally {
      setAuthorSearching(false);
    }
  }

  // Full authors preload for the dropdown on mount (helps show options quickly)
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch(`${apiUrl}/api/users`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];
        setAuthorsList(
          items.map((u: any) => ({
            _id: u._id || u.id,
            name: u.name,
            email: u.email,
          }))
        );
      })
      .catch(() => setAuthorsList([]));
  }, []);

  // create author on the fly (if not found). This will call backend POST /api/users
  async function createAuthorByName(name: string): Promise<UserItem | null> {
    if (!name?.trim()) return null;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    // generate fallback email & password (backend requires them)
    const safeName = name.trim().toLowerCase().replace(/\s+/g, ".");
    const genEmail = `${safeName}.${Date.now() % 10000}@local.internal`;
    const genPassword = Math.random().toString(36).slice(2, 10);
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: name.trim(),
          email: genEmail,
          password: genPassword,
          role: "author",
        }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Create author failed (${res.status})`);
      }
      const created = await res.json();
      // Post controller currently returns the created user doc
      const user = created as any;
      const u: UserItem = {
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
      };
      setAuthorsList((p) => [u, ...p]);
      return u;
    } catch (err) {
      console.error("create author failed", err);
      alert("Failed to create author — check console for details.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  // upload helper (cloudinary)
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

  // tags
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

  // menu pairs helpers
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

  // submit create
  const handlePost = async () => {
    // ensure we have an author id (if a name was typed and not selected, create then use id)
    let authorId: string | null = authorSelected?._id ?? null;
    if (!authorId && authorQuery.trim()) {
      // try to find by exact match in authorsList
      const found = authorsList.find(
        (a) => a.name.toLowerCase() === authorQuery.trim().toLowerCase()
      );
      if (found) authorId = found._id;
      else {
        const created = await createAuthorByName(authorQuery.trim());
        authorId = created ? created._id : null;
      }
    }

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
      authors: authorId ? [authorId] : [], // send IDs
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
      const res = await fetch(`${apiUrl}/api/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Failed to create post (${res.status})`);
      }
      router.push("/admin/posts");
    } catch (err) {
      console.error("create error:", err);
      alert("Failed to create post - check console.");
    } finally {
      setLoading(false);
    }
  };

  const thumbnailId = getCloudinaryPublicId(thumbnail);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create New Post</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/posts")}>
            Back
          </Button>
          <Button onClick={handlePost} disabled={loading}>
            {loading ? "Working…" : "Publish"}
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
            <Input readOnly value={slug} />
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

        {/* Thumbnail / images side-by-side */}
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
              placeholder="Thumbnail URL (or upload)"
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
                onChange={(u) => {
                  // guard against undefined from AuthorSelect's signature
                  setAuthorSelected(u ?? null);
                }}
                apiUrl={apiUrl}
                placeholder="Type author name (select or create)"
              />
            </div>
          </div>

          <div>
            <Label>Share URL</Label>
            <Input
              placeholder="share-url"
              value={shareUrl}
              onChange={(e) => {
                setShareUrl(e.target.value);
                setIsShareUrlManuallyEdited(true);
              }}
            />
          </div>
        </div>

        {/* Menus & tags & content (unchanged) */}
        <div>
          <Label>Menus & Submenus (add multiple)</Label>
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
                      ).map((sm) => (
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
                <Plus /> Add Menu
              </Button>
            </div>
          </div>
        </div>

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

        <div>
          <Label>Content</Label>
          <div className="mt-2 border rounded-md min-h-[200px]">
            {/* @ts-ignore */}
            <RichTextEditor content={content} onChange={setContent} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => router.push("/admin/posts")}>
            Cancel
          </Button>
          <Button onClick={handlePost} disabled={loading}>
            {loading ? "Working…" : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}
