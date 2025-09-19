"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { SubscribeWhiteIcon } from "../icon/icon";
import { useSubscriber } from "@/utils/getSocialmedia";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { footerLinks, legalLinks, socialLinks } from "@/config/footerLinks";
import { Heading } from "../common/Heading";

// ✅ Zod schema
const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});
type FormData = z.infer<typeof emailSchema>;

function Footer() {
  const { mutateAsync: subscribeEmail, isPending } = useSubscriber();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: FormData) => {
    await subscribeEmail(data);
    reset();
  };

  return (
    <footer className="border-t border-border bg-white pt-6 md:pt-9">
      <div className="max-w-[1280px] mx-auto w-full px-8 sm:px-16 flex flex-col text-sm">
        {/* Subscription Box */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-5 border border-gray-300 shadow-sm rounded-md md:rounded-xl p-3 lg:p-5 xl:p-12">
          <div className="md:max-w-[400px]">
            <Heading as="h3" size="xl" className="mb-2">
              Stay Updated, Stay Inspired.
            </Heading>
            <p>
              Subscribe now and get exclusive updates, trends, and insider tips
              before anyone else.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="relative flex flex-col w-full max-w-[432px]"
          >
            <div
              className={`flex items-center w-full pl-2 border rounded-md overflow-hidden 
              ${errors.email ? "border-red-500" : "border-black/80"}`}
            >
              <span className="me-1">
                <SubscribeWhiteIcon />
              </span>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                aria-label="Email Address"
                className="w-full border-0 outline-0 pl-2 text-sm text-black"
              />
              <button
                type="submit"
                disabled={isPending}
                className={`uppercase text-sm px-4 py-[7px] border-l bg-black text-white hover:shadow-lg duration-200
                ${errors.email ? "border-l-red-500" : "border-l-black"}`}
              >
                Subscribe
              </button>
            </div>
            {errors.email && (
              <p className="absolute -bottom-7 left-0 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </form>
        </div>

        {/* Footer Links */}
        <div className="py-10 flex flex-col gap-6">
          <div className="flex flex-wrap justify-between gap-6 2xl:gap-8">
            {/* Logo + First Links */}
            <div className="flex flex-col gap-4">
              <Image
                src="/svg/da-Salon-logo.svg"
                alt="da Salon Logo"
                width={120}
                height={30}
                className="h-6 w-auto"
              />
              <ul className="flex flex-col gap-2">
                {footerLinks[0].links.map((link) => (
                  <FooterLink
                    key={link.name}
                    label={link.name}
                    href={link.href}
                  />
                ))}
              </ul>
            </div>

            {/* Other Footer Sections */}
            {footerLinks.slice(1).map((section) => (
              <div key={section.title} className="flex flex-col gap-4 sm:gap-6">
                <Heading as="h2" size="lg">
                  {section.title}
                </Heading>
                <ul className="flex flex-col gap-2">
                  {section.links.map((link) => (
                    <FooterLink
                      key={link.name}
                      label={link.name}
                      href={link.href}
                    />
                  ))}
                </ul>
              </div>
            ))}

            {/* Social Media */}
            <div className="flex flex-col gap-4 sm:gap-6">
              <Heading as="h2" size="lg">
                Social Media
              </Heading>
              <ul className="flex flex-col gap-2">
                {socialLinks.map((social) => (
                  <FooterLink
                    key={social.name}
                    label={social.name}
                    href={social.href}
                    external
                  />
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-4 sm:gap-6">
              <Heading as="h2" size="lg">
                Legal
              </Heading>
              <ul className="flex flex-col gap-2">
                {legalLinks.map((link) => (
                  <FooterLink
                    key={link.name}
                    label={link.name}
                    href={link.href}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

interface FooterLinkProps {
  label: string;
  href: string;
  external?: boolean;
  icon?: string;
}

const FooterLink: React.FC<FooterLinkProps> = ({
  label,
  href,
  external,
  icon,
}) => {
  const content = (
    <div className="flex items-center gap-2">
      {icon && <SocialIcon name={icon} />}
      <span>{label}</span>
    </div>
  );

  return external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 hover:text-primary transition-colors"
      title={label}
    >
      {content}
    </a>
  ) : (
    <Link
      href={href}
      className="flex items-center gap-2 hover:text-primary transition-colors"
      title={label}
    >
      {content}
    </Link>
  );
};

// ✅ Social Icons
const SocialIcon: React.FC<{ name: string }> = ({ name }) => {
  const iconMap: Record<string, React.JSX.Element> = {
    facebook: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M7 10v4h3v7h4v-7h3l1-4h-4v-2a1 1 0 011-1h3V3h-3a5 5 0 00-5 5v2H7z" />
      </svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3" />
        <path d="M16.5 7.5v.01" />
      </svg>
    ),
    youtube: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <rect x="2" y="4" width="20" height="16" rx="4" />
        <path d="M10 9l5 3-5 3V9z" />
      </svg>
    ),
    linkedin: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <rect x="2" y="2" width="20" height="20" rx="4" />
        <path d="M8 11v5M8 8v.01M12 16v-5M16 16v-3a2 2 0 10-4 0" />
      </svg>
    ),
  };

  return iconMap[name] || null;
};

export default Footer;
