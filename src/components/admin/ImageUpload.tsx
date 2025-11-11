"use client";

import React, { useId, useState } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  label?: string;
  value?: string;
  accept?: string;
  onChange: (url: string) => void;
  uploadPath?: string; // optional override for API path
};

export default function ImageUpload({
  label = "Upload",
  value,
  accept = "image/*",
  onChange,
  uploadPath = "/settings/upload",
}: Props) {
  const id = useId();
  const [preview, setPreview] = useState<string | undefined>(value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file?: File | null) {
    if (!file) return;
    setError(null);
    setUploading(true);

    // local preview immediately
    const tmpUrl = URL.createObjectURL(file);
    setPreview(tmpUrl);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Use NEXT_PUBLIC_API_URL if you host API on different origin
      const base = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${base}${uploadPath}`, {
        method: "POST",
        // don't set content-type — browser will set multipart/form-data
        headers: {
          // include token if your upload endpoint requires auth
          Authorization:
            typeof window !== "undefined"
              ? `Bearer ${localStorage.getItem("token")}`
              : "",
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed (${res.status})`);
      }

      const json = await res.json();
      const url = json?.url ?? json?.data?.url;
      if (!url) throw new Error("No upload URL returned from server.");

      // ensure we revoke the object URL after permanent url provided
      if (tmpUrl.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(tmpUrl);
        } catch {}
      }

      setPreview(url);
      onChange(url);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <div className="text-sm font-medium text-gray-700">{label}</div>
      )}

      <div className="flex items-center gap-3">
        <div className="h-16 w-36 border rounded flex items-center justify-center overflow-hidden bg-white">
          {preview ? (
            // keep image contained and not oversized
            <img
              src={preview}
              alt="preview"
              className="max-h-16 object-contain"
            />
          ) : (
            <span className="text-xs text-gray-400">No image</span>
          )}
        </div>

        {/* Use a label trigger for the file input so it doesn't overlay the whole page */}
        <div>
          <label htmlFor={id}>
            <Button type="button" className="gap-2">
              <UploadCloud className="w-4 h-4" />
              {uploading ? "Uploading..." : "Choose File"}
            </Button>
          </label>
          {/* hidden input tied to label via htmlFor */}
          <input
            id={id}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              handleFile(file);
              // clear input so same file can be selected again if needed
              e.currentTarget.value = "";
            }}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
