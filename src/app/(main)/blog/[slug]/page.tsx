import BlogDetail from "@/components/blog/BlogDetail";
import { fetchBlogByIdServerSide } from "@/utils/getBlog";
import { notFound } from "next/navigation";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;

  const blogData = await fetchBlogByIdServerSide(slug);

  const blogs = Array.isArray(blogData) ? blogData : blogData?.data;

  if (!blogs || blogs.length === 0) {
    notFound();
  }

  return <BlogDetail blog={blogs[0]} />;
}
