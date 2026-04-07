'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

const categories = [
  { name: 'Cameras', icon: '📷', desc: 'DSLR, mirrorless & action cameras', count: 'View All' },
  { name: 'Laptops', icon: '💻', desc: 'Work, gaming & ultrabooks', count: 'View All' },
  { name: 'Speakers', icon: '🔊', desc: 'Portable, home & studio audio', count: 'View All' },
  { name: 'Smartphones', icon: '📱', desc: 'Android, iOS & accessories', count: 'View All' },
  { name: 'Accessories', icon: '🎧', desc: 'Cables, cases & peripherals', count: 'View All' },
  { name: 'Wearables', icon: '⌚', desc: 'Smartwatches & fitness trackers', count: 'View All' },
];

const CatalogPage = () => {
  const t = useTranslations('catalog');
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <div className="bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 lg:px-16 py-20 relative text-center">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-3">
            {t('heroLabel')}
          </p>
          <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">
            {t('heroTitle')} <span className="text-amber-400">{t('heroHighlight')}</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">{t('heroDesc')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-16 py-12">
        {/* Coming soon notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 mb-10">
          <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-amber-800 font-semibold text-sm">{t('comingSoonTitle')}</p>
            <p className="text-amber-700 text-sm mt-0.5">
              {t('comingSoonDesc')}{' '}
              <Link
                href="/products"
                className="underline font-semibold hover:text-amber-900 transition-colors"
              >
                {t('productsPage')}
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link key={cat.name} href="/products">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md hover:border-amber-200 transition-all group cursor-pointer">
                <div className="text-4xl mb-4">{cat.icon}</div>
                <h3 className="text-slate-900 font-bold text-lg mb-1 group-hover:text-amber-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-slate-500 text-sm mb-4">{cat.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-amber-500 text-sm font-semibold">
                  {t('viewAll')}
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-md shadow-amber-500/30"
          >
            {t('viewAllProducts')}
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
  );
};

export default CatalogPage;
