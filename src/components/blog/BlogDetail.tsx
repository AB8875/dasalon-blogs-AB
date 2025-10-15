"use client";

import Image from "next/image";

interface BlogDetailProps {
  slug: string;
}

export default function BlogDetail({ slug }: BlogDetailProps) {
  // For now, dummy data. You’ll connect this later with your backend or static JSON.
  const blog = {
    title: "Example Blog Title",
    thumbnail: "/images/blog-default.jpg",
    content:
      "This is a placeholder for the blog content. You can replace it with dynamic data fetched from your API.",
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">{blog.title}</h1>
      <div className="mb-6">
        <Image
          src={blog.thumbnail}
          alt={blog.title}
          width={800}
          height={400}
          className="rounded-xl object-cover"
        />
      </div>
      <div className="text-gray-700 leading-relaxed">{blog.content}</div>
    </div>
  );
}
