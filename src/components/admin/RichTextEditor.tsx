"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";

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
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const linkInputRef = useRef<HTMLInputElement | null>(null);

  // small UI state
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showImageSettings, setShowImageSettings] = useState(false);
  const [imgWidth, setImgWidth] = useState<string>("");
  const [imgHeight, setImgHeight] = useState<string>("");

  useEffect(() => setIsMounted(true), []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: "rte-img",
        },
      }),
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "rte-content min-h-[150px] px-2 outline-none prose prose-slate max-w-none dark:prose-invert",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (typeof content === "string" && content !== current) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  const isImageActive = () => {
    if (!editor) return false;
    return editor.isActive("image");
  };

  const getSelectedImageAttrs = () => {
    if (!editor) return null;
    try {
      const attrs = (editor as any).getAttributes?.("image");
      return attrs || null;
    } catch {
      return null;
    }
  };

  async function uploadToS3(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "content");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "Unknown error");
      throw new Error(`Upload failed: ${res.status} ${err}`);
    }

    const json = await res.json();
    if (!json.secure_url) {
      throw new Error("Upload response missing secure_url");
    }
    return json.secure_url;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    try {
      const uploadedUrl = await uploadToS3(file);
      (editor as any).chain().focus().setImage({ src: uploadedUrl }).run();
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => {
        setShowImageSettings(true);
        const attrs = getSelectedImageAttrs();
        setImgWidth(attrs?.width ?? "");
        setImgHeight(attrs?.height ?? "");
      }, 150);
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Image upload failed. Check console for details.");
    }
  };

  const openLinkInput = () => {
    if (!editor) return;
    const attrs = (editor as any).getAttributes?.("link");
    setLinkUrl(attrs?.href ?? "");
    setShowLinkInput(true);
    setTimeout(() => linkInputRef.current?.focus(), 50);
  };

  const applyLink = () => {
    if (!editor) return;
    const url = (linkUrl || "").trim();
    if (!url) {
      (editor as any).chain().focus().unsetLink().run();
    } else {
      const normalized = url.startsWith("http") ? url : `https://${url}`;
      (editor as any)
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: normalized })
        .run();
    }
    setShowLinkInput(false);
  };

  const removeLink = () => {
    if (!editor) return;
    (editor as any).chain().focus().unsetLink().run();
    setShowLinkInput(false);
  };

  function normalizeSize(val?: string) {
    if (!val) return "";
    const v = val.trim();
    if (
      v.endsWith("%") ||
      v.endsWith("px") ||
      v.endsWith("em") ||
      v.endsWith("rem")
    ) {
      return v;
    }
    if (/^\d+$/.test(v)) return `${v}px`;
    return v;
  }

  const applyImageSettings = () => {
    if (!editor) return;
    const wRaw = imgWidth?.trim();
    const hRaw = imgHeight?.trim();

    const w = normalizeSize(wRaw);
    const h = normalizeSize(hRaw);

    let style = "";
    if (w) style += `width: ${w};`;
    if (h) style += `height: ${h};`;

    if (style) {
      (editor as any)
        .chain()
        .focus()
        .updateAttributes("image", { style })
        .run();
    } else {
      (editor as any)
        .chain()
        .focus()
        .updateAttributes("image", { style: null })
        .run();
    }

    setShowImageSettings(false);
  };

  if (!isMounted || !editor) {
    return (
      <div className="border rounded-md bg-white p-3">
        <div className="text-sm text-gray-500">Editor loading…</div>
      </div>
    );
  }

  const inlineStyles = (
    <style>{`
      .rte-content a { color: #2563eb; text-decoration: underline; }
      .rte-content a:hover { opacity: 0.85; }
      .rte-content img { max-width: 100%; height: auto; }
      .rte-content img[width] { width: auto; }
    `}</style>
  );

  return (
    <div className="border rounded-md bg-white">
      {inlineStyles}
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-2 border-b items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-gray-100" : ""}
        >
          B
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-gray-100" : ""}
        >
          I
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "bg-gray-100" : ""}
        >
          U
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          L
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          C
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          R
        </Button>

        {/* Link controls */}
        <div className="flex items-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openLinkInput()}
            className={editor.isActive("link") ? "bg-gray-100" : ""}
          >
            Link
          </Button>

          {showLinkInput && (
            <div className="absolute top-full mt-2 bg-white border rounded p-2 z-50 shadow-md flex gap-2 items-center">
              <input
                ref={linkInputRef}
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="border p-1 rounded text-sm"
                style={{ minWidth: 220 }}
              />
              <Button size="sm" onClick={applyLink}>
                Apply
              </Button>
              <Button size="sm" variant="outline" onClick={removeLink}>
                Remove
              </Button>
            </div>
          )}
        </div>

        {/* Image upload */}
        <div className="flex items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="rte-image-input"
          />
          <label htmlFor="rte-image-input">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Image
            </Button>
          </label>
        </div>

        {/* Image settings */}
        {isImageActive() && (
          <div className="flex items-center relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const attrs = getSelectedImageAttrs() || {};
                setImgWidth(attrs?.width ?? "");
                setImgHeight(attrs?.height ?? "");
                setShowImageSettings((v) => !v);
              }}
            >
              Image settings
            </Button>

            {showImageSettings && (
              <div className="absolute top-full mt-2 bg-white border rounded p-3 z-50 shadow-md flex gap-2 items-center">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500">
                    Width (px or %)
                  </label>
                  <input
                    value={imgWidth}
                    onChange={(e) => setImgWidth(e.target.value)}
                    className="border p-1 rounded text-sm w-28"
                    placeholder="e.g., 300 or 100%"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500">Height (px)</label>
                  <input
                    value={imgHeight}
                    onChange={(e) => setImgHeight(e.target.value)}
                    className="border p-1 rounded text-sm w-20"
                    placeholder="e.g., 200"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-transparent">apply</label>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={applyImageSettings}>
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowImageSettings(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="p-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
