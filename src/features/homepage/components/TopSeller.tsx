'use client';

import Star from '@/shared/components/elements/Star';
import { ShoppingCartIcon, EyeIcon } from '@/shared/components/icons';
import React from 'react';
import { useTranslations } from 'next-intl';

const TopSeller = () => {
  const t = useTranslations('homepage');

  const sideProducts = [
    {
      title: t('gamingSetup'),
      price: '$299.00',
      image: '/assets/img/ps4c.png',
    },
    {
      title: t('premiumLaptop'),
      price: '$899.00',
      image: '/assets/img/5-1.png',
    },
  ];

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-1">
            {t('trendingNow')}
          </p>
          <h2 className="text-slate-900 text-2xl md:text-3xl font-bold">{t('topSellers')}</h2>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Main featured product card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 flex-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Product image with glow */}
          <div className="relative z-10 flex-shrink-0 flex items-center justify-center">
            <div className="absolute w-44 h-44 bg-amber-500/20 rounded-full blur-2xl" />
            <img
              className="relative w-44 md:w-56 drop-shadow-2xl"
              src="/assets/img/jbl-bar.png"
              alt="JBL bar"
            />
          </div>

          {/* Product details */}
          <div className="relative z-10 flex-1 text-center md:text-left">
            <div className="inline-flex px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full mb-4 border border-amber-500/30">
              {t('bestSeller')}
            </div>
            <h3 className="text-white text-xl md:text-2xl font-bold mb-1">{t('jblBarName')}</h3>
            <p className="text-slate-400 text-sm mb-3">{t('jblBarDesc')}</p>
            <div className="text-amber-400 text-2xl font-bold mb-2">$11.70</div>
            <div className="mb-5">
              <Star count={5} />
            </div>

            {/* Countdown */}
            <div className="flex justify-center md:justify-start gap-3 mb-7">
              {[
                { v: '57', l: t('days') },
                { v: '11', l: t('hrs') },
                { v: '33', l: t('min') },
                { v: '59', l: t('sec') },
              ].map(({ v, l }) => (
                <div
                  key={l}
                  className="bg-slate-700/60 backdrop-blur-sm rounded-xl px-3 py-2 text-center min-w-[54px] border border-slate-600/50"
                >
                  <div className="text-amber-400 text-xl font-bold">{v}</div>
                  <div className="text-slate-400 text-xs">{l}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-center md:justify-start items-center gap-3">
              <button className="flex items-center gap-2 px-6 h-11 bg-amber-500 text-white font-semibold rounded-2xl hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/30">
                <div className="w-5 h-5">
                  <ShoppingCartIcon />
                </div>
                {t('addToCart')}
              </button>
              <button className="w-11 h-11 bg-slate-700 hover:bg-slate-600 transition-colors rounded-2xl flex items-center justify-center text-white">
                <div className="w-5 h-5">
                  <EyeIcon />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Side product cards */}
        <div className="flex flex-col gap-4 lg:w-80">
          {sideProducts.map((item) => (
            <div
              key={item.title}
              className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-5 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-slate-800 font-semibold mb-1 group-hover:text-amber-500 transition-colors truncate">
                  {item.title}
                </h4>
                <div className="mb-2">
                  <Star count={5} />
                </div>
                <div className="text-slate-900 font-bold">{item.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopSeller;
