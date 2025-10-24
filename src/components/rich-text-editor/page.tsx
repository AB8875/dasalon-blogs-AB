"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import MenuBar from "./MenuBar";

const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Start writing your blog here... ✨</p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-gray max-w-none min-h-[250px] px-4 py-3 rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-150",
      },
    },
  });

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className="space-y-3">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default Tiptap;
