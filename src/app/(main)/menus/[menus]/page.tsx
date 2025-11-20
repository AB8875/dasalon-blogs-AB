// ✅ path: src/app/(main)/menus/[menus]/page.tsx
import { notFound } from "next/navigation";

interface MenuPageProps {
  params: Promise<{ menus: string }>;
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { menus } = await params;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/blogs?category=${menus}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return notFound();
    }

    const blogs = await res.json();

    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold mb-6 capitalize">
          Menu: {menus}
        </h1>

        {blogs.length === 0 ? (
          <p className="text-gray-500">No blogs found in this menu.</p>
        ) : (
          <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
            {blogs.map((blog: any) => (
              <div
                key={blog._id}
                className="border rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <img
                  src={blog.thumbnail || "/placeholder.jpg"}
                  alt={blog.title}
                  className="rounded-lg mb-4 w-full h-48 object-cover"
                />
                <h2 className="text-lg font-semibold">{blog.title}</h2>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {blog.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (err) {
    console.error("Error fetching menu:", err);
    return notFound();
  }
}
