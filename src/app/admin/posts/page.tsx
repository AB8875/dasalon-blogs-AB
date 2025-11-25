"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Grid, List, Edit3, Trash2 } from "lucide-react";
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
  authors?: string[]; // ids
  author?: string; // resolved name (for display)
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

  // load posts and users, then map author ids -> names
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

      // handle users response shape { items: [...] } or [...]
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
            // determine authors array (id strings)
            const authorIds: string[] =
              Array.isArray(p.authors) && p.authors.length > 0
                ? p.authors
                : p.author
                ? [p.author]
                : [];

            // build resolved author display: join names if possible, fallback to id
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
      // remove locally
      setPosts((p) => p.filter((x) => x._id !== id));
    } catch (err) {
      console.error("delete error:", err);
      alert("Failed to delete post - check console.");
    }
  };

  const openPreview = (post: BlogPost) => {
    // ensure author resolution up-to-date (in case map changed)
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
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Posts</h1>
        <div className="flex gap-2">
          <Link href="/admin/posts/create">
            <Button className="flex items-center gap-1">
              <Plus /> Create Post
            </Button>
          </Link>
          <Button variant="outline" onClick={() => setIsGridView((s) => !s)}>
            {isGridView ? <List /> : <Grid />}
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading posts…</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500">No posts created yet.</p>
      ) : isGridView ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <Card
              key={post._id}
              className="cursor-pointer hover:shadow-md relative"
            >
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{post.title}</p>
                    <p className="text-sm text-gray-500">
                      {post.menu}
                      {post.submenu ? ` > ${post.submenu}` : ""}
                    </p>
                    <p className="text-xs text-gray-400">
                      {post.createdAt ? formatDate(post.createdAt) : ""}
                      {"  "}
                      {post.status}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Array.isArray(post.tags) &&
                        post.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      {post.featured && (
                        <Badge variant="default">Featured</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-1">
                      <Link href={`/admin/posts/edit/${post._id}`}>
                        <Button size="sm" variant="ghost" title="Edit">
                          <Edit3 size={14} />
                        </Button>
                      </Link>

                      <Button
                        size="sm"
                        variant="ghost"
                        title="Preview"
                        onClick={() => openPreview(post)}
                      >
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        title="Delete"
                        onClick={() => handleDelete(post._id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>

                {post.thumbnail ? (
                  <img
                    src={post.thumbnail || "/placeholder.svg"}
                    alt="Thumbnail"
                    className="w-full h-28 object-cover rounded-md mt-2"
                  />
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <Card
              key={post._id}
              className="cursor-pointer hover:shadow-md relative"
            >
              <CardContent className="space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{post.title}</p>
                    <p className="text-sm text-gray-500">
                      {post.menu}
                      {post.submenu ? ` > ${post.submenu}` : ""}
                    </p>
                    <p className="text-xs text-gray-400">
                      {post.createdAt ? formatDate(post.createdAt) : ""} {"  "}{" "}
                      {post.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/posts/edit/${post._id}`}>
                      <Button size="sm" variant="ghost" title="Edit">
                        <Edit3 size={14} />
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(post._id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[750px] max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle>Post Preview</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-4">
            {previewPost ? (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">{previewPost.title}</h2>
                <p className="text-sm text-gray-500">
                  {previewPost.menu}
                  {previewPost.submenu ? ` > ${previewPost.submenu}` : ""}{" "}
                  {previewPost.createdAt &&
                    ` | ${formatDate(previewPost.createdAt)}`}{" "}
                  | {previewPost.status}
                </p>
                <p className="text-gray-700">
                  <strong>Author:</strong> {previewPost.author || "—"}
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

                <div className="border rounded p-3 mt-2 min-h-[200px] bg-white">
                  {typeof previewPost.content === "string" ? (
                    <div
                      className="prose max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: previewPost.content }}
                    />
                  ) : (
                    <pre className="text-sm text-muted-foreground">
                      Structured content preview
                    </pre>
                  )}
                </div>

                {Array.isArray(previewPost.images) &&
                  previewPost.images.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Images</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {previewPost.images.map((img, idx) =>
                          img ? (
                            <img
                              key={idx}
                              src={img || "/placeholder.svg"}
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
                    <img
                      src={previewPost.thumbnail || "/placeholder.svg"}
                      alt="Thumbnail"
                      className="w-full h-40 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>
            ) : (
              <p>Loading preview…</p>
            )}
          </div>
          <div className="px-6 py-4 border-t bg-gray-50 dark:bg-gray-900 shrink-0">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewOpen(false)}
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

function formatDate(d?: string) {
  try {
    return d ? new Date(d).toLocaleDateString() : "";
  } catch {
    return "";
  }
}
