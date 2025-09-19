// src/config/footerLinks.ts

import {
  FacebookIcon,
  InstagramIcon,
  LinkdinIcon,
} from "@/components/icon/icon";
import { Youtube } from "lucide-react";

export const footerLinks = [
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
      { name: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Docs", href: "/docs" },
      { name: "Help Center", href: "/help" },
      { name: "Community", href: "/community" },
      { name: "Partners", href: "/partners" },
    ],
  },
  {
    title: "Products",
    links: [
      { name: "Pricing", href: "/pricing" },
      { name: "Features", href: "/features" },
      { name: "Integrations", href: "/integrations" },
      { name: "Demo", href: "/demo" },
    ],
  },
];

export const socialLinks = [
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/yourcompany",
    icon: LinkdinIcon,
  },
  {
    name: "Facebook",
    href: "https://facebook.com/yourcompany",
    icon: FacebookIcon,
  },
  {
    name: "Instagram",
    href: "https://instagram.com/yourcompany",
    icon: InstagramIcon,
  },
  {
    name: "YouTube",
    href: "https://youtube.com/yourcompany",
    icon: InstagramIcon,
  },
];

export const legalLinks = [
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms of Service", href: "/terms" },
  { name: "Cookie Policy", href: "/cookies" },
];
