"use client";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Plus, ImagePlus, Upload, X } from "lucide-react";
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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [postImages, setPostImages] = useState<string[]>([]);
  const [postImageFiles, setPostImageFiles] = useState<File[]>([]);
  const [shareUrl, setShareUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState("published");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState<any>("");
  const [menuPairs, setMenuPairs] = useState<
    Array<{ id: string; menu: string; submenu: string }>
  >([{ id: cryptoRandomId(), menu: "", submenu: "" }]);
  const [loading, setLoading] = useState(false);
  const [isShareUrlManuallyEdited, setIsShareUrlManuallyEdited] =
    useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [isPostImagesDragging, setIsPostImagesDragging] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const postImagesInputRef = useRef<HTMLInputElement | null>(null);

  // S3 uploads now handled via API route instead

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

  // upload helper (S3)
  async function uploadToS3(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/upload?folder=posts`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );

    if (!res.ok) {
      const err = await res.text().catch(() => "Unknown error");
      throw new Error(`Upload failed: ${res.status} ${err}`);
    }

    const json = await res.json();
    if (!json.url) {
      throw new Error("Upload response missing url");
    }
    return json.url;
  }

  const handleThumbnailFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processThumbnailFile(file);
  };

  const processThumbnailFile = async (file: File) => {
    // Create local preview
    const url = URL.createObjectURL(file);
    setThumbnail(url);
    setThumbnailFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await processThumbnailFile(file);
    }
  };

  // Post images handlers
  const handlePostImagesFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processPostImageFiles(Array.from(files));
  };

  const processPostImageFiles = async (files: File[]) => {
    const newPreviews: string[] = [];
    const newFiles: File[] = [];

    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      newPreviews.push(url);
      newFiles.push(file);
    });

    setPostImages((prev) => [...prev, ...newPreviews]);
    setPostImageFiles((prev) => [...prev, ...newFiles]);
  };

  const handlePostImagesDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsPostImagesDragging(true);
  };

  const handlePostImagesDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsPostImagesDragging(false);
  };

  const handlePostImagesDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsPostImagesDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length > 0) {
      await processPostImageFiles(files);
    }
  };

  const removePostImage = (index: number) => {
    setPostImages((prev) => prev.filter((_, i) => i !== index));
    setPostImageFiles((prev) => prev.filter((_, i) => i !== index));
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
    setLoading(true);
    try {
      // 1. Upload thumbnail if pending
      let finalThumbnail = thumbnail;
      if (thumbnailFile) {
        finalThumbnail = await uploadToS3(thumbnailFile);
      }

      // 2. Upload post images if pending
      let finalPostImages: string[] = [];
      if (postImageFiles.length > 0) {
        const uploadPromises = postImageFiles.map((file) => uploadToS3(file));
        finalPostImages = await Promise.all(uploadPromises);
      }

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
        thumbnail: finalThumbnail,
        images: finalPostImages, // Add post images to payload
        menu: first.menu || "",
        submenu: first.submenu || "",
        authors: authorId ? [authorId] : [], // send IDs
        shareUrl,
        featured,
        status,
        tags,
        content,
        menus: menuPairs.map((m) => ({ menu: m.menu, submenu: m.submenu })),
      };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="block">Blog Title</Label>
            <Input
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="block">Slug (auto)</Label>
            <Input readOnly value={slug} />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="block">Description</Label>
          <textarea
            className="w-full p-3 border rounded-md resize-vertical min-h-[100px] focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Write a short summary for SEO and previews..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Thumbnail & Post Images side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Thumbnail Section */}
          <div className="space-y-2">
            <Label className="block">Thumbnail</Label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[180px] ${
                isDragging
                  ? "border-primary bg-primary/10 scale-[1.02]"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/5"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => thumbnailInputRef.current?.click()}
            >
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailFile}
              />

              {thumbnail ? (
                <div className="relative w-full h-full min-h-[140px] flex items-center justify-center group">
                  <img
                    src={thumbnail}
                    alt="Thumbnail preview"
                    className="max-h-[160px] w-full object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setThumbnail("");
                        setThumbnailFile(null);
                      }}
                      className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-destructive/90 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="p-3 bg-accent/50 rounded-full">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs mt-1">
                      SVG, PNG, JPG or GIF (max. 4K)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* URL input fallback */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Or enter image URL
              </Label>
              <Input
                placeholder="https://..."
                value={thumbnail}
                onChange={(e) => {
                  setThumbnail(e.target.value);
                  setThumbnailFile(null);
                }}
                className="text-sm"
              />
            </div>
          </div>

          {/* Post Images Section */}
          <div className="space-y-2">
            <Label className="block">Post Images</Label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[180px] ${
                isPostImagesDragging
                  ? "border-primary bg-primary/10 scale-[1.02]"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/5"
              }`}
              onDragOver={handlePostImagesDragOver}
              onDragLeave={handlePostImagesDragLeave}
              onDrop={handlePostImagesDrop}
              onClick={() => postImagesInputRef.current?.click()}
            >
              <input
                ref={postImagesInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePostImagesFile}
              />

              {postImages.length > 0 ? (
                <div className="w-full grid grid-cols-3 gap-2">
                  {postImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square group"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img
                        src={img}
                        alt={`Post image ${idx + 1}`}
                        className="w-full h-full object-cover rounded-md"
                      />
                      <button
                        onClick={() => removePostImage(idx)}
                        className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {/* Add more button */}
                  <div className="aspect-square border-2 border-dashed rounded-md flex items-center justify-center hover:bg-accent/50 transition-colors">
                    <ImagePlus className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="p-3 bg-accent/50 rounded-full">
                    <ImagePlus className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Click to upload multiple images
                    </p>
                    <p className="text-xs mt-1">or drag and drop them here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Author + share url */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="block">Author</Label>
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

          <div className="space-y-2">
            <Label className="block">Share URL</Label>
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

        {/* Menus & Submenus (add multiple) */}
        <div className="space-y-2">
          <Label className="block">Menus & Submenus (add multiple)</Label>
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

        {/* Tags */}
        <div className="space-y-2">
          <Label className="block">Tags</Label>
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
        <div className="space-y-2">
          <Label className="block">Content</Label>
          <div className="border rounded-md min-h-[200px]">
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
