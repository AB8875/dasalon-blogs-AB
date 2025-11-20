"use client";

import Image from "next/image";

// blogdetail.tsx
interface BlogDetailProps {
  blog: {
    title: string;
    thumbnail: string;
    content: string;
    // Add other blog fields you use
  };
}

export default function BlogDetail({ blog }: BlogDetailProps) {
  // Use the blog prop directly
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
