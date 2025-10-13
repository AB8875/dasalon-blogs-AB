"use client";

import * as React from "react";
import DataTable from "@/components/admin/PostTable";
import Column from "@/components/admin/PostTable";
import { AdminButton } from "@/components/admin/AdminButton";
import { ModalShell } from "@/components/admin/ModalShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CategoryRow = { name: string; slug: string; actions?: React.ReactNode };

const demoDataInitial: CategoryRow[] = [
  { name: "News", slug: "news" },
  { name: "Guides", slug: "guides" },
  { name: "Releases", slug: "releases" },
];

export default function AdminCategoriesPage() {
  const [rows, setRows] = React.useState<CategoryRow[]>(demoDataInitial);
  const [q, setQ] = React.useState("");
  const filtered = rows.filter((r) =>
    [r.name, r.slug].some((v) => v.toLowerCase().includes(q.toLowerCase()))
  );

  function addRow(v: { name: string; slug: string }) {
    setRows((s) => [{ name: v.name, slug: v.slug }, ...s]);
  }

  function updateRow(slug: string, v: { name: string; slug: string }) {
    setRows((s) => s.map((r) => (r.slug === slug ? { ...v } : r)));
  }

  function removeRow(slug: string) {
    setRows((s) => s.filter((r) => r.slug !== slug));
  }

  const columns: Column<CategoryRow>[] = [
    { key: "name", header: "Name" },
    { key: "slug", header: "Slug" },
  ];

  const tableData = filtered.map((r) => ({
    ...r,
    actions: (
      <div className="flex items-center justify-end gap-2">
        <ModalShell
          title="Edit Category"
          trigger={
            <AdminButton variant="secondary" aria-label={`Edit ${r.slug}`}>
              Edit
            </AdminButton>
          }
        >
          <CategoryForm
            initial={r}
            onSubmit={(vals) => updateRow(r.slug, vals)}
          />
        </ModalShell>
        <AdminButton
          variant="destructive"
          aria-label={`Delete ${r.slug}`}
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
        <h1 className="text-2xl font-semibold text-pretty">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Organize your posts into categories (demo data only).
        </p>
      </div>

      <DataTable<CategoryRow>
        data={tableData}
        columns={columns}
        actionsHeader="Actions"
        onSearch={setQ}
        onCreate={() => {}}
        createLabel=""
      />

      <ModalShell
        title="Add Category"
        trigger={
          <AdminButton aria-label="Add Category">Add Category</AdminButton>
        }
      >
        <CategoryForm onSubmit={addRow} />
      </ModalShell>
    </div>
  );
}

function CategoryForm({
  initial,
  onSubmit,
}: {
  initial?: Partial<CategoryRow>;
  onSubmit: (v: { name: string; slug: string }) => void;
}) {
  const [name, setName] = React.useState(initial?.name ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, slug });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="cat-name">Name</Label>
        <Input
          id="cat-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cat-slug">Slug</Label>
        <Input
          id="cat-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <AdminButton aria-label="Save category" type="submit">
          Save
        </AdminButton>
      </div>
    </form>
  );
}
