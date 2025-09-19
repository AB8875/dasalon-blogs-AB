import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariant = cva("font-semibold gap-1 items-center  tracking-[-2%]", {
  variants: {
    size: {
      "3xs": "text-[8px] leading-tight ",
      "2xs": "text-[11px] leading-tight ",
      xs: "text-xs leading-tight ",
      sm: "text-sm leading-tight ",
      md: "text-base leading-tight",
      lg: "text-lg leading-tight",
      xl: "text-xl leading-tight",
      "2xl": "text-2xl leading-tight",
      "text-28px": "text-[28px] leading-tight",
      "3xl": "text-3xl leading-tight",
      "4xl": "text-4xl leading-tight",
      "5xl": "text-5xl leading-tight",
      "6xl": "text-6xl leading-tight",
      "7xl": "text-7xl leading-tight",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface HeadingProps extends VariantProps<typeof headingVariant> {
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  children?: React.ReactNode;
  title?: string;
}

function Heading({
  as: Wrapper = "h1",
  className,
  children,
  size,
  title,
}: HeadingProps) {
  return (
    <Wrapper className={cn(headingVariant({ size }), title, className)}>
      {children}
    </Wrapper>
  );
}

export { Heading, headingVariant };
