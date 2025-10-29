"use client";

import Link from "next/link";
import { useSubMenu } from "@/utils/getSubMenu";
import { transformMenuDataToNavLinks } from "@/lib/CommonFun";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface SidebarDropDownProps {
  closeSidebar: () => void;
}

const SidebarDropDown = ({ closeSidebar }: SidebarDropDownProps) => {
  const { data: menuData } = useSubMenu();
  // Handle new API response structure - data is directly the array
  const menuArray = Array.isArray(menuData) ? menuData : menuData?.data || [];
  const navLinks = transformMenuDataToNavLinks(menuArray);

  return (
    <div className="px-6 flex flex-col">
      {navLinks.map((item, index) => (
        <Collapsible key={index} className="border-b-2 py-2">
          <CollapsibleTrigger className="flex justify-between items-center w-full text-base ff-jost text-black group">
            <span className="text-start border-b-2 border-transparent group-hover:border-b-primary transition-colors">
              {item.title}
            </span>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>

          <CollapsibleContent className="flex flex-col gap-2 px-4 py-2">
            {item.dropDown.map((sub, i) => (
              <Link
                key={i}
                href={sub.dropdownpath}
                onClick={closeSidebar}
                className="text-base sm:text-lg py-1.5 text-black hover:text-primary ff-jost transition-colors"
              >
                {sub.dropdown}
              </Link>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

export default SidebarDropDown;
