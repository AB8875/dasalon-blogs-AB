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
    <div className="flex lg:pr-16 mt-[95px] md:mt-[100px] lg:mt-[130px]">
      {/* Hero Blog */}
      <Link
        href={`/blog/${blog.slug}`}
        className="group w-full lg:w-[80%] relative"
      >
        <div className="relative object-cover w-full overflow-hidden h-[443px]">
          <Image
            src={
              blog.thumbnail?.formats?.medium?.url ||
              blog.thumbnail?.url ||
              "/images/blog-default.jpg"
            }
            alt={blog.title || "Featured Blog"}
            width={1080}
            height={443}
            className="group-hover:scale-105 w-full duration-300 min-h-52 object-cover h-full"
            priority
          />
        </div>

        {/* Info Card */}
        <div className="w-full -mt-8 sm:-mt-[72px] relative px-5 sm:px-14">
          <HeroInfoCard
            type={blog.categories?.[0]?.name || "Uncategorized"}
            date={formatDate(blog.createdAt || "")}
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
