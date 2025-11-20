"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

type Post = {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  content?: string;
  createdAt: string;
};

export default function SubmenuPostsPage() {
  const params = useParams();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [submenuName, setSubmenuName] = useState("");
  const [loading, setLoading] = useState(true);

  const submenuId = params.submenuId as string;
  const menuId = params.menuId as string;
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (!submenuId) return;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${base}/api/posts?menu=${menuId}&submenu=${submenuId}`
        );
        setPosts(Array.isArray(data) ? data : data?.data || []);
        if (data && data.length > 0 && data[0].submenu) {
          setSubmenuName(data[0].submenu);
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
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      {/* Back Button */}
      <Link
        href="/menu"
        className="inline-flex items-center gap-2 text-primary hover:underline mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Menus
      </Link>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{submenuName}</h1>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No posts available.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post._id} href={`/blog/${post._id}`} className="group">
              <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary transition-all">
                {/* Thumbnail */}
                {post.thumbnail && (
                  <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                    <Image
                      src={post.thumbnail || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  {post.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {post.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
                      Read More →
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
