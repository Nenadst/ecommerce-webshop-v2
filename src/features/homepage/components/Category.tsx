'use client';

import { Link } from '@/i18n/navigation';
import React from 'react';
import { useTranslations } from 'next-intl';

const Category = () => {
  const t = useTranslations('homepage');
  const tFooter = useTranslations('footer');

  const categories = [
    {
      name: tFooter('speakers'),
      count: 6,
      image: '/assets/img/2-1.png',
      bg: 'bg-sky-50',
      accent: 'text-sky-600',
    },
    {
      name: tFooter('laptops'),
      count: 12,
      image: '/assets/img/5-1.png',
      bg: 'bg-slate-50',
      accent: 'text-slate-600',
    },
    {
      name: tFooter('cameras'),
      count: 8,
      image: '/assets/img/8-1.png',
      bg: 'bg-amber-50',
      accent: 'text-amber-600',
    },
  ];
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-slate-900 text-2xl md:text-3xl font-bold">{t('shopByCategory')}</h2>
        <Link
          href="/products"
          className="text-amber-500 text-sm font-semibold hover:text-amber-600 transition-colors"
        >
          {t('viewAll2')}
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {categories.map((cat) => (
          <Link href="/products" key={cat.name}>
            <div
              className={`${cat.bg} rounded-2xl p-6 flex items-center gap-5 cursor-pointer group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-slate-100`}
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-sm flex items-center justify-center">
                <img src={cat.image} alt={cat.name} className="w-16 h-16 object-contain" />
              </div>
              <div>
                <h3 className="text-slate-800 text-lg font-bold group-hover:text-amber-500 transition-colors">
                  {cat.name}
                </h3>
                <p className={`${cat.accent} text-sm font-medium`}>
                  {cat.count} {t('products')}
                </p>
                <div className="mt-2 text-amber-500 text-sm font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {t('explore')} <span>→</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Category;
