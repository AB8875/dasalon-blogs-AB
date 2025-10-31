"use client";

import { useEffect, useState } from "react";
import { Plus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type User = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "author" | "user";
  createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "author" as "admin" | "author" | "user",
    password: "",
  });
  const [currentUserRole, setCurrentUserRole] = useState<
    "admin" | "author" | "user" | null
  >(null);

  const BACKEND_URL = "http://localhost:4000";

  useEffect(() => {
    fetchUsers();

    // Robustly load user from localStorage after login
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user?.role) {
          setCurrentUserRole(user.role);
        } else {
          setCurrentUserRole(null);
        }
      } catch {
        setCurrentUserRole(null);
      }
    } else {
      setCurrentUserRole(null);
    }
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/users`);
      if (!res.ok) throw new Error(`Failed to fetch users: ${res.statusText}`);
      const data = await res.json();
      if (Array.isArray(data.items)) {
        setUsers(data.items);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.password) {
      alert("Please enter a password");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add user");
      }
      setIsDialogOpen(false);
      setFormData({ name: "", email: "", role: "author", password: "" });
      fetchUsers();
    } catch (err) {
      console.error("Error adding user:", err);
      alert(err instanceof Error ? err.message : "Error adding user");
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase() ?? "").includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() ?? "").includes(searchQuery.toLowerCase()) ||
      (user.role?.toLowerCase() ?? "").includes(searchQuery.toLowerCase())
  );

  function getRoleBadgeVariant(
    role: string
  ): "default" | "outline" | "destructive" | "secondary" | undefined {
    switch (role) {
      case "admin":
        return "default";
      case "author":
        return "outline";
      case "user":
        return "secondary";
      default:
        return undefined;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header + Add Button (Admin only) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            Team Members
          </h1>
          <p className="text-gray-500 mt-1">Manage your team members</p>
        </div>

        {currentUserRole === "admin" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2"
                onClick={() =>
                  setFormData({
                    name: "",
                    email: "",
                    role: "author",
                    password: "",
                  })
                }
              >
                <Plus className="w-4 h-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-full">
              <DialogHeader>
                <DialogTitle>Add New Team Member</DialogTitle>
                <DialogDescription>
                  Fill the details to add a new member
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: User["role"]) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="author">Author</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Member</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search Input */}
      <Input
        placeholder="Search by name, email, or role"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />

      {/* Responsive Table */}
      <div className="overflow-x-auto w-full hidden md:block">
        <Table className="min-w-[600px] w-full text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  No users found. Add your first team member!
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell className="flex items-center gap-2 text-gray-600 break-words">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View (cards with popup) */}
      <div className="block md:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">
            No users found. Add your first team member!
          </p>
        ) : (
          filteredUsers.map((user) => (
            <Dialog key={user._id}>
              <DialogTrigger asChild>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm active:bg-gray-100">
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-gray-500 text-sm">{user.role}</p>
                  </div>
                  <Plus className="w-5 h-5 rotate-45 text-gray-400" />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-[300px] sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>{user.name}</DialogTitle>
                  <DialogDescription>User Details</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <p>
                    <span className="font-medium text-gray-700">Email:</span>{" "}
                    {user.email}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Role:</span>{" "}
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Joined:</span>{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          ))
        )}
      </div>
    </div>
  );
}
