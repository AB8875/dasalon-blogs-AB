// components/Hero.tsx
import React from "react";
import Link from "next/link";
import HeroInfoCrd from "./HeroInfoCard";
import HeroVideo from "@/components/common/HeroVideo";
import { fetchFeaturedBlog, fetchLatestBlog } from "@/utils/getBlog";

/**
 * Hero (server component)
 * - Uses plain <div style={{ backgroundImage }} /> instead of next/image
 * - Falls back from featured to latest blog if needed
 * - Safe guards for missing data
 */

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

export default async function Hero() {
  // fetch featured; fallback to latest if empty
  let payload = await fetchFeaturedBlog();

  if (!payload || !payload.data || !payload.data.length) {
    payload = await fetchLatestBlog();
    if (!payload || !payload.data || !payload.data.length) {
      // nothing to show — render a minimal static hero
      return (
        <div className="max-w-[1344px] mx-auto px-6 sm:px-12 mt-[95px] md:mt-[100px] lg:mt-[130px]">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-0">
            <div className="w-full lg:w-[80%]">
              <div className="rounded-lg bg-gray-100 h-[300px] sm:h-[443px] flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold">Welcome to Dasalon</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Latest articles and curated tutorials
                  </p>
                </div>
              </div>
              <div className="w-full -mt-8 sm:-mt-[72px] relative px-4 sm:px-14 z-10">
                <HeroInfoCrd
                  CardDivClass="mx-auto bg-[#E5E3DB] p-6 z-[999999] max-w-[846px]"
                  type="Uncategorized"
                  typeClass="ff-jost font-medium text-[#111]"
                  date={formatDate(new Date().toISOString())}
                  dateClass="text-[#444] ff-jost"
                  heading="Welcome to Dasalon"
                  headingClass="ff-jost text-[#111] font-medium mb-2"
                  Discription="Curated articles and tutorials for developers and creators."
                />
              </div>
            </div>

            <div className="w-full lg:w-[20%] lg:pl-8 mt-8 lg:mt-0">
              <HeroVideo />
            </div>
          </div>
        </div>
      );
    }
  }

  const blog = payload.data[0];

  // Resolve a usable image URL (if present)
  const imageUrl =
    blog?.thumbnail?.formats?.medium?.url ||
    blog?.thumbnail?.url ||
    "/images/blog-default.jpg";

  // Link target for hero — use blog.slug when present, else homepage
  const targetHref = blog?.slug ? `/blog/${blog.slug}` : "/";

  return (
    <div className="max-w-[1344px] mx-auto px-6 sm:px-12 mt-[95px] md:mt-[100px] lg:mt-[130px]">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-0">
        {/* LEFT: featured area (uses background image via CSS) */}
        <Link
          href={targetHref}
          className="group w-full lg:w-[80%] relative block"
        >
          <div
            className="relative w-full overflow-hidden h-[300px] sm:h-[443px] rounded-lg bg-center bg-cover"
            // use inline style so no Image component is required
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
            aria-hidden={!!imageUrl ? undefined : "true"}
          >
            {/* optional overlay for improved contrast */}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-opacity" />
          </div>

          {/* Info Card — placed overlapping bottom of hero */}
          <div className="w-full -mt-8 sm:-mt-[72px] relative px-4 sm:px-14 z-10">
            <HeroInfoCrd
              CardDivClass="mx-auto bg-[#E5E3DB] p-6 z-[999999] max-w-[846px]"
              type={blog?.categories?.[0]?.name || "Uncategorized"}
              typeClass="ff-jost font-medium text-[#111]"
              date={formatDate(blog?.createdAt)}
              dateClass="text-[#444] ff-jost"
              heading={blog?.title || "Untitled"}
              headingClass="ff-jost text-[#111] font-medium max-sm:leading-[115%] sm:leading-[120%] md:leading-normal mb-2"
              Discription={blog?.description || ""}
            />
          </div>
        </Link>

        {/* RIGHT: HeroVideo */}
        <div className="w-full lg:w-[300px] lg:pl-8 mt-8 lg:mt-0">
          <HeroVideo />
        </div>
      </div>
    </div>
  );
}
