import BlogDetail from "@/components/blog/BlogDetail";

export default function BlogPage({ params }: { params: { slug: string } }) {
  return <BlogDetail slug={params.slug} />;
}
