import React from "react";

interface SkeletonProps {
  width?: string; // Tailwind width class
  height?: string; // Tailwind height class
  rounded?: string; // Tailwind rounded class
  className?: string;
  style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = "w-20",
  height = "h-4",
  rounded = "rounded-md",
  className = "",
  style,
}) => {
  return (
    <div
      className={`bg-gray-200 animate-pulse ${width} ${height} ${rounded} ${className}`}
      style={style}
    />
  );
};

export default Skeleton;
