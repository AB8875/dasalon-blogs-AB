"use client";

import type * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface ModalShellProps {
  title: string;
  description?: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  title,
  description,
  trigger,
  children,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent aria-label={title}>
        <DialogHeader>
          <DialogTitle className="text-pretty">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-pretty">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="mt-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
};
