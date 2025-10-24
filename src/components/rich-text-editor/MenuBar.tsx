"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface MenuBarProps {
  editor: Editor | null;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
      {/* Undo / Redo */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        Undo
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        Redo
      </Button>

      <Separator orientation="vertical" className="mx-1" />

      {/* Headings */}
      {([1, 2, 3] as const).map((level) => (
        <Button
          key={level}
          variant={
            editor.isActive("heading", { level }) ? "secondary" : "outline"
          }
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
        >
          H{level}
        </Button>
      ))}

      <Button
        variant={editor.isActive("paragraph") ? "secondary" : "outline"}
        size="sm"
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        ¶
      </Button>

      <Separator orientation="vertical" className="mx-1" />

      {/* Formatting */}
      {[
        { cmd: "toggleBold", label: "B" },
        { cmd: "toggleItalic", label: "I" },
        { cmd: "toggleStrike", label: "S" },
      ].map(({ cmd, label }) => (
        <Button
          key={cmd}
          variant={
            editor.isActive(label.toLowerCase()) ? "secondary" : "outline"
          }
          size="sm"
          onClick={() => (editor.chain().focus() as any)[cmd]().run()}
        >
          {label}
        </Button>
      ))}
    </div>
  );
};

export default MenuBar;
