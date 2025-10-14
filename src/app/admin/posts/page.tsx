"use client";

import React, { useState, useEffect } from "react";
import PostsTable, { Post } from "@/components/admin/PostsTable";
import CreateEditPostForm from "./CreateEdit";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await apiFetch<Post[]>("/posts");
        setPosts(res);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleEdit = (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (post) setSelectedPost(post);
    setOpen(true);
  };

  const handleCreate = () => {
    setSelectedPost(null);
    setOpen(true);
  };

  type PostFormValues = {
    title: string;
    slug?: string;
    status: "draft" | "published";
    categories?: string[];
  };

  const handleSave = async (values: PostFormValues) => {
    try {
      if (selectedPost) {
        // Merge existing data with form values
        const updatedPost = { ...selectedPost, ...values };

        await apiFetch(`/posts/${selectedPost.id}`, {
          method: "PUT",
          body: JSON.stringify(updatedPost),
        });

        setPosts((prev) =>
          prev.map((p) => (p.id === selectedPost.id ? updatedPost : p))
        );
      } else {
        const newPost = await apiFetch<Post>("/posts", {
          method: "POST",
          body: JSON.stringify(values),
        });
        setPosts((prev) => [newPost, ...prev]);
      }
      setOpen(false);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) return <p className="p-4">Loading posts...</p>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <Button onClick={handleCreate}>Create Post</Button>
      </div>

      <PostsTable<Post>
        data={posts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        columns={[
          { header: "Title", accessor: "title" },
          { header: "Slug", accessor: "slug" },
          { header: "Author", accessor: "author" },
          { header: "Status", accessor: "status" },
          {
            header: "Created At",
            accessor: "createdAt",
            cell: (val: string) => new Date(val).toLocaleDateString(),
          },
        ]}
      />

      {open && (
        <CreateEditPostForm
          initial={selectedPost ?? undefined} // use 'initial' instead of 'initialData'
          onSubmit={handleSave} // this should accept PostFormValues
        />
      )}
    </div>
  );
}
