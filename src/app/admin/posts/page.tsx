"use client";
import { marked } from "marked";
import type React from "react";

import DOMPurify from "dompurify";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { Plus, Grid, List, ImagePlus, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { slugify } from "@/utils/slugify";
import { CldImage } from "next-cloudinary";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface BlogPost {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  menu: string;
  submenu: string;
  author?: string;
  authors?: string[];
  shareUrl: string;
  featured: boolean;
  status: string;
  tags: string[];
  content: string;
  images: string[]; // All are Cloudinary URLs now
  createdAt?: string;
}

interface MenuType {
  _id: string;
  name: string;
  submenus: Array<{ _id: string; name: string }>;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getCloudinaryPublicId(url: string) {
  if (!url) return "";
  // removes everything up to and including '/upload/v1234567890/'
  const match = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
  return match && match[1] ? match[1] : "";
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isGridView, setIsGridView] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [menus, setMenus] = useState<MenuType[]>([]);

  // load posts
  useEffect(() => {
    fetch(`${apiUrl}/api/blogs`)
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return setPosts([]);
        const normalized = data.map((post: any) => ({
          ...post,
          // normalize author for rendering
          author:
            post.author ||
            (Array.isArray(post.authors) ? post.authors.join(", ") : ""),
        }));
        setPosts(normalized);
      })
      .catch(() => setPosts([]));
  }, []);

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
      .then((data) =>
        setMenus(
          Array.isArray(data)
            ? data.map((m) => ({
                _id: m._id || m.menu?._id,
                name: m.name || m.menu?.name,
                submenus: m.submenus || [],
              }))
            : []
        )
      )
      .catch(() => setMenus([]));
  }, []);
  // Convert Markdown -> HTML (and sanitize) whenever previewPost changes
  useEffect(() => {
    let mounted = true;
    // reset quickly if no preview
    if (!previewPost) {
      setPreviewHtml("");
      return;
    }

    // only handle string content (markdown)
    if (typeof previewPost.content === "string") {
      (async () => {
        try {
          // marked.parse may return string or Promise<string>, so normalize:
          const rawHtml = await Promise.resolve(
            marked.parse(previewPost.content || "")
          );
          const cleanHtml = DOMPurify.sanitize(rawHtml);
          if (mounted) setPreviewHtml(cleanHtml);
        } catch (err) {
          console.error("Failed to parse/sanitize markdown preview:", err);
          if (mounted) setPreviewHtml("");
        }
      })();
    } else {
      // non-string content (editor delta etc.) — clear html and let editor render fallback
      setPreviewHtml("");
    }

    return () => {
      mounted = false;
    };
  }, [previewPost]);
  const addNewPost = (post: BlogPost) => setPosts((prev) => [post, ...prev]);
  const handlePostClick = (post: BlogPost) => {
    setPreviewPost(post);
    setIsPreviewOpen(true);
  };
  const handleUpdatePost = (updated: BlogPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header with Create Post and View Toggle */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Posts</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setEditingPost(null);
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-1"
          >
            <Plus /> Create Post
          </Button>
          <Button variant="outline" onClick={() => setIsGridView(!isGridView)}>
            {isGridView ? <List /> : <Grid />}
          </Button>
        </div>
      </div>

      {/* Posts Display */}
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts created yet.</p>
      ) : isGridView ? (
        <PostsGrid
          posts={posts}
          onPostClick={handlePostClick}
          onEditPost={(p) => {
            setEditingPost(p);
            setIsCreateOpen(true);
          }}
        />
      ) : (
        <PostsList
          posts={posts}
          onPostClick={handlePostClick}
          onEditPost={(p) => {
            setEditingPost(p);
            setIsCreateOpen(true);
          }}
        />
      )}

      {/* Create / Edit Post Modal */}
      <CreatePostModal
        open={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingPost(null);
        }}
        menus={menus}
        addPost={(p) => {
          addNewPost(p);
          setEditingPost(null);
        }}
        editingPost={editingPost}
        onUpdate={(p) => {
          handleUpdatePost(p);
          setEditingPost(null);
        }}
      />

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[750px] max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle>Post Preview</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-4">
            {previewPost && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">{previewPost.title}</h2>
                <p className="text-sm text-gray-500">
                  {previewPost.menu}
                  {previewPost.submenu ? ` > ${previewPost.submenu}` : ""}{" "}
                  {previewPost.createdAt &&
                    ` | ${format(new Date(previewPost.createdAt), "PPP")}`}{" "}
                  | {previewPost.status}
                </p>
                <p className="text-gray-700">
                  <strong>Author:</strong> {previewPost.author}
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(previewPost.tags) &&
                    previewPost.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  {previewPost.featured && (
                    <Badge variant="default">Featured</Badge>
                  )}
                </div>

                {/* Content render: RichTextEditor attempt, fallback to HTML string */}
                <div className="border rounded p-3 mt-2 min-h-[200px] bg-white">
                  {typeof previewPost.content === "string" ? (
                    previewHtml ? (
                      <div
                        className="prose max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground animate-pulse">
                        Rendering preview…
                      </div>
                    )
                  ) : (
                    // editor delta JSON fallback
                    // @ts-ignore
                    <RichTextEditor
                      content={previewPost.content}
                      editable={false}
                    />
                  )}
                </div>

                {previewPost.images?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Images</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {previewPost.images.map((img, idx) =>
                        img ? (
                          <CldImage
                            key={idx}
                            src={getCloudinaryPublicId(img)}
                            width="300"
                            height="300"
                            crop="thumb"
                            alt={`img-${idx}`}
                            className="rounded-md object-cover"
                          />
                        ) : null
                      )}
                    </div>
                  </div>
                )}
                {previewPost.thumbnail && (
                  <div>
                    <h3 className="font-semibold mb-2">Thumbnail</h3>
                    <CldImage
                      src={getCloudinaryPublicId(previewPost.thumbnail)}
                      width="500"
                      height="300"
                      crop="auto"
                      alt="Thumbnail"
                      className="w-full h-40 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="px-6 py-4 border-t bg-gray-50 dark:bg-gray-900 shrink-0">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Grid and List view (pass edit handler)
function PostsGrid({
  posts,
  onPostClick,
  onEditPost,
}: {
  posts: BlogPost[];
  onPostClick: (post: BlogPost) => void;
  onEditPost: (post: BlogPost) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post, i) => (
        <PostCard
          key={post._id ?? i}
          post={post}
          onClick={() => onPostClick(post)}
          onEdit={() => onEditPost(post)}
        />
      ))}
    </div>
  );
}
function PostsList({
  posts,
  onPostClick,
  onEditPost,
}: {
  posts: BlogPost[];
  onPostClick: (post: BlogPost) => void;
  onEditPost: (post: BlogPost) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {posts.map((post, i) => (
        <PostCard
          key={post._id ?? i}
          post={post}
          onClick={() => onPostClick(post)}
          onEdit={() => onEditPost(post)}
        />
      ))}
    </div>
  );
}

// Card for post display with edit button
function PostCard({
  post,
  onClick,
  onEdit,
}: {
  post: BlogPost;
  onClick: () => void;
  onEdit?: () => void;
}) {
  return (
    <Card className="cursor-pointer hover:shadow-md relative">
      {/* Edit button top-right */}
      <div className="absolute top-2 right-2 z-10">
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation(); // prevent opening preview
            onEdit?.();
          }}
          title="Edit post"
        >
          <Edit3 size={16} />
        </Button>
      </div>

      <CardContent className="space-y-1" onClick={onClick}>
        <p className="font-semibold">{post.title}</p>
        <p className="text-sm text-gray-500">
          {post.menu}
          {post.submenu ? ` > ${post.submenu}` : ""}
        </p>
        <p className="text-xs text-gray-400">
          {post.createdAt ? format(new Date(post.createdAt), "PPP") : ""}
          {"  "}
          {post.status}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {Array.isArray(post.tags) &&
            post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          {post.featured && <Badge variant="default">Featured</Badge>}
        </div>
        {post.thumbnail && getCloudinaryPublicId(post.thumbnail) && (
          <CldImage
            src={getCloudinaryPublicId(post.thumbnail)}
            width="300"
            height="150"
            crop="auto"
            alt="Thumbnail"
            className="w-full h-24 object-cover rounded-md mt-2"
          />
        )}
      </CardContent>
    </Card>
  );
}

// Modal: Cloudinary Direct Upload logic (create + edit combined)

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  menus: MenuType[];
  addPost: (post: BlogPost) => void;
  editingPost?: BlogPost | null;
  onUpdate?: (post: BlogPost) => void;
}
const CreatePostModal = ({
  open,
  onClose,
  menus,
  addPost,
  editingPost = null,
  onUpdate,
}: CreatePostModalProps) => {
  // Form States
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [menu, setMenu] = useState("");
  const [submenu, setSubmenu] = useState("");
  const [author, setAuthor] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState("published");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState<any>(""); // allow string or editor value
  const [images, setImages] = useState<string[]>([]);
  const [isShareUrlManuallyEdited, setIsShareUrlManuallyEdited] =
    useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const postImagesInputRef = useRef<HTMLInputElement>(null);

  // Keep slug/ shareUrl in sync with title (unless manually edited)
  useEffect(() => {
    setSlug(slugify(title));
    if (!isShareUrlManuallyEdited) {
      setShareUrl(slugify(title));
    }
  }, [title, isShareUrlManuallyEdited]);

  // Prefill when editingPost changes
  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || "");
      setSlug(editingPost.slug || "");
      setDescription(editingPost.description || "");
      setThumbnail(editingPost.thumbnail || "");
      setMenu(editingPost.menu || "");
      setSubmenu(editingPost.submenu || "");
      setAuthor(editingPost.author || "");
      setShareUrl(editingPost.shareUrl || "");
      setFeatured(!!editingPost.featured);
      setStatus(editingPost.status || "published");
      setTags(editingPost.tags || []);
      setContent(editingPost.content || "");
      setImages(editingPost.images || []);
      setIsShareUrlManuallyEdited(true);
    } else {
      // reset only when switching to create mode
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingPost]);

  // Cloudinary config
  const CLOUD_NAME = "ddzhzrlcb"; // Your cloud name
  const UPLOAD_PRESET = "unsigned_preset"; // Replace with your own preset

  // Cloudinary upload helper
  async function uploadToCloudinary(file: File): Promise<string> {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(url, { method: "POST", body: formData });

    // Defensive: Try to always catch upload errors
    if (!res.ok) {
      let errorDetail = "";
      try {
        const errData = await res.json();
        errorDetail = errData.error?.message || JSON.stringify(errData);
      } catch {}
      throw new Error(
        `Cloudinary upload failed: ${res.status} - ${errorDetail}`
      );
    }

    const data = await res.json();
    if (!data.secure_url) {
      throw new Error(
        data.error?.message || "Cloudinary response missing secure_url"
      );
    }

    return data.secure_url; // Will always be a usable image URL if succeeds
  }

  // Tags logic
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      tagInput.trim() &&
      !tags.includes(tagInput.trim())
    ) {
      e.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) =>
    setTags((prev) => prev.filter((t) => t !== tag));

  // Cloudinary image upload for post images (direct urls)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const url = await uploadToCloudinary(file);
        setImages((prev) => [...prev, url]);
      } catch (err) {
        console.error("Image upload failed", err);
        alert("Image upload failed");
      }
    }
  };

  // Cloudinary upload for thumbnail
  const handleThumbnailFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadToCloudinary(file);
      setThumbnail(url);
    } catch (err) {
      console.error("Thumbnail upload failed", err);
      alert("Thumbnail upload failed");
    }
  };

  const handleRemoveImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setDescription("");
    setThumbnail("");
    setMenu("");
    setSubmenu("");
    setAuthor("");
    setShareUrl("");
    setFeatured(false);
    setStatus("published");
    setTags([]);
    setTagInput("");
    setContent("");
    setImages([]);
    setIsShareUrlManuallyEdited(false);
  };

  // Create or update post (use token if available)
  const handlePostBlog = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const payload: Partial<BlogPost> = {
      title,
      slug,
      description,
      thumbnail,
      menu,
      submenu,
      author,
      shareUrl,
      featured,
      status,
      tags,
      content,
      images,
    };

    try {
      if (editingPost && editingPost._id) {
        // Update
        const res = await fetch(`${apiUrl}/api/blogs/${editingPost._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ ...payload, authors: [author] }),
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || "Failed to update post");
        }
        const updatedPost = await res.json();
        onUpdate?.(updatedPost);
        resetForm();
        onClose();
      } else {
        // Create
        const res = await fetch(`${apiUrl}/api/blogs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ ...payload, authors: [author] }),
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || "Failed to create post");
        }
        const post = await res.json();
        addPost(post);
        resetForm();
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create/update post");
    }
  };

  const selectedMenu = menus.find((m) => m.name === menu);
  const thumbnailId = getCloudinaryPublicId(thumbnail);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-[750px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {editingPost ? "Edit Post" : "Create New Post"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Title & Slug */}
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
              <Input value={slug} readOnly />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Description</Label>
              <Input
                placeholder="Enter short description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Label>Thumbnail URL</Label>
                <button
                  type="button"
                  className="ml-2"
                  onClick={() => thumbnailInputRef.current?.click()}
                  title="Upload thumbnail"
                  style={{ fontSize: 20 }}
                >
                  <ImagePlus />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={thumbnailInputRef}
                  style={{ display: "none" }}
                  onChange={handleThumbnailFile}
                />
              </div>
              <Input
                placeholder="Thumbnail image URL"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
              />

              {thumbnailId ? (
                <CldImage
                  src={thumbnailId}
                  width="300"
                  height="150"
                  crop="auto"
                  alt="Thumbnail"
                  className="w-full h-24 object-cover rounded-md mt-2"
                />
              ) : null}
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <Label>Post Images</Label>
                  <button
                    type="button"
                    className="ml-2"
                    onClick={() => postImagesInputRef.current?.click()}
                    title="Upload post images"
                    style={{ fontSize: 20 }}
                  >
                    <ImagePlus />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={postImagesInputRef}
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {images.map((img, idx) => {
                    const publicId = getCloudinaryPublicId(img);
                    if (!publicId) return null;
                    return (
                      <div key={idx} className="relative">
                        <CldImage
                          src={publicId}
                          width="100"
                          height="100"
                          crop="thumb"
                          alt={`img-${idx}`}
                          className="w-16 h-16 object-cover rounded-md border"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-0 right-0 rounded-full bg-transparent"
                          onClick={() => handleRemoveImage(idx)}
                        >
                          ✕
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Menu & Submenu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Menu</Label>
              <Select
                value={menu}
                onValueChange={(val) => {
                  setMenu(val);
                  setSubmenu("");
                }}
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
            {(selectedMenu?.submenus?.length ?? 0) > 0 && (
              <div>
                <Label>Submenu</Label>
                <Select value={submenu} onValueChange={setSubmenu}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select submenu" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedMenu?.submenus?.map(
                      (sm: { _id: string; name: string }) => (
                        <SelectItem key={sm._id} value={sm.name}>
                          {sm.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Author & Share URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Author</Label>
              <Input
                placeholder="Author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            <div>
              <Label>Share URL</Label>
              <Input
                placeholder="Share URL"
                value={shareUrl}
                onChange={(e) => {
                  setShareUrl(e.target.value);
                  setIsShareUrlManuallyEdited(true);
                }}
              />
            </div>
          </div>

          {/* Featured & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Label>Featured</Label>
              <Switch
                checked={featured}
                onCheckedChange={setFeatured}
                className="ml-2"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
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
                placeholder="Add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <Label>Content</Label>
            <div className="mt-2 border rounded-md min-h-[150px] sm:min-h-[200px]">
              {/* @ts-ignore */}
              <RichTextEditor content={content} onChange={setContent} />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                if (editingPost) {
                  // revert to original editingPost values if present
                  setTitle(editingPost.title || "");
                  setSlug(editingPost.slug || "");
                  setDescription(editingPost.description || "");
                  setThumbnail(editingPost.thumbnail || "");
                  setMenu(editingPost.menu || "");
                  setSubmenu(editingPost.submenu || "");
                  setAuthor(editingPost.author || "");
                  setShareUrl(editingPost.shareUrl || "");
                  setFeatured(!!editingPost.featured);
                  setStatus(editingPost.status || "published");
                  setTags(editingPost.tags || []);
                  setContent(editingPost.content || "");
                  setImages(editingPost.images || []);
                } else {
                  resetForm();
                }
              }}
            >
              Reset
            </Button>
            <Button
              className="bg-purple-600 text-white hover:bg-purple-700"
              onClick={handlePostBlog}
            >
              {editingPost ? "Save Changes" : "Post Blog"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
