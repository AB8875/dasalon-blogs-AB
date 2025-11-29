import * as React from "react";
import type { Editor } from "@tiptap/react";
import type { FormatAction } from "../types";
import type { VariantProps } from "class-variance-authority";
import type { toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { CaretDownIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToolbarButton } from "./toolbar-button";
import { ShortcutKey } from "./shortcut-key";
import { getShortcutKey } from "../utils";

interface ToolbarSectionProps extends VariantProps<typeof toggleVariants> {
  editor: Editor | null | any;
  actions: FormatAction[];
  activeActions?: string[];
  mainActionCount?: number;
  dropdownIcon?: React.ReactNode;
  dropdownTooltip?: string;
  dropdownClassName?: string;
}

function safeIsActive(action: FormatAction, editor: Editor | null | any) {
  try {
    if (!editor) return false;
    if (!action.isActive) return false;
    return !!action.isActive(editor);
  } catch (err) {
    return false;
  }
}

function safeCanExecute(action: FormatAction, editor: Editor | null | any) {
  try {
    if (!editor) return false;
    // ensure view available before accessing focus/hasFocus related checks
    const view = (editor as any).view;
    if (!view) return false;
    // if action provides canExecute use it, else fallback to editor.can()
    if (typeof action.canExecute === "function") {
      return !!action.canExecute(editor);
    }
    // fallback: try a generic can() check, wrapped in try/catch
    if (typeof editor.can === "function") {
      return !!editor.can().chain().focus().run();
    }
    return false;
  } catch (err) {
    return false;
  }
}

export const ToolbarSection: React.FC<ToolbarSectionProps> = ({
  editor,
  actions,
  activeActions = actions.map((action) => action.value),
  mainActionCount = 0,
  dropdownIcon,
  dropdownTooltip = "More options",
  dropdownClassName = "w-12",
  size,
  variant,
}) => {
  const { mainActions, dropdownActions } = React.useMemo(() => {
    const sortedActions = actions
      .filter((action) => activeActions.includes(action.value))
      .sort(
        (a, b) =>
          activeActions.indexOf(a.value) - activeActions.indexOf(b.value)
      );

    return {
      mainActions: sortedActions.slice(0, mainActionCount),
      dropdownActions: sortedActions.slice(mainActionCount),
    };
  }, [actions, activeActions, mainActionCount]);

  const renderToolbarButton = React.useCallback(
    (action: FormatAction) => {
      const disabled = !safeCanExecute(action, editor);
      const isActive = safeIsActive(action, editor);
      return (
        <ToolbarButton
          key={action.label}
          onClick={() => {
            try {
              if (!disabled) action.action(editor);
            } catch (e) {
              // swallow errors during transient mount
            }
          }}
          disabled={disabled}
          isActive={isActive}
          tooltip={`${action.label} ${action.shortcuts
            .map((s) => getShortcutKey(s).symbol)
            .join(" ")}`}
          aria-label={action.label}
          size={size}
          variant={variant}
        >
          {action.icon}
        </ToolbarButton>
      );
    },
    [editor, size, variant]
  );

  const renderDropdownMenuItem = React.useCallback(
    (action: FormatAction) => {
      const disabled = !safeCanExecute(action, editor);
      const active = safeIsActive(action, editor);
      return (
        <DropdownMenuItem
          key={action.label}
          onClick={() => {
            try {
              if (!disabled) action.action(editor);
            } catch (e) {}
          }}
          disabled={disabled}
          className={cn("flex flex-row items-center justify-between gap-4", {
            "bg-accent": active,
          })}
          aria-label={action.label}
        >
          <span className="grow">{action.label}</span>
          <ShortcutKey keys={action.shortcuts} />
        </DropdownMenuItem>
      );
    },
    [editor]
  );

  const isDropdownActive = dropdownActions.some((action) =>
    safeIsActive(action, editor)
  );

  return (
    <>
      {mainActions.map(renderToolbarButton)}
      {dropdownActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ToolbarButton
              isActive={isDropdownActive}
              tooltip={dropdownTooltip}
              aria-label={dropdownTooltip}
              className={cn("gap-0", dropdownClassName)}
              size={size}
              variant={variant}
            >
              {dropdownIcon || <CaretDownIcon className="size-5" />}
            </ToolbarButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-full">
            {dropdownActions.map(renderDropdownMenuItem)}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};

export default ToolbarSection;
