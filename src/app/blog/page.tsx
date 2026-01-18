import { getBlogPosts } from "@/lib/blog";
import { CardGlass } from "@/components/ui/card";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import NextImage from "next/image";

export default async function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Blog</h1>
          <p className="text-lg text-text-secondary">
            Thoughts, notes, and technical deep dives.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted">No posts found in /public/blog</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <CardGlass className="group h-full flex flex-col hover:scale-[1.02] transition-all duration-medium overflow-hidden">
                  {post.image && (
                    <div className="aspect-video relative overflow-hidden ring-1 ring-white/10">
                      <NextImage
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-long"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
                      <Calendar size={14} />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-text-primary group-hover:text-accent-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-text-secondary text-sm line-clamp-3 mb-6 flex-grow">
                      {post.content.slice(0, 150)}...
                    </p>
                    <div className="flex items-center text-sm font-semibold text-accent-primary group-hover:gap-2 transition-all">
                      Read More <ArrowRight size={16} className="ml-1" />
                    </div>
                  </div>
                </CardGlass>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
