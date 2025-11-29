import * as React from "react";
import type { Editor } from "@tiptap/react";
import type { FormatAction } from "../../types";
import type { toggleVariants } from "@/components/ui/toggle";
import type { VariantProps } from "class-variance-authority";
import {
  CodeIcon,
  DotsHorizontalIcon,
  FontBoldIcon,
  FontItalicIcon,
  StrikethroughIcon,
  TextNoneIcon,
  UnderlineIcon,
} from "@radix-ui/react-icons";
import { ToolbarSection } from "../toolbar-section";

type TextStyleAction =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "code"
  | "clearFormatting";

interface TextStyle extends FormatAction {
  value: TextStyleAction;
}

// Helper to safely call editor methods without throwing during mount
function safeCan(editor: Editor | null, fn: (ed: Editor) => boolean): boolean {
  if (!editor) return false;
  try {
    return !!fn(editor);
  } catch (err) {
    // If editor isn't ready or can() throws during mount, treat as not executable
    return false;
  }
}

const formatActions: TextStyle[] = [
  {
    value: "bold",
    label: "Bold",
    icon: <FontBoldIcon className="size-5" />,
    action: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) =>
      !!editor && !!editor.isActive && editor.isActive("bold"),
    canExecute: (editor) => {
      // defensive: guard against missing view or hasFocus
      if (!editor) return false;
      const view: any = (editor as any).view;
      if (!view) return false;
      const hasFocus =
        typeof view.hasFocus === "function" ? view.hasFocus() : !!view.hasFocus;
      if (!hasFocus) return false;
      return safeCan(
        editor,
        (ed) =>
          ed.can().chain().focus().toggleBold().run() &&
          !ed.isActive("codeBlock")
      );
    },
    shortcuts: ["mod", "B"],
  },
  {
    value: "italic",
    label: "Italic",
    icon: <FontItalicIcon className="size-5" />,
    action: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) =>
      !!editor && !!editor.isActive && editor.isActive("italic"),
    canExecute: (editor) => {
      if (!editor) return false;
      const view: any = (editor as any).view;
      if (!view) return false;
      const hasFocus =
        typeof view.hasFocus === "function" ? view.hasFocus() : !!view.hasFocus;
      if (!hasFocus) return false;
      return safeCan(
        editor,
        (ed) =>
          ed.can().chain().focus().toggleItalic().run() &&
          !ed.isActive("codeBlock")
      );
    },
    shortcuts: ["mod", "I"],
  },
  {
    value: "underline",
    label: "Underline",
    icon: <UnderlineIcon className="size-5" />,
    action: (editor) => editor.chain().focus().toggleUnderline().run(),
    isActive: (editor) =>
      !!editor && !!editor.isActive && editor.isActive("underline"),
    canExecute: (editor) => {
      if (!editor) return false;
      const view: any = (editor as any).view;
      if (!view) return false;
      const hasFocus =
        typeof view.hasFocus === "function" ? view.hasFocus() : !!view.hasFocus;
      if (!hasFocus) return false;
      return safeCan(
        editor,
        (ed) =>
          ed.can().chain().focus().toggleUnderline().run() &&
          !ed.isActive("codeBlock")
      );
    },
    shortcuts: ["mod", "U"],
  },
  {
    value: "strikethrough",
    label: "Strikethrough",
    icon: <StrikethroughIcon className="size-5" />,
    action: (editor) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor) =>
      !!editor && !!editor.isActive && editor.isActive("strike"),
    canExecute: (editor) => {
      if (!editor) return false;
      const view: any = (editor as any).view;
      if (!view) return false;
      const hasFocus =
        typeof view.hasFocus === "function" ? view.hasFocus() : !!view.hasFocus;
      if (!hasFocus) return false;
      return safeCan(
        editor,
        (ed) =>
          ed.can().chain().focus().toggleStrike().run() &&
          !ed.isActive("codeBlock")
      );
    },
    shortcuts: ["mod", "shift", "S"],
  },
  {
    value: "code",
    label: "Code",
    icon: <CodeIcon className="size-5" />,
    action: (editor) => editor.chain().focus().toggleCode().run(),
    isActive: (editor) =>
      !!editor && !!editor.isActive && editor.isActive("code"),
    canExecute: (editor) => {
      if (!editor) return false;
      const view: any = (editor as any).view;
      if (!view) return false;
      const hasFocus =
        typeof view.hasFocus === "function" ? view.hasFocus() : !!view.hasFocus;
      if (!hasFocus) return false;
      return safeCan(
        editor,
        (ed) =>
          ed.can().chain().focus().toggleCode().run() &&
          !ed.isActive("codeBlock")
      );
    },
    shortcuts: ["mod", "E"],
  },
  {
    value: "clearFormatting",
    label: "Clear formatting",
    icon: <TextNoneIcon className="size-5" />,
    action: (editor) => editor.chain().focus().unsetAllMarks().run(),
    isActive: () => false,
    canExecute: (editor) => {
      if (!editor) return false;
      const view: any = (editor as any).view;
      if (!view) return false;
      const hasFocus =
        typeof view.hasFocus === "function" ? view.hasFocus() : !!view.hasFocus;
      if (!hasFocus) return false;
      return safeCan(
        editor,
        (ed) =>
          ed.can().chain().focus().unsetAllMarks().run() &&
          !ed.isActive("codeBlock")
      );
    },
    shortcuts: ["mod", "\\"],
  },
];

interface SectionTwoProps extends VariantProps<typeof toggleVariants> {
  editor: Editor | null;
  activeActions?: TextStyleAction[];
  mainActionCount?: number;
}

export const SectionTwo: React.FC<SectionTwoProps> = ({
  editor,
  activeActions = formatActions.map((action) => action.value),
  mainActionCount = 2,
  size,
  variant,
}) => {
  return (
    <ToolbarSection
      editor={editor as any}
      actions={formatActions}
      activeActions={activeActions}
      mainActionCount={mainActionCount}
      dropdownIcon={<DotsHorizontalIcon className="size-5" />}
      dropdownTooltip="More formatting"
      dropdownClassName="w-8"
      size={size}
      variant={variant}
    />
  );
};

SectionTwo.displayName = "SectionTwo";

export default SectionTwo;
