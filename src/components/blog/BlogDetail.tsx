import Image from "next/image";
import Link from "next/link";
import type { BlogItem, Author } from "@/types/transformerTypes";

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
  authors?: Author[];
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

      {/* Author Section - UPDATED to show multiple authors with images */}
      {authors && authors.length > 0 && (
        <div className="flex items-center gap-6 mb-6">
          <div className="flex -space-x-2">
            {authors.slice(0, 3).map((author, idx) => (
              <Link
                key={author._id || idx}
                href={`/authors/${author._id}`}
                className="relative"
              >
                {author.image ? (
                  <Image
                    src={author.image}
                    alt={author.name}
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-white hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-white text-white font-semibold text-sm">
                    {author.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            ))}
          </div>
          <div>
            <div className="text-sm text-gray-600">
              By{" "}
              {authors.map((author, idx) => (
                <span key={author._id || idx}>
                  <Link
                    href={`/authors/${author._id}`}
                    className="text-purple-600 hover:underline font-medium"
                  >
                    {author.name}
                  </Link>
                  {idx < authors.length - 1 && ", "}
                </span>
              ))}
            </div>
            <div className="text-xs text-gray-500">
              {createdAt
                ? new Date(createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : ""}
            </div>
          </div>
        </div>
      )}

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

      {/* Author Bio Section - NEW */}
      {authors && authors.length > 0 && (
        <div className="mt-12 pt-8 border-t">
          <h3 className="text-2xl font-bold mb-6">
            About the Author{authors.length > 1 ? "s" : ""}
          </h3>
          <div className="space-y-6">
            {authors.map((author) => (
              <div key={author._id} className="flex gap-4">
                <Link href={`/authors/${author._id}`}>
                  {author.image ? (
                    <Image
                      src={author.image}
                      alt={author.name}
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl">
                      {author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                <div className="flex-1">
                  <Link href={`/authors/${author._id}`}>
                    <h4 className="text-lg font-semibold hover:text-purple-600">
                      {author.name}
                    </h4>
                  </Link>
                  {author.education && (
                    <p className="text-sm text-gray-600">{author.education}</p>
                  )}
                  {author.description && (
                    <p className="text-sm text-gray-700 mt-2">
                      {author.description}
                    </p>
                  )}
                  {/* Social Links */}
                  <div className="flex gap-3 mt-3">
                    {author.instagram && (
                      <a
                        href={author.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700"
                        aria-label="Instagram"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                    )}
                    {author.linkedin && (
                      <a
                        href={author.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                        aria-label="LinkedIn"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
