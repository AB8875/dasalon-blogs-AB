"use client";

import * as React from "react";
import { AdminButton } from "@/components/admin/AdminButton";
import { ModalShell } from "@/components/admin/ModalShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PostsTable, { Column } from "@/components/admin/PostsTable";
import { id } from "zod/v4/locales";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
};

const demoDataInitial: UserRow[] = [
  { id: "1", name: "Jane Doe", email: "jane@example.com", role: "admin" },
  { id: "2", name: "John Smith", email: "john@example.com", role: "editor" },
  { id: "3", name: "Ava Lee", email: "ava@example.com", role: "viewer" },
];

export default function AdminUsersPage() {
  const [rows, setRows] = React.useState<UserRow[]>(demoDataInitial);
  const [q, setQ] = React.useState("");

  const filtered = rows.filter((r) =>
    [r.name, r.email, r.role].some((v) =>
      String(v).toLowerCase().includes(q.toLowerCase())
    )
  );

  function addUser(v: UserRow) {
    setRows((s) => [{ ...v }, ...s]);
  }

  function updateUser(email: string, v: UserRow) {
    setRows((s) => s.map((r) => (r.email === email ? { ...v } : r)));
  }

  function removeUser(email: string) {
    setRows((s) => s.filter((r) => r.email !== email));
  }

  const columns: Column<UserRow>[] = [
    { accessor: "name", header: "Name" },
    { accessor: "email", header: "Email" },
    { accessor: "role", header: "Role" },
  ];

  const tableData = filtered.map((r) => ({
    ...r,
    actions: (
      <div className="flex items-center justify-end gap-2">
        <ModalShell
          title="Edit User"
          trigger={
            <AdminButton variant="secondary" aria-label={`Edit ${r.email}`}>
              Edit
            </AdminButton>
          }
        >
          <UserForm
            initial={r}
            onSubmit={(vals) => updateUser(r.email, vals)}
          />
        </ModalShell>
        <AdminButton
          variant="destructive"
          aria-label={`Delete ${r.email}`}
          onClick={() => removeUser(r.email)}
        >
          Delete
        </AdminButton>
      </div>
    ),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-pretty">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage admin users and roles (demo data only).
        </p>
      </div>

      <PostsTable<UserRow> data={tableData} columns={columns} />

      <ModalShell
        title="Add User"
        trigger={<AdminButton aria-label="Add User">Add User</AdminButton>}
      >
        <UserForm onSubmit={addUser} />
      </ModalShell>
    </div>
  );
}

function UserForm({
  initial,
  onSubmit,
}: {
  initial?: Partial<UserRow>;
  onSubmit: (v: UserRow) => void;
}) {
  const [name, setName] = React.useState(initial?.name ?? "");
  const [email, setEmail] = React.useState(initial?.email ?? "");
  const [role, setRole] = React.useState<UserRow["role"]>(
    initial?.role ?? "viewer"
  );

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ id: crypto.randomUUID(), name, email, role });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="user-name">Name</Label>
        <Input
          id="user-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="user-email">Email</Label>
        <Input
          id="user-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Select value={role} onValueChange={(v) => setRole(v as any)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end">
        <AdminButton aria-label="Save user" type="submit">
          Save
        </AdminButton>
      </div>
    </form>
  );
}
