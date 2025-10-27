"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

// ✅ Derive ButtonProps from the actual Button component
export type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;

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
      {icon && <span className="mr-2 inline-flex">{icon}</span>}
      {children}
    </Button>
  );
};
