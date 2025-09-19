import React from "react";
import { fetchLatestBlog } from "@/utils/getBlog";
import { Heading } from "@/components/common/Heading";
import BlogCard from "../../blog/BlogCard";
import { BlogItem } from "@/types/transformerTypes";

async function TheLatest() {
  const blogs = await fetchLatestBlog();

  if (!blogs || !blogs.data?.length) {
    return <div className="text-center py-8">No blogs found.</div>;
  }

  return (
    <section className="max-w-[1344px] mx-auto px-6 sm:px-12 mt-12 mb-8">
      <Heading
        title="The Latest"
        className="mb-9 ff-jost font-light max-md:text-center"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
        {blogs.data.map((item: BlogItem, i: number) => (
          <BlogCard
            key={i}
            cardpath={`/blog/${item.slug}`}
            imgPath={
              item.thumbnail?.formats?.medium?.url ||
              item.thumbnail?.url ||
              "/fallback.jpg" // fallback image
            }
            type={item.categories?.[0]?.name || "Uncategorized"}
            time={new Date(item.createdAt ?? "").toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            heading={item.title || "Untitled"}
            paraOne={item.description || ""}
            auterName={item.authors?.[0]?.name || "Unknown"}
          />
        ))}
      </div>
    </section>
  );
}

export default TheLatest;
