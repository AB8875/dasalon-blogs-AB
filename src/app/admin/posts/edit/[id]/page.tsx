"use client";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import { ImagePlus, Upload, X, Plus } from "lucide-react";
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

type MenuItem = {
  _id: string;
  name: string;
  submenus: Array<{ _id: string; name: string }>;
};

type UserItem = { _id: string; name: string; email?: string };

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams(); // { id }
  const id = (params as any)?.id;

  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [authorsList, setAuthorsList] = useState<UserItem[]>([]);
  const [authorSelected, setAuthorSelected] = useState<UserItem | null>(null);

  // form fields
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
  const [menuPairs, setMenuPairs] = useState<
    Array<{ id: string; menu: string; submenu: string }>
  >([]);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!id) return;
    loadMenus();
    preloadAuthors();
    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function preloadAuthors() {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${apiUrl}/api/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
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
    } catch (err) {
      console.error("preload authors failed", err);
      setAuthorsList([]);
    }
  }

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

      // authors: backend stores authors as array of ids. Try to resolve to name using preloaded authors or fetch user
      const authorId =
        Array.isArray(p.authors) && p.authors.length > 0
          ? p.authors[0]
          : p.author || null;
      if (authorId) {
        // try find in preloaded authorsList first
        const found = authorsList.find((a) => a._id === authorId);
        if (found) {
          setAuthorSelected(found);
        } else {
          // fetch specific user
          try {
            const token =
              typeof window !== "undefined"
                ? localStorage.getItem("token")
                : null;
            const r = await fetch(`${apiUrl}/api/users/${authorId}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (r.ok) {
              const u = await r.json();
              const uid = u._id || u.id;
              const uname = u.name || (u as any).fullName || String(uid);
              const userObj: UserItem = {
                _id: uid,
                name: uname,
                email: u.email,
              };
              setAuthorSelected(userObj);
              setAuthorsList((prev) =>
                prev.find((x) => x._id === uid) ? prev : [userObj, ...prev]
              );
            } else {
              setAuthorSelected({
                _id: String(authorId),
                name: String(authorId),
              });
            }
          } catch (err) {
            console.error("fetch author detail failed", err);
            setAuthorSelected({
              _id: String(authorId),
              name: String(authorId),
            });
          }
        }
      } else {
        setAuthorSelected(null);
      }

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
    } catch (err) {
      console.error("loadPost error:", err);
      alert("Failed to load post");
    } finally {
      setLoading(false);
    }
  }

  // upload helpers
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
    try {
      setLoading(true);
      const url = await uploadToS3(file);
      setThumbnail(url);
    } catch (err) {
      console.error(err);
      alert("Thumbnail upload failed");
    } finally {
      setLoading(false);
    }
  };



  // tags/menu helpers
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

  // create author on the fly (if not found) - used by AuthorSelect component as well
  async function createAuthorByName(name: string): Promise<UserItem | null> {
    if (!name?.trim()) return null;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
      const u: UserItem = {
        _id: created._id || created.id,
        name: created.name,
        email: created.email,
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
      authors: authorSelected ? [authorSelected._id] : [],
      shareUrl,
      featured,
      status,
      tags,
      content,
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title & Slug */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Blog Title</Label>
              <Input
                placeholder="Enter an engaging title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg py-6"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="bg-muted/50 font-mono text-sm" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Description</Label>
            <textarea
              className="w-full min-h-[120px] p-3 rounded-md border bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Write a short summary for SEO and previews..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Content</Label>
            <div className="min-h-[500px] border rounded-md shadow-sm bg-card">
              {/* @ts-ignore */}
              <RichTextEditor content={content} onChange={setContent} />
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Settings */}
        <div className="space-y-8">
          {/* Publish Action */}
          <div className="p-6 border rounded-xl bg-card shadow-sm space-y-4">
            <h3 className="font-semibold text-lg">Publishing</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={status === "published" ? "default" : "secondary"}>
                {status}
              </Badge>
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setStatus("draft")}
                disabled={status === "draft"}
              >
                Save Draft
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => {
                  setStatus("published");
                  handleUpdate();
                }} 
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
            <div className="pt-2 border-t">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete Post
              </Button>
            </div>
          </div>

          {/* Thumbnail Section */}
          <div className="p-6 border rounded-xl bg-card shadow-sm space-y-4">
            <h3 className="font-semibold text-lg">Thumbnail</h3>
            <div
              className="relative border-2 border-dashed rounded-lg transition-all duration-200 ease-in-out cursor-pointer group border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50"
              onClick={() => thumbnailInputRef.current?.click()}
            >
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailFile}
              />

              <div className="aspect-video w-full flex flex-col items-center justify-center p-4 text-center">
                {thumbnail ? (
                  <div className="relative w-full h-full">
                    <img
                      src={thumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover rounded-md shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                      <p className="text-white font-medium text-sm">Change Image</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setThumbnail("");
                      }}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-md hover:bg-destructive/90 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 py-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary group-hover:scale-110 transition-transform">
                      <ImagePlus className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Click or drag image</p>
                      <p className="text-xs text-muted-foreground">
                        1200x630 recommended
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* URL Fallback */}
            {!thumbnail && (
               <div className="pt-2">
                 <Label className="text-xs text-muted-foreground mb-1.5 block">
                   Or paste image URL
                 </Label>
                 <div className="flex gap-2">
                   <Input
                     placeholder="https://..."
                     value={thumbnail}
                     onChange={(e) => setThumbnail(e.target.value)}
                     className="text-xs h-8"
                   />
                 </div>
               </div>
            )}
          </div>

          {/* Author & Settings */}
          <div className="p-6 border rounded-xl bg-card shadow-sm space-y-6">
            <h3 className="font-semibold text-lg">Settings</h3>
            
            <div className="space-y-2">
              <Label>Author</Label>
              <AuthorSelect
                value={authorSelected ?? undefined}
                onChange={(u) => setAuthorSelected(u ?? null)}
                apiUrl={apiUrl}
                placeholder="Select author..."
                createAuthorByName={createAuthorByName}
              />
            </div>

            <div className="space-y-2">
              <Label>Share URL</Label>
              <Input
                placeholder="custom-share-url"
                value={shareUrl}
                onChange={(e) => setShareUrl(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <Label className="cursor-pointer" htmlFor="featured-switch">Featured Post</Label>
              <Switch 
                id="featured-switch"
                checked={featured} 
                onCheckedChange={setFeatured} 
              />
            </div>
          </div>

          {/* Taxonomy */}
          <div className="p-6 border rounded-xl bg-card shadow-sm space-y-6">
            <h3 className="font-semibold text-lg">Taxonomy</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Menus</Label>
                <Button variant="ghost" size="sm" onClick={() => addMenuPair()} className="h-8 px-2 text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-3">
                {menuPairs.map((pair) => (
                  <div key={pair.id} className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                    <div className="flex gap-2">
                      <Select
                        value={pair.menu}
                        onValueChange={(val) => updateMenuPair(pair.id, { menu: val, submenu: "" })}
                      >
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder="Menu" />
                        </SelectTrigger>
                        <SelectContent>
                          {menus.map((m) => (
                            <SelectItem key={m._id} value={m.name}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeMenuPair(pair.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Select
                      value={pair.submenu}
                      onValueChange={(val) => updateMenuPair(pair.id, { submenu: val })}
                    >
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue placeholder="Submenu" />
                      </SelectTrigger>
                      <SelectContent>
                        {(menus.find((mm) => mm.name === pair.menu)?.submenus || []).map((sm: { _id: string; name: string }) => (
                          <SelectItem key={sm._id} value={sm.name}>{sm.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background min-h-[80px]">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="h-6 text-xs gap-1 pr-1">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                <input
                  className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-xs"
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
