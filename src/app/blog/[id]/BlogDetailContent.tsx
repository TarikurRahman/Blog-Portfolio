'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, ThumbsUp, MessageSquare, ArrowLeft, Send, Lock, Eye, Share2 } from 'lucide-react';
import { BlogPost, Comment } from '@/data/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { BlogDetailSkeleton } from '@/components/skeletons/PageSkeletons';
import BlogCard from '@/components/BlogCard';
import OptimizedImage from '@/components/OptimizedImage';
import BlogChallengeCTA from '@/components/blog/BlogChallengeCTA';

export default function BlogDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // States to handle likes dynamically
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (id) {
      const fetchBlogData = async () => {
        try {
          const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
          const blogRes = await fetch(isObjectId ? `/api/blogs/${id}` : `/api/blogs/slug/${id}`);
          if (blogRes.ok) {
            const blogJson = await blogRes.json();
            if (blogJson.success && blogJson.data) {
              const found = blogJson.data;
              setBlog(found);
              setLikesCount(found.likes);

              // Fetch Comments using the real database ID
              const commRes = await fetch(`/api/blogs/${found.id}/comments`);
              if (commRes.ok) {
                const commJson = await commRes.json();
                if (commJson.success && commJson.data) {
                  setComments(commJson.data);
                }
              }

              // Fetch Related posts
              const relatedRes = await fetch(`/api/blogs?category=${found.category}`);
              if (relatedRes.ok) {
                const relatedJson = await relatedRes.json();
                if (relatedJson.success && relatedJson.data && relatedJson.data.blogs) {
                  const related = relatedJson.data.blogs
                    .filter((b: BlogPost) => b.id !== found.id)
                    .slice(0, 2);
                  setRelatedPosts(related);
                }
              }
            }
          }
        } catch (err) {
          console.error('Failed to fetch blog details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchBlogData();
    }
  }, [id]);

  useEffect(() => {
    if (user && id) {
      setIsLiked(user.likedBlogs?.includes(id) || false);
    } else {
      setIsLiked(false);
    }
  }, [user, id]);

  const handleLike = async () => {
    if (!user) {
      showToast('Please sign in to like articles.', 'info');
      router.push('/login');
      return;
    }

    if (!blog) return;

    try {
      const res = await fetch(`/api/blogs/${blog.id}/like`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const liked = json.data.liked;
          setIsLiked(liked);
          setLikesCount(prev => liked ? prev + 1 : Math.max(0, prev - 1));
          refreshUser();
          showToast(liked ? 'Article liked!' : 'Article unliked.', 'success');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to toggle like.', 'error');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast('Please sign in to write comments.', 'info');
      router.push('/login');
      return;
    }

    if (!commentContent.trim()) {
      showToast('Comment cannot be empty.', 'error');
      return;
    }

    if (!blog) return;

    try {
      const res = await fetch(`/api/blogs/${blog.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentContent }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setComments(prev => [json.data, ...prev]);
          setCommentContent('');
          showToast('Comment posted successfully!', 'success');
        } else {
          showToast(json.message || 'Failed to post comment.', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to post comment.', 'error');
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl);
      showToast('Link copied to clipboard! Share it on social media.', 'success');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <BlogDetailSkeleton />
        <Footer />
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <Navbar />
        <main className="flex-grow pt-32 pb-20 flex flex-col items-center justify-center text-center px-6">
          <h2 className="text-2xl font-bold text-white mb-2">Article Not Found</h2>
          <p className="text-sm text-brand-text-muted mb-6">The article you are searching for could not be found.</p>
          <Link href="/blog">
            <Button variant="primary" size="md">
              Back to Blog
            </Button>
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-32 pb-20 relative min-h-screen">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[95px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 md:px-8 relative z-10">
          {/* Back button */}
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-semibold text-brand-accent hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Blog List
          </Link>

          {/* Main article image */}
          {blog.image && (
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-brand-border-white mb-8 shadow-2xl">
              <OptimizedImage
                src={blog.image}
                alt={blog.title}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover object-center"
              />
            </div>
          )}

          {/* Article Header info */}
          <div className="mb-8">
            <span className="px-3 py-1 bg-brand-accent/15 border border-brand-accent/25 rounded-full text-xs font-bold text-brand-accent uppercase tracking-wider mb-4 inline-block">
              {blog.category}
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug mb-6">
              {blog.title}
            </h1>

            {/* Author + meta info */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-y border-brand-border-white py-4">
              <div className="flex items-center gap-3">
                <img src={blog.author.avatar} alt={blog.author.name} className="w-10 h-10 rounded-full object-cover border border-brand-border-white" />
                <div>
                  <p className="text-sm font-bold text-white">{blog.author.name}</p>
                  <p className="text-[10px] text-brand-text-muted">{blog.author.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-brand-text-muted font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-accent" />
                  {blog.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-400" />
                  {blog.readTime}
                </span>
              </div>
            </div>
          </div>

          {/* Main article content details */}
          {user ? (
            <article className="prose prose-invert max-w-none text-xs md:text-sm text-brand-text-muted leading-relaxed space-y-6 mb-12">
              {blog.content.split('\n\n').map((para, idx) => {
                if (para.startsWith('###')) {
                  return (
                    <h3 key={idx} className="text-lg font-bold text-white pt-4 tracking-tight">
                      {para.replace('###', '').trim()}
                    </h3>
                  );
                }
                if (para.startsWith('```')) {
                  // simple render mock code blocks
                  const code = para.replace(/```[a-z]*/g, '').trim();
                  return (
                    <pre key={idx} className="p-4 bg-brand-card-dark border border-brand-border-white rounded-xl overflow-x-auto font-mono text-xs text-white">
                      <code>{code}</code>
                    </pre>
                  );
                }
                if (para.startsWith('-')) {
                  // simple bullet renders
                  const items = para.split('\n');
                  return (
                    <ul key={idx} className="list-disc list-inside pl-4 space-y-2">
                      {items.map((item, itemIdx) => (
                        <li key={itemIdx}>{item.replace('-', '').trim()}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={idx}>{para}</p>;
              })}
            </article>
          ) : (
            <div className="bg-brand-card border border-brand-border rounded-2xl p-8 md:p-12 shadow-2xl text-center relative overflow-hidden my-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="inline-flex p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-2xl text-brand-accent mb-6">
                <Lock className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-white tracking-tight mb-4">
                Unlock the Full Article
              </h3>
              <p className="text-xs md:text-sm text-brand-text-muted leading-relaxed max-w-md mx-auto mb-8">
                This article contains professional code snippets, configuration files, and deep-dive technical insights. Unlock it by signing in or creating a free account.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={`/login?redirect=/blog/${id}`}
                  className="w-full sm:w-auto px-8 py-3 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-xl transition-all duration-200 shadow-lg text-xs text-center"
                >
                  Sign In
                </Link>
                <Link
                  href={`/register?redirect=/blog/${id}`}
                  className="w-full sm:w-auto px-8 py-3 bg-brand-card-dark hover:bg-brand-border/20 border border-brand-border-white text-white font-semibold rounded-xl transition-all duration-200 text-xs text-center"
                >
                  Create Account
                </Link>
              </div>
            </div>
          )}

          {/* Blog Timed Challenge Option */}
          <BlogChallengeCTA blogSlug={blog.slug} />

          {/* Like & Share Interaction Actions */}
          <div className="flex items-center justify-between border-y border-brand-border-white py-4 mb-12">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer ${
                  isLiked
                    ? 'bg-brand-accent text-white border-brand-accent glow-accent-sm'
                    : 'bg-brand-card text-brand-text-muted border-brand-border-white hover:text-white hover:border-brand-accent'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                {isLiked ? 'Liked' : 'Like Post'} ({likesCount})
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl border bg-brand-card text-brand-text-muted border-brand-border-white hover:text-white hover:border-brand-accent transition-all duration-300 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                Share Post
              </button>
            </div>

            <div className="flex items-center gap-5">
              <span className="text-xs text-brand-text-muted font-medium flex items-center gap-1.5" title="Views">
                <Eye className="w-4 h-4 text-brand-accent" />
                {blog.views || 0} Views
              </span>
              <span className="text-xs text-brand-text-muted font-medium flex items-center gap-1.5" title="Comments">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                {comments.length} Comments
              </span>
            </div>
          </div>

          {/* Comments Section */}
          <section className="mb-16">
            <h3 className="text-lg font-bold text-white mb-6 border-l-3 border-brand-accent pl-3">
              Discussion
            </h3>

            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="space-y-4 mb-8">
                {comments.map((comment) => (
                  <Card hoverEffect={false} key={comment.id} className="p-4 border border-brand-border-white bg-brand-card-dark/30">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={comment.userAvatar}
                          alt={comment.userName}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';
                          }}
                          className="w-7 h-7 rounded-full object-cover border border-brand-border-white"
                        />
                        <div>
                          <span className="text-xs font-bold text-white">{comment.userName}</span>
                          <span className="text-[8px] text-brand-text-muted block mt-0.5">{new Date(comment.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-white/90 leading-relaxed pl-9">{comment.content}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-xs text-brand-text-muted italic mb-8">No comments have been posted yet. Be the first to share your thoughts!</p>
            )}

            {/* Add Comment Card */}
            {user ? (
              <Card hoverEffect={false} className="p-5 border border-brand-border bg-brand-card-dark">
                <h4 className="text-xs font-bold text-white mb-4">Leave a Comment</h4>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <textarea
                    placeholder="Write your constructive thoughts or queries here..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 text-xs bg-brand-bg border border-brand-border-white rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all resize-none"
                    required
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-brand-text-muted">
                      Commenting as <span className="font-bold text-brand-accent">{user.name}</span>
                    </span>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      rightIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Post Comment
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card hoverEffect={false} className="p-6 border border-brand-border-white bg-brand-card-dark/40 text-center flex flex-col items-center">
                <Lock className="w-8 h-8 text-brand-accent mb-3" />
                <h4 className="text-sm font-bold text-white mb-2">Login Required to Discuss</h4>
                <p className="text-xs text-brand-text-muted mb-5 max-w-sm leading-relaxed">
                  Join Tarikur's creative community to comment on technical posts, save articles, and access your dashboard settings.
                </p>
                <div className="flex items-center gap-3">
                  <Link href="/login">
                    <Button variant="secondary" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">Register</Button>
                  </Link>
                </div>
              </Card>
            )}
          </section>

          {/* Related Articles Section */}
          {relatedPosts.length > 0 && (
            <section className="border-t border-brand-border-white pt-12">
              <h3 className="text-lg font-bold text-white mb-6">
                Related Articles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map((related) => (
                  <div key={related.id}>
                    <BlogCard blog={related} />
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
