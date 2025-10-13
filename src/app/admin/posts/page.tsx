"use client";

import * as React from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { AdminButton } from "@/components/admin/AdminButton";
import { ModalShell } from "@/components/admin/ModalShell";
import { CreateEditPostForm, type PostFormValues } from "./CreateEdit";

type PostRow = {
  title: string;
  slug: string;
  status: "draft" | "published";
  category: string;
  actions?: React.ReactNode;
};

const demoDataInitial: PostRow[] = [
  {
    title: "Welcome to Dasalon",
    slug: "welcome",
    status: "published",
    category: "News",
  },
  {
    title: "Admin Tips",
    slug: "admin-tips",
    status: "draft",
    category: "Guides",
  },
  {
    title: "October Update",
    slug: "october-update",
    status: "published",
    category: "Releases",
  },
];

export default function AdminPostsPage() {
  const [rows, setRows] = React.useState<PostRow[]>(demoDataInitial);
  const [filter, setFilter] = React.useState<"all" | "draft" | "published">(
    "all"
  );
  const [q, setQ] = React.useState("");

  const filtered = rows.filter((r) => {
    const matchesQ = [r.title, r.slug, r.category].some((v) =>
      v.toLowerCase().includes(q.toLowerCase())
    );
    const matchesStatus = filter === "all" ? true : r.status === filter;
    return matchesQ && matchesStatus;
  });

  function addRow(values: PostFormValues) {
    setRows((s) => [
      {
        title: values.title,
        slug: values.slug,
        status: values.status,
        category: "News",
      },
      ...s,
    ]);
  }

  function updateRow(slug: string, values: Partial<PostFormValues>) {
    setRows((s) =>
      s.map((r) =>
        r.slug === slug
          ? { ...r, ...values, status: (values.status ?? r.status) as any }
          : r
      )
    );
  }

  function removeRow(slug: string) {
    setRows((s) => s.filter((r) => r.slug !== slug));
  }

  const columns: Column<PostRow>[] = [
    { key: "title", header: "Title" },
    { key: "slug", header: "Slug", className: "hidden sm:table-cell" },
    { key: "category", header: "Category", className: "hidden md:table-cell" },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span
          className={
            r.status === "published" ? "text-emerald-600" : "text-amber-600"
          }
        >
          {r.status}
        </span>
      ),
    },
  ];

  const tableData = filtered.map((r) => ({
    ...r,
    actions: (
      <div className="flex items-center justify-end gap-2">
        <ModalShell
          title="Edit Post"
          description="Update the post fields, then save."
          trigger={
            <AdminButton variant="secondary" aria-label={`Edit ${r.slug}`}>
              Edit
            </AdminButton>
          }
        >
          <CreateEditPostForm
            initial={{
              title: r.title,
              slug: r.slug,
              content: "",
              status: r.status,
            }}
            onSubmit={(vals) => updateRow(r.slug, vals)}
          />
        </ModalShell>
        <AdminButton
          aria-label={`Delete ${r.slug}`}
          variant="destructive"
          onClick={() => removeRow(r.slug)}
        >
          Delete
        </AdminButton>
      </div>
    ),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-pretty">Posts</h1>
        <p className="text-sm text-muted-foreground">
          Manage blog posts. This list is local demo data only.
        </p>
      </div>

      <DataTable<PostRow>
        data={tableData}
        columns={columns}
        actionsHeader="Actions"
        onSearch={setQ}
        filter={{
          label: "Status",
          value: filter,
          onChange: (v) => setFilter(v as any),
          options: [
            { label: "All", value: "all" },
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
          ],
        }}
        onCreate={() => {}}
        createLabel=""
      />

      <div>
        <ModalShell
          title="Create Post"
          description="Fill the fields below to add a new post."
          trigger={
            <AdminButton aria-label="Create Post">Create Post</AdminButton>
          }
        >
          <CreateEditPostForm onSubmit={addRow} />
        </ModalShell>
      </div>
    </div>
  );
}
