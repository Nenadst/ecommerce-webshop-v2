'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

const values = [
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    titleKey: 'v5Title',
    descKey: 'v5Desc',
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
        />
      </svg>
    ),
    titleKey: 'v6Title',
    descKey: 'v6Desc',
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
    ),
    titleKey: 'v7Title',
    descKey: 'v7Desc',
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        />
      </svg>
    ),
    titleKey: 'v8Title',
    descKey: 'v8Desc',
  },
];

const AboutUsPage = () => {
  const t = useTranslations('aboutUs');
  const valuesTranslated = values.map((v) => ({
    ...v,
    title: t(v.titleKey as 'v5Title' | 'v6Title' | 'v7Title' | 'v8Title'),
    desc: t(v.descKey as 'v5Desc' | 'v6Desc' | 'v7Desc' | 'v8Desc'),
  }));
  const stats = [
    { value: '10K+', label: t('statsHappyCustomers') },
    { value: '5K+', label: t('statsProducts') },
    { value: '99%', label: t('statsSatisfaction') },
    { value: '24/7', label: t('statsSupport') },
  ];
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <div className="bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 lg:px-16 py-20 relative">
          <div className="max-w-2xl">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-3">
              {t('heroLabel')}
            </p>
            <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight mb-4">
              {t('heroTitle')} <span className="text-amber-400">{t('heroHighlight')}</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">{t('heroDesc')}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 lg:px-16 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-sm"
            >
              <div className="text-3xl font-bold text-amber-500 mb-1">{stat.value}</div>
              <div className="text-slate-500 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Story */}
      <div className="container mx-auto px-4 lg:px-16 py-16">
        <div className="bg-white rounded-3xl border border-slate-100 p-8 md:p-12">
          <div className="max-w-3xl">
            <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-3">
              {t('storyLabel')}
            </p>
            <h2 className="text-slate-900 text-3xl font-bold mb-6">{t('storyHeadline')}</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>{t('storyP1')}</p>
              <p>{t('storyP2')}</p>
              <p>{t('storyP3')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="container mx-auto px-4 lg:px-16 pb-16">
        <div className="text-center mb-10">
          <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-2">
            {t('whyChooseLabel')}
          </p>
          <h2 className="text-slate-900 text-3xl font-bold">{t('whyChooseTitle')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {valuesTranslated.map((v) => (
            <div
              key={v.title}
              className="bg-white rounded-2xl border border-slate-100 p-6 flex gap-5 hover:border-amber-200 hover:shadow-sm transition-all"
            >
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 flex-shrink-0">
                {v.icon}
              </div>
              <div>
                <h3 className="text-slate-900 font-bold mb-1">{v.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
