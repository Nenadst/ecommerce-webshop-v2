import React from 'react';
import Link from 'next/link';

const placeholderPosts = [
  {
    id: 1,
    category: 'Tech Tips',
    title: 'Top 5 Laptops for Professionals in 2025',
    excerpt:
      'Whether you work remotely or in the office, the right laptop makes all the difference. We break down the top picks for productivity and performance.',
    date: 'Coming Soon',
    readTime: '5 min read',
  },
  {
    id: 2,
    category: 'Cameras',
    title: 'Mirrorless vs DSLR: Which Should You Buy?',
    excerpt:
      'The camera market has shifted dramatically. We compare the two formats head-to-head so you can make the best choice for your photography style.',
    date: 'Coming Soon',
    readTime: '7 min read',
  },
  {
    id: 3,
    category: 'Audio',
    title: 'Best Wireless Speakers Under €200',
    excerpt:
      'Premium sound does not have to cost a fortune. Our experts tested over 20 speakers to find the best value options for every listening environment.',
    date: 'Coming Soon',
    readTime: '4 min read',
  },
  {
    id: 4,
    category: 'Smartphones',
    title: 'How to Choose the Right Smartphone in 2025',
    excerpt:
      'With hundreds of models available, picking the right phone is overwhelming. We simplify the decision with a clear buying guide for every budget.',
    date: 'Coming Soon',
    readTime: '6 min read',
  },
  {
    id: 5,
    category: 'Accessories',
    title: 'Must-Have Accessories for Your Home Office',
    excerpt:
      'From ergonomic keyboards to cable management solutions — these accessories will transform your workspace and boost your daily productivity.',
    date: 'Coming Soon',
    readTime: '5 min read',
  },
  {
    id: 6,
    category: 'Deals',
    title: 'How to Get the Best Deals on Electronics',
    excerpt:
      'Timing is everything when shopping for tech. Learn the seasonal patterns, price-tracking tools, and insider tips to never overpay again.',
    date: 'Coming Soon',
    readTime: '4 min read',
  },
];

const categoryColors: Record<string, string> = {
  'Tech Tips': 'bg-blue-50 text-blue-600 border-blue-100',
  Cameras: 'bg-purple-50 text-purple-600 border-purple-100',
  Audio: 'bg-green-50 text-green-600 border-green-100',
  Smartphones: 'bg-orange-50 text-orange-600 border-orange-100',
  Accessories: 'bg-pink-50 text-pink-600 border-pink-100',
  Deals: 'bg-amber-50 text-amber-600 border-amber-100',
};

const BlogPage = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <div className="bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 lg:px-16 py-20 relative text-center">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Our Blog
          </p>
          <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">
            News, Tips &amp; <span className="text-amber-400">Insights</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Stay up to date with the latest in tech — buying guides, product reviews, and expert
            tips from our team.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/25 text-amber-400 text-sm font-medium px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Articles coming soon — stay tuned!
          </div>
        </div>
      </div>

      {/* Posts grid */}
      <div className="container mx-auto px-4 lg:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {placeholderPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md hover:border-slate-200 transition-all group"
            >
              {/* Placeholder image area */}
              <div className="h-44 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
                <svg
                  className="w-12 h-12 text-slate-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent" />
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${categoryColors[post.category] || 'bg-slate-50 text-slate-500 border-slate-100'}`}
                  >
                    {post.category}
                  </span>
                  <span className="text-xs text-slate-400">{post.readTime}</span>
                </div>
                <h3 className="text-slate-900 font-bold text-base leading-snug mb-2 group-hover:text-amber-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{post.date}</span>
                  <span className="text-xs font-semibold text-amber-500 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-12 bg-slate-900 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/10 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-2">
              Stay Notified
            </p>
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-3">Be the First to Read</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Subscribe to our newsletter and get notified when new articles are published.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-md shadow-amber-500/30"
            >
              Go to Homepage
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
