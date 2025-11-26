import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Author, BlogPost } from "@/types/transformerTypes";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getAuthor(id: string): Promise<Author | null> {
  try {
    const res = await fetch(`${apiUrl}/api/authors/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching author:", error);
    return null;
  }
}

async function getAuthorBlogs(id: string): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${apiUrl}/api/authors/${id}/blogs`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching author blogs:", error);
    return [];
  }
}

export default async function AuthorProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const author = await getAuthor(params.id);
  if (!author) notFound();

  const blogs = await getAuthorBlogs(params.id);

  return (
    <div className="max-w-[1344px] mx-auto py-10 px-4 md:px-8">
      {/* Author Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="flex-shrink-0">
          {author.image ? (
            <Image
              src={author.image}
              alt={author.name}
              width={200}
              height={200}
              className="rounded-full"
            />
          ) : (
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-6xl">
              {author.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2">{author.name}</h1>
          {author.education && (
            <p className="text-lg text-gray-600 mb-4">{author.education}</p>
          )}
          {author.address && (
            <p className="text-sm text-gray-500 mb-4">📍 {author.address}</p>
          )}
          {author.description && (
            <p className="text-gray-700 leading-relaxed mb-6">
              {author.description}
            </p>
          )}

          {/* Social Links */}
          <div className="flex gap-4">
            {author.instagram && (
              <a
                href={author.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Instagram
              </a>
            )}
            {author.linkedin && (
              <a
                href={author.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:shadow-lg transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Author's Blog Posts */}
      <div>
        <h2 className="text-3xl font-bold mb-6">
          Articles by {author.name} ({blogs.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link
              key={blog.slug}
              href={`/blog/${blog.slug}`}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden">
                {blog.thumbnail?.url && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={blog.thumbnail.url}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-600 transition">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {blog.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
