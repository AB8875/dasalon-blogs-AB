// src/components/hero/Hero.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import HeroInfoCard from "./HeroInfoCard";
import HeroVideo from "@/components/common/HeroVideo";
import { fetchFeaturedBlog } from "@/utils/getBlog";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "@/components/common/Skeleton";

// Utility: format date cleanly
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function Hero() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["featuredBlog"],
    queryFn: fetchFeaturedBlog,
  });

  if (isLoading) {
    return (
      <div className="flex lg:pr-16 mt-[95px] md:mt-[100px] lg:mt-[130px] gap-6">
        <Skeleton className="w-full lg:w-[80%] h-[442px]" />
        <Skeleton className="hidden lg:block w-[16%] h-[350px]" />
      </div>
    );
  }

  if (isError || !data?.data?.length) {
    return <div className="text-center py-10">Error loading blog data</div>;
  }

  const blog = data.data[0];

  return (
    <div className="flex lg:pr-16 mt-[95px] md:mt-[100px] lg:mt-[130px]">
      {/* Hero Blog */}
      <Link
        href={`/blog/${blog.slug}`}
        className="group w-full lg:w-[80%] relative"
      >
        <div className="relative object-cover w-full overflow-hidden">
          {blog.thumbnail?.formats?.medium?.url || blog.thumbnail?.url ? (
            <Image
              src={blog.thumbnail.formats?.medium?.url || blog.thumbnail.url}
              alt={blog.title}
              width={1080}
              height={443}
              className="group-hover:scale-105 w-full duration-300 min-h-52 object-cover max-h-[443px]"
              priority
            />
          ) : (
            <Skeleton className="w-full h-[443px]" />
          )}
        </div>

        {/* Info Card */}
        <div className="w-full -mt-8 sm:-mt-[72px] relative px-5 sm:px-14">
          <HeroInfoCard
            type={blog.categories?.[0]?.name || "Uncategorized"}
            date={formatDate(blog.createdAt)}
            heading={blog.title}
            description={blog.description}
          />
        </div>
      </Link>

      {/* Hero Video */}
      <HeroVideo />
    </div>
  );
}
