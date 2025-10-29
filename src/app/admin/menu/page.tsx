"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type MenuType = {
  id: string;
  name: string;
  slug: string;
  description: string;
  submenus?: MenuType[];
};

export default function AdminMenuPage() {
  const [menus, setMenus] = useState<MenuType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuType | null>(null);
  const [submenuForm, setSubmenuForm] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  const fetchMenus = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${base}/api/menu/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mapped: MenuType[] = data.map((item: any) => ({
        id: item.menu._id,
        name: item.menu.name,
        slug: item.menu.slug,
        description: item.menu.description || "",
        submenus:
          item.submenus?.map((sub: any) => ({
            id: sub._id,
            name: sub.name,
            slug: sub.slug,
            description: sub.description || "",
          })) || [],
      }));

      setMenus(mapped);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch menus");
    }
  };

  // Fetch menus whenever token changes or page loads
  useEffect(() => {
    if (token) fetchMenus();
  }, [token]);

  const resetForm = () => {
    setEditingMenu(null);
    setSelectedParent(null);
    setSubmenuForm({ name: "", slug: "", description: "" });
  };

  const handleEditMenu = (menu: MenuType) => {
    setEditingMenu(menu);
    setSubmenuForm({
      name: menu.name,
      slug: menu.slug,
      description: menu.description,
    });
    setSelectedParent(null);
    setIsDialogOpen(true);
  };

  const handleAddSubmenu = (parentId: string) => {
    setSelectedParent(parentId);
    setSubmenuForm({ name: "", slug: "", description: "" });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...submenuForm };

      if (selectedParent) {
        await axios.post(
          `${base}/api/menu/submenus`,
          { ...payload, parent_id: selectedParent },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Submenu created successfully!");
      } else if (editingMenu) {
        await axios.put(`${base}/api/menu/menus/${editingMenu.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Menu updated successfully!");
      } else {
        await axios.post(`${base}/api/menu/menus`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Menu created successfully!");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchMenus(); // refresh menus immediately
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save");
    }
  };

  const handleDelete = async (id: string, parentId?: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      if (parentId) {
        await axios.delete(`${base}/api/menu/submenus/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.delete(`${base}/api/menu/menus/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      toast.success("Deleted successfully!");
      fetchMenus();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete");
    }
  };

  const filteredMenus = menus.filter((menu) =>
    menu.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            Menu
          </h1>
          <p className="text-gray-500 mt-1">Organize your posts into menus</p>
        </div>

        {/* Dialog for create/edit */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={resetForm}>
              <Plus className="w-4 h-4" /> New Menu
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedParent
                  ? "Add Submenu"
                  : editingMenu
                  ? "Edit Menu"
                  : "Create Menu"}
              </DialogTitle>
              <DialogDescription>
                {selectedParent
                  ? "Add a new submenu"
                  : "Fill the details for menu"}
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={submenuForm.name}
                  onChange={(e) =>
                    setSubmenuForm({ ...submenuForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={submenuForm.slug}
                  onChange={(e) =>
                    setSubmenuForm({ ...submenuForm, slug: e.target.value })
                  }
                  placeholder="Leave empty to auto-generate"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={submenuForm.description}
                  onChange={(e) =>
                    setSubmenuForm({
                      ...submenuForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedParent ? "Add" : editingMenu ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder="Search menus..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Menu</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMenus.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500">
                  No menus found. Create your first menu!
                </TableCell>
              </TableRow>
            ) : (
              filteredMenus.map((menu) => (
                <React.Fragment key={menu.id}>
                  <TableRow>
                    <TableCell className="font-semibold">{menu.name}</TableCell>
                    <TableCell>{menu.slug}</TableCell>
                    <TableCell className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditMenu(menu)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(menu.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddSubmenu(menu.id)}
                      >
                        + Submenu
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* Submenus */}
                  {menu.submenus?.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="pl-8">↳ {sub.name}</TableCell>
                      <TableCell>{sub.slug}</TableCell>
                      <TableCell className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedParent(menu.id);
                            setSubmenuForm(sub);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(sub.id, menu.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
