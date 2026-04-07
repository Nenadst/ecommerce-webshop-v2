'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

const filters = ['All', 'Cameras', 'Laptops', 'Tablets', 'Speakers'];

const PopularProduct = () => {
  const t = useTranslations('homepage');
  const [active, setActive] = useState('All');

  return (
    <section className="container mx-auto px-4 py-4 mt-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-1">
            {t('ourCollection')}
          </p>
          <h2 className="text-slate-900 text-2xl md:text-3xl font-bold">{t('popularProducts')}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActive(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                active === filter
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularProduct;
