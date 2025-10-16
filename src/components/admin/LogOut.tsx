"use client";

import { LogOut as LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // ✅ utility for conditional classes (from shadcn template)

interface LogOutProps {
  className?: string;
}

export default function LogOut({ className }: LogOutProps) {
  const router = useRouter();

  const handleLogout = () => {
    // ✅ Example: Clear tokens or local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("You have been logged out successfully.");
    router.push("/admin/login");
  };

  return (
    <div
      className={cn(
        "flex w-full justify-center py-4 border-t border-muted/20",
        className
      )}
    >
      <Button
        variant="ghost"
        className="flex items-center gap-2  justify-start text-black   hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        onClick={handleLogout}
      >
        <LogOutIcon className="w-4 h-4" />
        <span className="text-sm font-medium cursor-pointer">Logout</span>
      </Button>
    </div>
  );
}
