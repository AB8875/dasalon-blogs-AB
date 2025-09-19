"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SidebarDropDown from "./SidebarDropDown";
import { navbarSocialData, sidebarBottomLinks } from "../helper/Helper";

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={closeSidebar}>
      <SheetContent
        side="left"
        className="flex flex-col p-0 w-full sm:w-[80%] md:w-[60%]"
      >
        {/* Header with logo & close */}
        <SheetHeader className="sticky top-0 bg-white border-b px-6 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={closeSidebar}>
              <Image
                src="/svg/da-Salon-logo.svg"
                alt="logo"
                width={120}
                height={70}
                priority
              />
            </Link>
          </div>
        </SheetHeader>

        {/* Navigation Dropdown */}
        <div className="flex-1 overflow-y-auto">
          <SidebarDropDown closeSidebar={closeSidebar} />
        </div>

        {/* Footer Section */}
        <div className="px-6 py-6 border-t space-y-6">
          {/* Social Icons */}
          <div className="flex items-center gap-6">
            {navbarSocialData.map((item, index) => (
              <Link
                key={index}
                href={item.path}
                onClick={closeSidebar}
                className="flex flex-col items-center text-xs text-black hover:text-primary transition-colors"
              >
                <span>{item.icon}</span>
              </Link>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className="flex w-full items-center gap-2">
            <Input
              type="email"
              placeholder="Sign up for our newsletter"
              className="flex-1"
            />
            <Button type="submit" variant="default" size="sm">
              Subscribe
            </Button>
          </div>

          {/* Bottom Links */}
          <div className="flex flex-col gap-2 border-t pt-4">
            {sidebarBottomLinks.map((item, index) => (
              <Link
                key={index}
                href={item.path}
                onClick={closeSidebar}
                className="text-sm text-black hover:text-primary transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
