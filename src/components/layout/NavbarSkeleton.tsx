import React from "react";
import Skeleton from "../common/Skeleton";

const NavbarSkeleton: React.FC = () => {
  return (
    <div className="hidden lg:flex justify-between items-center mt-4">
      {/* Left Side - Menu Links */}
      <div className="flex items-center gap-5">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} width="w-20" height="h-5" />
        ))}
      </div>

      {/* Right Side - Example Social Icons or Buttons */}
      <div className="flex items-center gap-4">
        <Skeleton width="w-8" height="h-8" rounded="rounded-full" />
        <Skeleton width="w-8" height="h-8" rounded="rounded-full" />
      </div>
    </div>
  );
};

export default NavbarSkeleton;
