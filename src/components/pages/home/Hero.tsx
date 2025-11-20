import Image from "next/image";
import Link from "next/link";
import HeroInfoCard from "./HeroInfoCard";
import HeroVideo from "@/components/common/HeroVideo";
import { fetchFeaturedBlog } from "@/utils/getBlog";

// Utility: format date cleanly
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default async function Hero() {
  const data = await fetchFeaturedBlog();

  if (!data || !data.data?.length) {
    return null;
  }

  const blog = data.data[0];

  return (
    <div className="max-w-[1344px] mx-auto px-6 sm:px-12 mt-[95px] md:mt-[100px] lg:mt-[130px]">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-0">
        {/* Hero Blog */}
        <Link
          href={`/blog/${blog.slug}`}
          className="group w-full lg:w-[80%] relative block"
        >
          <div className="relative object-cover w-full overflow-hidden h-[300px] sm:h-[443px] rounded-lg">
            <Image
              src={
                blog.thumbnail?.formats?.medium?.url ||
                blog.thumbnail?.url ||
                "/images/blog-default.jpg"
              }
              alt={blog.title || "Featured Blog"}
              width={1080}
              height={443}
              className="group-hover:scale-105 w-full duration-300 object-cover h-full"
              priority
            />
          </div>

          {/* Info Card */}
          <div className="w-full -mt-8 sm:-mt-[72px] relative px-4 sm:px-14 z-10">
            <HeroInfoCard
              type={blog.categories?.[0]?.name || "Uncategorized"}
              date={formatDate(blog.createdAt || "")}
              heading={blog.title}
              description={blog.description}
            />
          </div>
        </Link>

        {/* Hero Video */}
        <div className="w-full lg:w-[20%] lg:pl-8 mt-8 lg:mt-0">
          <HeroVideo />
        </div>
      </div>
    </div>
  );
}
