import { getBlogPostBySlug } from "@/lib/blog";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import { Calendar, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import NextImage from "next/image";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button asChild variant="ghost" className="mb-8 -ml-4 hover:bg-white/5">
          <Link href="/blog" className="flex items-center gap-2">
            <ChevronLeft size={20} />
            Back to Blog
          </Link>
        </Button>

        <article className="animate-fade-in-up">
          {post.image && (
            <div className="aspect-video w-full relative rounded-2xl overflow-hidden mb-12 ring-1 ring-white/10 shadow-2xl">
              <NextImage
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </div>
          )}

          <div className="flex items-center gap-2 text-text-muted mb-4">
            <Calendar size={18} />
            {new Date(post.date).toLocaleDateString()}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-12 tracking-tight text-gradient-primary">
            {post.title}
          </h1>

          <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-accent-primary prose-img:rounded-2xl prose-pre:bg-bg-layer-2 prose-pre:border prose-pre:border-border-subtle">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}
