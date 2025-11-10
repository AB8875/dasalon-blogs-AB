"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { Plus, Grid, List, ImagePlus } from "lucide-react";
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
  author: string;
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
  const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
  return match && match[1] ? match[1] : "";
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isGridView, setIsGridView] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [menus, setMenus] = useState<MenuType[]>([]);

  useEffect(() => {
    fetch(`${apiUrl}/api/blogs`)
      .then((r) => r.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []));
  }, []);

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

  const addNewPost = (post: BlogPost) => setPosts([post, ...posts]);
  const handlePostClick = (post: BlogPost) => {
    setPreviewPost(post);
    setIsPreviewOpen(true);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header with Create Post and View Toggle */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Posts</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateOpen(true)}
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
        <PostsGrid posts={posts} onPostClick={handlePostClick} />
      ) : (
        <PostsList posts={posts} onPostClick={handlePostClick} />
      )}
      {/* Create Post Modal */}
      <CreatePostModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        menus={menus}
        addPost={addNewPost}
      />
      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post Preview</DialogTitle>
          </DialogHeader>
          {previewPost && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">{previewPost.title}</h2>
              <p className="text-sm text-gray-500">
                {previewPost.menu}
                {previewPost.submenu ? ` > ${previewPost.submenu}` : ""} |
                {previewPost.createdAt &&
                  ` ${format(new Date(previewPost.createdAt), "PPP")}`}{" "}
                | {previewPost.status}
              </p>
              <p className="text-gray-700">
                <strong>Author:</strong> {previewPost.author}
              </p>
              <div className="flex flex-wrap gap-2">
                {previewPost.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                {previewPost.featured && (
                  <Badge variant="default">Featured</Badge>
                )}
              </div>
              <div className="border rounded p-3 mt-2 min-h-[200px]">
                <RichTextEditor
                  content={previewPost.content}
                  editable={false}
                />
              </div>
              {previewPost.images?.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {previewPost.images.map((img, idx) =>
                    img ? (
                      <CldImage
                        key={idx}
                        src={getCloudinaryPublicId(img)}
                        width="300"
                        height="300"
                        crop="thumb"
                        alt={`img-${idx}`}
                      />
                    ) : null
                  )}
                </div>
              )}
              {previewPost.thumbnail && (
                <CldImage
                  src={getCloudinaryPublicId(previewPost.thumbnail)}
                  width="500"
                  height="300"
                  crop="auto"
                  alt="Thumbnail"
                  className="w-full h-40 object-cover rounded-md border mt-3"
                />
              )}
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Grid and List view (no change except use <CldImage /> for image optimization/rendering)
function PostsGrid({
  posts,
  onPostClick,
}: {
  posts: BlogPost[];
  onPostClick: (post: BlogPost) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post, i) => (
        <PostCard
          key={post._id ?? i}
          post={post}
          onClick={() => onPostClick(post)}
        />
      ))}
    </div>
  );
}
function PostsList({
  posts,
  onPostClick,
}: {
  posts: BlogPost[];
  onPostClick: (post: BlogPost) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {posts.map((post, i) => (
        <PostCard
          key={post._id ?? i}
          post={post}
          onClick={() => onPostClick(post)}
        />
      ))}
    </div>
  );
}

// Card for post display
function PostCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <Card className="cursor-pointer hover:shadow-md" onClick={onClick}>
      <CardContent className="space-y-1">
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

// Modal: Cloudinary Direct Upload logic

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  menus: MenuType[];
  addPost: (post: BlogPost) => void;
}
const CreatePostModal = ({
  open,
  onClose,
  menus,
  addPost,
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
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isShareUrlManuallyEdited, setIsShareUrlManuallyEdited] =
    useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const postImagesInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSlug(slugify(title));
    if (!isShareUrlManuallyEdited) {
      setShareUrl(slugify(title));
    }
  }, [title, isShareUrlManuallyEdited]);

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
    setTags(tags.filter((t) => t !== tag));

  // Cloudinary image upload for post images (direct urls)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      const url = await uploadToCloudinary(file);
      setImages((prev) => [...prev, url]);
    }
  };

  // Cloudinary upload for thumbnail
  const handleThumbnailFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadToCloudinary(file);
    setThumbnail(url);
  };

  const handleRemoveImage = (index: number) =>
    setImages(images.filter((_, i) => i !== index));

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

  const handlePostBlog = async () => {
    const newPost: BlogPost = {
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
      const res = await fetch(`${apiUrl}/api/blogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPost,
          authors: [author],
        }),
      });
      const post = await res.json();
      addPost(post);
      resetForm();
      onClose();
    } catch (err) {
      alert("Failed to create post");
    }
  };
  const selectedMenu = menus.find((m) => m.name === menu);
  const thumbnailId = getCloudinaryPublicId(thumbnail);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-4xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Create New Post
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
                          className="absolute top-0 right-0 rounded-full"
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
            <div>
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
                    className="text-xs hover:text-red-500"
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
              <RichTextEditor content={content} onChange={setContent} />
            </div>
          </div>
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={resetForm}>
              Reset
            </Button>
            <Button
              className="bg-purple-600 text-white hover:bg-purple-700"
              onClick={handlePostBlog}
            >
              Post Blog
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
