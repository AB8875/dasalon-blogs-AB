import BlogDetail from "@/components/blog/BlogDetail";

interface BlogPageProps {
  params: {
    slug: string;
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = params;

  // Fetch blog data here or pass to component
  return <BlogDetail slug={slug} />;
}
