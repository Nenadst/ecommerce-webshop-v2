'use client';

import React from 'react';
import { TESTIMONI } from '@/data/testimoni';
import { useTranslations } from 'next-intl';

const Testimoni = () => {
  const t = useTranslations('homepage');
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-2">
          {t('testimonialLabel')}
        </p>
        <h2 className="text-slate-900 text-2xl md:text-3xl font-bold">{t('testimonials')}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {TESTIMONI.map((testimoni, index) => (
          <div
            key={index}
            className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          >
            {/* Opening quote */}
            <div className="text-amber-400 text-5xl font-serif leading-none mb-3 select-none">
              &ldquo;
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">{testimoni.description}</p>
            {/* Author row */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400 flex-shrink-0">
                <img
                  className="w-full h-full object-cover"
                  src={testimoni.image}
                  alt={testimoni.name}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-slate-800 text-sm font-semibold truncate">
                  {testimoni.name}
                </div>
                <div className="text-slate-400 text-xs">{t('verifiedBuyer')}</div>
              </div>
              <div className="text-amber-400 text-xs font-semibold flex-shrink-0">★★★★★</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimoni;
