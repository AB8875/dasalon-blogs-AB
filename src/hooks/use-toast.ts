"use client";

import { useCallback } from "react";
import { toast } from "sonner";

export function useToast() {
  const showToast = useCallback(
    ({
      title,
      description,
      variant = "default",
    }: {
      title: string;
      description?: string;
      variant?: "default" | "destructive" | "success" | "warning";
    }) => {
      if (variant === "destructive") {
        toast.error(title, { description });
      } else if (variant === "success") {
        toast.success(title, { description });
      } else if (variant === "warning") {
        toast.warning(title, { description });
      } else {
        toast(title, { description });
      }
    },
    []
  );

  return { toast: showToast };
}
