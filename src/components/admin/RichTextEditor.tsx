"use client";

import type React from "react";
import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap";
import type { Content } from "@tiptap/react";

interface RichTextEditorProps {
  content?: string; // HTML string
  onChange?: (contentHtml: string) => void;
  editable?: boolean;
}

export default function RichTextEditor({
  content = "",
  onChange,
  editable = true,
}: RichTextEditorProps) {
  // Custom image upload handler
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/settings/upload`,
        {
          method: "POST",
          headers,
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.url;
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  };

  const handleChange = (value: Content) => {
    if (onChange && typeof value === "string") {
      onChange(value);
    }
  };

  return (
    <MinimalTiptapEditor
      value={content}
      onChange={handleChange}
      className="w-full"
      editorContentClassName="p-5"
      output="html"
      placeholder="Enter your content here..."
      autofocus={false}
      editable={editable}
      editorClassName="focus:outline-none min-h-[300px]"
      immediatelyRender={true}
      uploader={handleImageUpload}
    />
  );
}
