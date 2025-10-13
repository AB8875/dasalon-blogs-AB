// path: src/components/admin/PostsTable.tsx
"use client";

import * as React from "react";

export type Post = {
  id: string;
  title: string;
  slug?: string;
  author: string;
  categories: string[];
  status: "draft" | "published";
  createdAt: string; // ISO or readable string
};

type Props = {
  posts: Post[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPageChange?: (page: number) => void;
};

const formatDate = (value: string) => {
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  } catch {
    return value;
  }
};

const StatusBadge: React.FC<{ status: Post["status"] }> = ({ status }) => {
  const isPublished = status === "published";
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        isPublished
          ? "bg-secondary text-secondary-foreground"
          : "bg-muted text-muted-foreground",
      ].join(" ")}
    >
      {status}
    </span>
  );
};

const ActionButtons: React.FC<{
  id: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ id, onEdit, onDelete }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onEdit(id)}
        className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground shadow-sm ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Edit post"
      >
        {/* Icon: Pencil */}
        Edit
      </button>
      <button
        type="button"
        onClick={() => onDelete(id)}
        className="inline-flex items-center gap-1 rounded-md bg-destructive px-2.5 py-1.5 text-xs font-medium text-destructive-foreground shadow-sm ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Delete post"
      >
        {/* Icon: Trash */}
        Delete
      </button>
    </div>
  );
};

const MobileRow: React.FC<{
  post: Post;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ post, onEdit, onDelete }) => {
  return (
    <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-pretty">{post.title}</div>
          {post.slug ? (
            <div className="text-xs text-muted-foreground">/{post.slug}</div>
          ) : null}
        </div>
        <StatusBadge status={post.status} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="text-muted-foreground">Author</div>
        <div className="text-right">{post.author}</div>
        <div className="text-muted-foreground">Categories</div>
        <div className="text-right truncate">
          {post.categories?.length ? post.categories.join(", ") : "—"}
        </div>
        <div className="text-muted-foreground">Created</div>
        <div className="text-right">{formatDate(post.createdAt)}</div>
      </div>
      <div className="mt-4 flex justify-end">
        <ActionButtons id={post.id} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
};

const TableView: React.FC<Props> = ({ posts, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-card text-card-foreground shadow-sm">
      <table
        className="min-w-full table-fixed text-sm"
        role="table"
        aria-label="Posts table"
      >
        <thead className="sticky top-0 z-10 bg-muted text-muted-foreground">
          <tr>
            <th scope="col" className="w-[28%] px-4 py-3 text-left font-medium">
              Title
            </th>
            <th scope="col" className="w-[14%] px-4 py-3 text-left font-medium">
              Author
            </th>
            <th scope="col" className="w-[22%] px-4 py-3 text-left font-medium">
              Categories
            </th>
            <th scope="col" className="w-[12%] px-4 py-3 text-left font-medium">
              Status
            </th>
            <th scope="col" className="w-[14%] px-4 py-3 text-left font-medium">
              Created
            </th>
            <th
              scope="col"
              className="w-[10%] px-4 py-3 text-right font-medium"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {posts.map((post) => (
            <tr key={post.id} className="hover:bg-muted/40">
              <td className="truncate px-4 py-3 align-top">
                <div className="font-medium">{post.title}</div>
                {post.slug ? (
                  <div className="text-xs text-muted-foreground">
                    /{post.slug}
                  </div>
                ) : null}
              </td>
              <td className="px-4 py-3 align-top">{post.author}</td>
              <td className="px-4 py-3 align-top">
                <div className="truncate">
                  {post.categories?.length ? post.categories.join(", ") : "—"}
                </div>
              </td>
              <td className="px-4 py-3 align-top">
                <StatusBadge status={post.status} />
              </td>
              <td className="px-4 py-3 align-top">
                {formatDate(post.createdAt)}
              </td>
              <td className="px-4 py-3 align-top">
                <div className="flex justify-end">
                  <ActionButtons
                    id={post.id}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              </td>
            </tr>
          ))}
          {posts.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                No posts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const PaginationPlaceholder: React.FC<{
  page: number;
  setPage: (p: number) => void;
  onPageChange?: (p: number) => void;
}> = ({ page, setPage, onPageChange }) => {
  const goTo = (next: number) => {
    const np = Math.max(1, page + next);
    setPage(np);
    onPageChange?.(np);
  };

  return (
    <div className="mt-4 flex items-center justify-between rounded-xl border bg-card px-3 py-2 text-card-foreground">
      <div className="text-xs text-muted-foreground">
        {/* Placeholder: hook your data source for total pages */}
        Page {page}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => goTo(-1)}
          disabled={page <= 1}
          className="inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          aria-label="Previous page"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => goTo(1)}
          className="inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const PostsTable: React.FC<Props> = ({
  posts,
  onEdit,
  onDelete,
  onPageChange,
}) => {
  const [page, setPage] = React.useState<number>(1);

  return (
    <section className="w-full">
      {/* Desktop / Tablet table */}
      <div className="hidden md:block">
        <TableView
          posts={posts}
          onEdit={onEdit}
          onDelete={onDelete}
          onPageChange={onPageChange}
        />
      </div>

      {/* Mobile stacked cards */}
      <div className="space-y-3 md:hidden">
        {posts.map((p) => (
          <MobileRow key={p.id} post={p} onEdit={onEdit} onDelete={onDelete} />
        ))}
        {posts.length === 0 && (
          <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
            No posts found.
          </div>
        )}
      </div>

      {/* Pagination placeholder */}
      <PaginationPlaceholder
        page={page}
        setPage={setPage}
        onPageChange={onPageChange}
      />
    </section>
  );
};

export default PostsTable;

/**
Example demoData and usage:

const demoData: Post[] = [
  {
    id: "1",
    title: "Introducing DaSalon",
    slug: "introducing-dasalon",
    author: "Admin",
    categories: ["News", "Product"],
    status: "published",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Styling Tips for Fall",
    slug: "styling-tips-fall",
    author: "Jane Doe",
    categories: ["Tips"],
    status: "draft",
    createdAt: "2025-10-01",
  },
];

<PostsTable
  posts={demoData}
  onEdit={(id) => console.log("edit", id)}
  onDelete={(id) => console.log("delete", id)}
  onPageChange={(page) => console.log("page", page)}
/>
*/
