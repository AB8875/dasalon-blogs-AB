"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Grid, List, Edit3, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface BlogPost {
  _id?: string;
  title?: string;
  slug?: string;
  description?: string;
  thumbnail?: string;
  menu?: string;
  submenu?: string;
  authors?: string[];
  author?: string;
  shareUrl?: string;
  featured?: boolean;
  status?: string;
  tags?: string[];
  content?: any;
  images?: string[];
  createdAt?: string;
}

type UserItem = { _id: string; name: string; email?: string };

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isGridView, setIsGridView] = useState(true);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [usersMap, setUsersMap] = useState<Record<string, UserItem>>({});

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const [postsRes, usersRes] = await Promise.all([
        fetch(`${apiUrl}/api/blogs`),
        fetch(`${apiUrl}/api/users`),
      ]);

      if (!postsRes.ok)
        throw new Error(`Failed to fetch posts (${postsRes.status})`);
      const postsData = await postsRes.json();

      let usersRaw: any[] = [];
      try {
        const ud = await usersRes.json();
        usersRaw = Array.isArray(ud?.items)
          ? ud.items
          : Array.isArray(ud)
          ? ud
          : [];
      } catch {
        usersRaw = [];
      }

      const usersList: UserItem[] = usersRaw.map((u: any) => ({
        _id: u._id || u.id,
        name: u.name,
        email: u.email,
      }));
      const map: Record<string, UserItem> = {};
      usersList.forEach((u) => (map[u._id] = u));
      setUsersMap(map);

      const normalized = Array.isArray(postsData)
        ? postsData.map((p: any) => {
            const authorIds: string[] =
              Array.isArray(p.authors) && p.authors.length > 0
                ? p.authors
                : p.author
                ? [p.author]
                : [];

            const resolvedName =
              authorIds
                .map((aid) => map[aid]?.name || aid)
                .filter(Boolean)
                .join(", ") || "";

            return {
              ...p,
              authors: authorIds,
              author: resolvedName,
            } as BlogPost;
          })
        : [];
      setPosts(normalized);
    } catch (err) {
      console.error("loadPosts error:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this post? This action cannot be undone.")) return;
    try {
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
      setPosts((p) => p.filter((x) => x._id !== id));
    } catch (err) {
      console.error("delete error:", err);
      alert("Failed to delete post - check console.");
    }
  };

  const openPreview = (post: BlogPost) => {
    const resolved = { ...post };
    if (resolved.authors && resolved.authors.length > 0) {
      resolved.author = resolved.authors
        .map((aid) => usersMap[aid]?.name || aid)
        .join(", ");
    }
    setPreviewPost(resolved);
    setPreviewOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header with Title and Buttons - Made responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Your Posts</h1>
        <div className="flex gap-2 flex-wrap">
          <Link href="/admin/posts/create" className="flex-1 sm:flex-none">
            <Button className="w-full sm:w-auto flex items-center justify-center gap-1">
              <Plus size={18} /> Create Post
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setIsGridView((s) => !s)}
            className="sm:w-auto"
          >
            {isGridView ? <List size={18} /> : <Grid size={18} />}
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading posts…</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500">No posts created yet.</p>
      ) : isGridView ? (
        // Grid View - Improved responsiveness and button layout
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <Card
              key={post._id}
              className="cursor-pointer hover:shadow-md transition-shadow flex flex-col"
            >
              <CardContent className="space-y-3 flex-1 flex flex-col">
                <div className="flex-1">
                  <p className="font-semibold line-clamp-2 text-sm md:text-base">
                    {post.title}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 line-clamp-1">
                    {post.menu}
                    {post.submenu ? ` > ${post.submenu}` : ""}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {post.createdAt ? formatDate(post.createdAt) : ""} •{" "}
                    {post.status}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Array.isArray(post.tags) &&
                      post.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    {post.featured && (
                      <Badge variant="default" className="text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>

                {post.thumbnail && (
                  <img
                    src={post.thumbnail || "/placeholder.svg"}
                    alt="Thumbnail"
                    className="w-full h-24 md:h-28 object-cover rounded-md"
                  />
                )}

                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                  <Link
                    href={`/admin/posts/edit/${post._id}`}
                    className="flex-1 sm:flex-none"
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full sm:w-auto"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                      <span className="hidden sm:inline ml-1">Edit</span>
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 sm:flex-none bg-transparent"
                    title="Preview"
                    onClick={() => openPreview(post)}
                  >
                    <Eye size={16} />
                    <span className="hidden sm:inline ml-1">Preview</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 sm:flex-none"
                    title="Delete"
                    onClick={() => handleDelete(post._id)}
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline ml-1">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // List View - Improved responsiveness for buttons
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <Card
              key={post._id}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="space-y-3 md:space-y-0">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold line-clamp-1 text-sm md:text-base">
                      {post.title}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 line-clamp-1">
                      {post.menu}
                      {post.submenu ? ` > ${post.submenu}` : ""}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {post.createdAt ? formatDate(post.createdAt) : ""} •{" "}
                      {post.status}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Array.isArray(post.tags) &&
                        post.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 md:gap-1 md:flex-nowrap md:ml-auto">
                    <Link
                      href={`/admin/posts/edit/${post._id}`}
                      className="flex-1 md:flex-none"
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full md:w-auto"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                        <span className="hidden md:inline ml-1">Edit</span>
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 md:flex-none bg-transparent"
                      title="Preview"
                      onClick={() => openPreview(post)}
                    >
                      <Eye size={16} />
                      <span className="hidden md:inline ml-1">Preview</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 md:flex-none"
                      title="Delete"
                      onClick={() => handleDelete(post._id)}
                    >
                      <Trash2 size={16} />
                      <span className="hidden md:inline ml-1">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog - Made responsive for mobile */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[750px] max-h-[90vh] p-4 sm:p-6 overflow-hidden flex flex-col">
          <DialogHeader className="px-0 py-0 border-b pb-4 shrink-0">
            <DialogTitle className="text-lg md:text-xl">
              Post Preview
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 py-4 px-0">
            {previewPost ? (
              <div className="space-y-4">
                <h2 className="text-lg md:text-xl font-bold line-clamp-2">
                  {previewPost.title}
                </h2>
                <p className="text-xs md:text-sm text-gray-500">
                  {previewPost.menu}
                  {previewPost.submenu ? ` > ${previewPost.submenu}` : ""}{" "}
                  {previewPost.createdAt &&
                    `| ${formatDate(previewPost.createdAt)}`}{" "}
                  | {previewPost.status}
                </p>
                <p className="text-sm md:text-base text-gray-700">
                  <strong>Author:</strong> {previewPost.author || "—"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(previewPost.tags) &&
                    previewPost.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  {previewPost.featured && (
                    <Badge variant="default">Featured</Badge>
                  )}
                </div>

                <div className="border rounded p-3 mt-2 min-h-[200px] bg-white text-sm">
                  {typeof previewPost.content === "string" ? (
                    <div
                      className="prose prose-sm md:prose max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: previewPost.content }}
                    />
                  ) : (
                    <pre className="text-xs md:text-sm text-muted-foreground">
                      Structured content preview
                    </pre>
                  )}
                </div>

                {Array.isArray(previewPost.images) &&
                  previewPost.images.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 text-sm md:text-base">
                        Images
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {previewPost.images.map((img, idx) =>
                          img ? (
                            <img
                              key={idx}
                              src={img || "/placeholder.svg"}
                              alt={`img-${idx}`}
                              className="rounded-md object-cover h-24 md:h-28"
                            />
                          ) : null
                        )}
                      </div>
                    </div>
                  )}

                {previewPost.thumbnail && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm md:text-base">
                      Thumbnail
                    </h3>
                    <img
                      src={previewPost.thumbnail || "/placeholder.svg"}
                      alt="Thumbnail"
                      className="w-full h-32 md:h-40 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>
            ) : (
              <p>Loading preview…</p>
            )}
          </div>
          <div className="border-t bg-gray-50 dark:bg-gray-900 shrink-0 py-3 px-0 -mx-4 sm:-mx-6 px-4 sm:px-6 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatDate(d?: string) {
  try {
    return d ? new Date(d).toLocaleDateString() : "";
  } catch {
    return "";
  }
}
