"use client";

import { useState, useEffect, ChangeEvent, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

/**
 * Types matching backend user shape
 */
interface User {
  _id?: string;
  name?: string; // backend used `name` or `full_name` depending on schema; adapt as needed
  full_name?: string;
  email: string;
  role: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load current user from backend (preferred)
  useEffect(() => {
    let mounted = true;

    async function loadMe() {
      try {
        const me = await apiFetch<User>("/api/auth/me");
        if (!mounted) return;
        setUser(me);
        setName(me.full_name ?? me.name ?? "");
        setEmail(me.email ?? "");
        setPhone(me.phone ?? "");
        setAddress(me.address ?? "");
        setAvatarPreview(me.avatar_url ?? "");
        // mirror to localStorage for offline fallback
        try {
          localStorage.setItem("user", JSON.stringify(me));
        } catch {}
      } catch (err: any) {
        console.warn(
          "Could not fetch /auth/me, falling back to localStorage",
          err
        );
        // fallback: localStorage if backend not reachable
        const stored =
          typeof window !== "undefined" ? localStorage.getItem("user") : null;
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as User;
            if (!mounted) return;
            setUser(parsed);
            setName(parsed.full_name ?? parsed.name ?? "");
            setEmail(parsed.email ?? "");
            setPhone(parsed.phone ?? "");
            setAddress(parsed.address ?? "");
            setAvatarPreview(parsed.avatar_url ?? "");
          } catch {
            // ignore parse error
          }
        }
      }
    }

    loadMe();
    return () => {
      mounted = false;
    };
  }, []);

  // handle local preview selection
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    // clear native value when needed via ref after upload
  };

  // helper: upload avatar to backend; returns URL or null
  async function uploadAvatar(file: File, userId?: string) {
    const form = new FormData();
    form.append("file", file);

    const base = process.env.NEXT_PUBLIC_API_URL || "";
    // try dedicated user avatar endpoint first
    if (userId) {
      try {
        const res = await fetch(
          `${base.replace(/\/$/, "")}/api/users/${userId}/avatar`,
          {
            method: "POST",
            body: form,
            headers: {
              Authorization:
                typeof window !== "undefined"
                  ? `Bearer ${localStorage.getItem("token")}`
                  : "",
            },
          }
        );
        if (res.ok) {
          const json = await res.json();
          return json?.url ?? json?.data?.url ?? null;
        }
      } catch (err) {
        // continue to fallback
        console.warn(
          "User avatar endpoint failed, falling back to settings/upload",
          err
        );
      }
    }

    // fallback: settings upload endpoint
    try {
      const res = await fetch(
        `${base.replace(/\/$/, "")}/api/settings/upload`,
        {
          method: "POST",
          body: form,
          headers: {
            Authorization:
              typeof window !== "undefined"
                ? `Bearer ${localStorage.getItem("token")}`
                : "",
          },
        }
      );
      if (res.ok) {
        const json = await res.json();
        return json?.url ?? json?.data?.url ?? null;
      }
    } catch (err) {
      console.error("Avatar upload fallback failed", err);
    }

    return null;
  }

  // update profile (avatar upload -> patch user) and optionally sync settings.contact elsewhere if desired
  const handleUpdate = async () => {
    if (!name || !email) {
      toast.error("Full name and email are required");
      return;
    }
    if (!user?._id) {
      toast.error("No user loaded");
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = avatarPreview || undefined;

      if (avatarFile) {
        const uploaded = await uploadAvatar(avatarFile, user._id);
        if (uploaded) avatarUrl = uploaded;
      }

      // prepare payload for PATCH
      const payload: Partial<User> = {
        full_name: name,
        name: name,
        email,
        phone,
        address,
        avatar_url: avatarUrl,
      };

      await apiFetch(`/api/users/${user._id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      // update local state + storage
      const updated: User = {
        ...user,
        ...payload,
      } as User;

      setUser(updated);
      setAvatarFile(null);
      // revoke blob url if used
      try {
        if (avatarPreview?.startsWith("blob:"))
          URL.revokeObjectURL(avatarPreview);
      } catch {}

      try {
        localStorage.setItem("user", JSON.stringify(updated));
      } catch {}

      toast.success("Profile updated successfully");
    } catch (err: any) {
      console.error("Profile update error:", err);
      // parse 401 if apiFetch throws JSON-stringified 401
      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.status === 401) {
          toast.error("Session expired — please login again");
          // redirect to login
          window.location.href = "/admin/login";
          return;
        }
      } catch {
        // ignore parse error
      }
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
      // clear file input value to allow reselect same file
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">My Profile</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <Avatar className="w-24 h-24 mb-2">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} />
              ) : (
                <AvatarFallback>
                  {(user.full_name ?? user.name ?? "Admin")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>

            <label className="cursor-pointer mt-2 text-blue-600 hover:underline inline-flex items-center gap-2">
              <span>Change Avatar</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-sm font-medium text-gray-700">Address</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Role (read-only) */}
          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <Input value={user.role} readOnly className="mt-1 bg-gray-100" />
          </div>

          <Button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Update Profile"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
