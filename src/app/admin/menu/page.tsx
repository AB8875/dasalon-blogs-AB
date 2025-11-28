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
  index?: number;
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
    index: 0,
  });
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // ---------------------- FETCH TOKEN ----------------------
  useEffect(() => {
    const t = localStorage.getItem("token");
    console.log("Token from localStorage:", t ? "exists" : "missing");
    if (t) setToken(t);
  }, []);

  // ---------------------- FETCH MENUS ----------------------
  const fetchMenus = async () => {
    if (!token) {
      console.log("No token available yet");
      return;
    }
    try {
      console.log("Fetching menus from:", `${base}/api/menu/admin/all`);
      const { data } = await axios.get(`${base}/api/menu/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched data:", data);

      // 🧠 Auto-detect structure
      const mapped: MenuType[] = data.map((item: any) => {
        if (item.menu) {
          // backend structure: { menu: {}, submenus: [] }
          return {
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
          };
        } else {
          // backend structure: [ { _id, name, slug, submenus: [] } ]
          return {
            id: item._id,
            name: item.name,
            slug: item.slug,
            description: item.description || "",
            submenus:
              item.submenus?.map((sub: any) => ({
                id: sub._id,
                name: sub.name,
                slug: sub.slug,
                description: sub.description || "",
              })) || [],
          };
        }
      });

      setMenus(mapped);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch menus");
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [token]);

  // ---------------------- RESET FORM ----------------------
  const resetForm = () => {
    setEditingMenu(null);
    setSelectedParent(null);
    setSubmenuForm({ name: "", slug: "", description: "", index: 0 });
  };

  // ---------------------- EDIT MENU ----------------------
  const handleEditMenu = (menu: MenuType) => {
    setEditingMenu(menu);
    setSubmenuForm({
      name: menu.name,
      slug: menu.slug,
      description: menu.description,
      index: 0, // Default or fetch if available
    });
    setSelectedParent(null);
    setIsDialogOpen(true);
  };

  // ---------------------- ADD SUBMENU ----------------------
  const handleAddSubmenu = (parentId: string) => {
    setSelectedParent(parentId);
    setSubmenuForm({ name: "", slug: "", description: "", index: 0 });
    setIsDialogOpen(true);
  };

  // ---------------------- CREATE / UPDATE MENU ----------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure index is a number
      const payload = { ...submenuForm, index: Number(submenuForm.index) };

      let response;
      
      // Case 1: Editing an existing item
      if (editingMenu) {
        if (selectedParent) {
          // Edit Submenu
          response = await axios.put(
            `${base}/api/menu/submenus/${editingMenu.id}`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success("Submenu updated successfully!");
        } else {
          // Edit Main Menu
          response = await axios.put(
            `${base}/api/menu/menus/${editingMenu.id}`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success("Menu updated successfully!");
        }
      } 
      // Case 2: Creating a new item
      else if (selectedParent) {
        // Create Submenu
        response = await axios.post(
          `${base}/api/menu/submenus`,
          { ...payload, parent_id: selectedParent },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Submenu created successfully!");
      } else {
        // Create Main Menu
        response = await axios.post(`${base}/api/menu/menus`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Menu created successfully!");
      }

      // ---------------------- Update menus instantly ----------------------
      const newMenu = response?.data;
      if (newMenu) {
        setMenus((prev) => {
          // Case 1: Editing Submenu (Both selectedParent and editingMenu are set)
          if (selectedParent && editingMenu) {
             return prev.map((menu) =>
              menu.id === selectedParent
                ? {
                    ...menu,
                    submenus: menu.submenus?.map((sub) =>
                      sub.id === editingMenu.id
                        ? {
                            ...sub,
                            name: newMenu.name,
                            slug: newMenu.slug,
                            description: newMenu.description,
                            index: newMenu.index,
                          }
                        : sub
                    ),
                  }
                : menu
            );
          }
          // Case 2: Creating Submenu (Only selectedParent is set)
          else if (selectedParent) {
            return prev.map((menu) =>
              menu.id === selectedParent
                ? {
                    ...menu,
                    submenus: [
                      ...(menu.submenus || []),
                      {
                        id: newMenu._id,
                        name: newMenu.name,
                        slug: newMenu.slug,
                        description: newMenu.description || "",
                        index: newMenu.index,
                      },
                    ],
                  }
                : menu
            );
          }
          // Case 3: Editing Main Menu (Only editingMenu is set)
          else if (editingMenu) {
            return prev.map((menu) =>
              menu.id === editingMenu.id
                ? {
                    ...menu,
                    name: newMenu.name,
                    slug: newMenu.slug,
                    description: newMenu.description,
                    index: newMenu.index,
                  }
                : menu
            );
          }
          // Case 4: Creating Main Menu
          else {
            return [
              ...prev,
              {
                id: newMenu._id,
                name: newMenu.name,
                slug: newMenu.slug,
                description: newMenu.description || "",
                index: newMenu.index,
                submenus: [],
              },
            ];
          }
        });
      }

      // ---------------------- Cleanup ----------------------
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save");
    }
  };

  // ---------------------- DELETE MENU ----------------------
  const handleDelete = async (id: string, parentId?: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      if (parentId) {
        await axios.delete(`${base}/api/menu/submenus/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMenus((prev) =>
          prev.map((menu) =>
            menu.id === parentId
              ? {
                  ...menu,
                  submenus: menu.submenus?.filter((sub) => sub.id !== id),
                }
              : menu
          )
        );
      } else {
        await axios.delete(`${base}/api/menu/menus/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMenus((prev) => prev.filter((menu) => menu.id !== id));
      }

      toast.success("Deleted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete");
    }
  };

  // ---------------------- FILTER SEARCH ----------------------
  const filteredMenus = menus.filter((menu) =>
    menu.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ---------------------- RENDER ----------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
          <p className="text-gray-500 mt-1">
            Organize your posts into menus and submenus
          </p>
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
                  ? "Add a new submenu under this menu."
                  : "Fill in the menu details below."}
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
                <Label htmlFor="index">Order Index</Label>
                <Input
                  id="index"
                  type="number"
                  value={submenuForm.index}
                  onChange={(e) =>
                    setSubmenuForm({ ...submenuForm, index: Number(e.target.value) })
                  }
                  placeholder="0"
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
              <div className="flex justify-end gap-2">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
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
              <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="pl-8 text-gray-700">
                        ↳ {sub.name}
                      </TableCell>
                      <TableCell>{sub.slug}</TableCell>
                      <TableCell className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedParent(menu.id);
                            setEditingMenu(sub);
                            setSubmenuForm({
                              name: sub.name,
                              slug: sub.slug,
                              description: sub.description,
                              index: sub.index || 0,
                            });
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
