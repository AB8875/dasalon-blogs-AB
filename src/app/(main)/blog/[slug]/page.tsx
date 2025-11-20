import BlogDetail from "@/components/blog/BlogDetail";
import { fetchBlogByIdServerSide } from "@/utils/getBlog";
import { notFound } from "next/navigation";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;

  const blogData = await fetchBlogByIdServerSide(slug);

  if (!blogData || !blogData.data || blogData.data.length === 0) {
    notFound();
  }

  return <BlogDetail blog={blogData.data[0]} />;
}
