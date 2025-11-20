"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { getBlogsBySubmenu } from "@/service/blog/Blogs";

type Post = {
  id: number;
  documentId: string;
  title: string;
  description: string;
  thumbnail?: {
    url: string;
    formats?: {
      medium?: { url: string };
    };
  };
  content?: string;
  createdAt: string;
  submenu?: {
    name: string;
  };
  slug: string;
};

export default function SubmenuPostsPage() {
  const params = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [submenuName, setSubmenuName] = useState("");
  const [loading, setLoading] = useState(true);

  const submenuId = params.submenuId as string;

  useEffect(() => {
    if (!submenuId) return;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data } = await getBlogsBySubmenu(submenuId);
        setPosts(data);

        // Try to set submenu name from the first post if available
        if (data && data.length > 0 && data[0].submenu) {
          setSubmenuName(data[0].submenu.name);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [submenuId]);

  if (loading) {
    return (
      <div className="max-w-[1344px] mx-auto px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[400px] bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1344px] mx-auto px-6 py-12 mt-8">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-10 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4 capitalize">
          {submenuName || "Blog Posts"}
        </h1>
        <div className="h-1 w-20 bg-black"></div>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <p className="text-gray-500 text-lg">
            No posts found in this category.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block h-full"
            >
              <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
                {/* Thumbnail */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                  <Image
                    src={
                      post.thumbnail?.formats?.medium?.url ||
                      post.thumbnail?.url ||
                      "/placeholder.svg"
                    }
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                      {submenuName || "Blog"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-gray-600 transition-colors">
                    {post.title}
                  </h2>

                  {post.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow leading-relaxed">
                      {post.description}
                    </p>
                  )}

                  <div className="pt-4 mt-auto border-t border-gray-50 flex items-center text-sm font-medium text-gray-900">
                    Read Article{" "}
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
