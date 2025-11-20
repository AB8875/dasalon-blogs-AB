import Image from "next/image";
import type { BlogItem } from "@/types/transformerTypes";

// Extend BlogItem type if needed
// Make sure BlogItem has these properties!
interface ExtendedBlogItem extends BlogItem {
  content: string;
  thumbnail?: {
    url?: string;
    formats?: {
      large?: { url: string };
      medium?: { url: string };
    };
  };
  authors?: { name: string }[];
  createdAt?: string;
}

interface BlogDetailProps {
  blog: ExtendedBlogItem;
}

export default function BlogDetail({ blog }: BlogDetailProps) {
  const { title, content, thumbnail, authors, createdAt } = blog;

  // Support both 'large' and 'medium' thumbnail formats safely
  const imageUrl =
    thumbnail?.formats?.large?.url ||
    thumbnail?.formats?.medium?.url ||
    thumbnail?.url ||
    "/images/blog-default.jpg";

  return (
    <div className="max-w-[1344px] mx-auto py-10 px-4 md:px-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
        {title}
      </h1>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
        {authors && authors.length > 0 && <span>By {authors[0].name}</span>}
        <span>
          {createdAt
            ? new Date(createdAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : ""}
        </span>
      </div>

      <div className="mb-8 relative w-full h-[400px] md:h-[500px]">
        <Image
          src={imageUrl}
          alt={title || "Blog Image"}
          fill
          className="rounded-xl object-cover"
          priority
        />
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
        {content}
      </div>
    </div>
  );
}
