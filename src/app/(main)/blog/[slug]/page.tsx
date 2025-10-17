import BlogDetail from "@/components/blog/BlogDetail";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  return <BlogDetail slug={slug} />;
}
