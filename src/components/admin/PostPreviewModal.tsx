"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PostPreviewModalProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function PostPreviewModal({
  postId,
  isOpen,
  onClose,
}: PostPreviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    if (isOpen && postId) {
      setLoading(true);
      
      // Fetch both post and users to resolve author names, similar to admin/posts/page.tsx
      Promise.all([
        fetch(`${apiUrl}/api/blogs/${postId}`).then(res => {
          if (!res.ok) throw new Error("Failed to fetch post");
          return res.json();
        }),
        fetch(`${apiUrl}/api/users`).then(res => {
          if (!res.ok) return { items: [] }; // Fail silently for users
          return res.json();
        })
      ])
        .then(([postData, usersData]) => {
          // Process users
          let usersList: any[] = [];
          if (Array.isArray(usersData)) {
            usersList = usersData;
          } else if (usersData && Array.isArray(usersData.items)) {
            usersList = usersData.items;
          }

          const usersMap: Record<string, string> = {};
          usersList.forEach((u: any) => {
            const id = u._id || u.id;
            if (id) usersMap[id] = u.name || "Unknown";
          });

          // Normalize post data
          const resolved = { ...postData };
          
          // Resolve authors
          let authorIds: string[] = [];
          if (Array.isArray(resolved.authors) && resolved.authors.length > 0) {
            authorIds = resolved.authors.map((a: any) => (typeof a === 'object' ? a._id || a.id : a));
          } else if (resolved.author) {
            authorIds = [resolved.author];
          }

          if (authorIds.length > 0) {
             resolved.author = authorIds
               .map((id) => usersMap[id] || id) // Fallback to ID if name not found
               .join(", ");
          }

          setPost(resolved);
        })
        .catch((err) => {
          console.error("Error fetching data:", err);
          setPost(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setPost(null);
    }
  }, [isOpen, postId]);

  function formatDate(d?: string) {
    try {
      return d ? new Date(d).toLocaleDateString() : "";
    } catch {
      return "";
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[750px] max-h-[90vh] p-4 sm:p-6 overflow-hidden flex flex-col">
        <DialogHeader className="px-0 py-0 border-b pb-4 shrink-0">
          <DialogTitle className="text-lg md:text-xl">
            Post Preview
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 py-4 px-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : post ? (
            <div className="space-y-4">
              <h2 className="text-lg md:text-xl font-bold line-clamp-2">
                {post.title}
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                {post.menu}
                {post.submenu ? ` > ${post.submenu}` : ""}{" "}
                {post.createdAt && `| ${formatDate(post.createdAt)}`}{" "}
                | {post.status}
              </p>
              <p className="text-sm md:text-base text-gray-700">
                <strong>Author:</strong> {post.author || "—"}
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(post.tags) &&
                  post.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                {post.featured && (
                  <Badge variant="default">Featured</Badge>
                )}
              </div>

              <div className="border rounded p-3 mt-2 min-h-[200px] bg-white text-sm">
                {typeof post.content === "string" ? (
                  <div
                    className="prose prose-sm md:prose max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                ) : (
                  <pre className="text-xs md:text-sm text-muted-foreground">
                    Structured content preview
                  </pre>
                )}
              </div>

              {Array.isArray(post.images) && post.images.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm md:text-base">
                    Images
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {post.images.map((img: string, idx: number) =>
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

              {post.thumbnail && (
                <div>
                   <h3 className="font-semibold mb-2 text-sm md:text-base">
                    Thumbnail
                  </h3>
                  {/* Using standard img tag to match page.tsx implementation exactly, 
                      though Next.js Image is better, consistency is requested.
                      Wait, page.tsx uses img tag for thumbnail inside dialog.
                      I will use img tag to be safe and consistent.
                  */}
                  <img
                    src={post.thumbnail.url || post.thumbnail || "/placeholder.svg"} 
                    /* Handle both object (from API) and string (if normalized differently) */
                    alt="Thumbnail"
                    className="w-full h-32 md:h-40 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Post not found or failed to load.
            </div>
          )}
        </div>
        <div className="border-t bg-gray-50 dark:bg-gray-900 shrink-0 py-3 px-0 -mx-4 sm:-mx-6 px-4 sm:px-6 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
