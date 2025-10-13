"use client";

import type * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

export type AdminButtonProps = ButtonProps & {
  icon?: React.ReactNode;
};

export const AdminButton: React.FC<AdminButtonProps> = ({
  children,
  icon,
  className,
  ...props
}) => {
  return (
    <Button className={className} {...props}>
      {icon ? <span className="mr-2 inline-flex">{icon}</span> : null}
      {children}
    </Button>
  );
};
