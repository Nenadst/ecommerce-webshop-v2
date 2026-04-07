'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { GoogleIcon, FacebookIcon, ChatIcon } from '../icons';
import { useTranslations } from 'next-intl';

const socialLinks = [
  { icon: <GoogleIcon />, href: '#', label: 'Google' },
  { icon: <FacebookIcon />, href: '#', label: 'Facebook' },
  { icon: <ChatIcon />, href: '#', label: 'Chat' },
];

const FooterMenu = () => {
  const t = useTranslations('footer');
  const tNav = useTranslations('navigation');

  const footerLinks = [
    {
      title: tNav('allProducts'),
      links: [
        { label: t('cameras'), href: '/products' },
        { label: t('laptops'), href: '/products' },
        { label: t('speakers'), href: '/products' },
        { label: t('smartPhones'), href: '/products' },
        { label: t('accessories'), href: '/products' },
      ],
    },
    {
      title: t('support'),
      links: [
        { label: tNav('aboutUs'), href: '/about-us' },
        { label: t('contactUs'), href: '#' },
        { label: t('returnPolicy'), href: '#' },
        { label: t('privacyPolicy'), href: '#' },
        { label: t('paymentPolicy'), href: '#' },
      ],
    },
    {
      title: t('company'),
      links: [
        { label: tNav('blog'), href: '/blog' },
        { label: t('services'), href: '#' },
        { label: t('ourPolicy'), href: '#' },
        { label: t('customerCare'), href: '#' },
        { label: t('faqs'), href: '#' },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-16">
      {/* Main footer grid */}
      <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
        {/* Brand column */}
        <div className="flex flex-col gap-6">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight opacity-80 group-hover:opacity-100 transition-opacity">
              Web<span className="text-amber-500">Shop</span>
            </span>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed">{t('tagline')}</p>
          <div className="text-slate-500 text-sm leading-relaxed">
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>
                64 St James Boulevard
                <br />
                Hoswick, ZE2 7ZJ
              </span>
            </div>
          </div>
          {/* Social icons */}
          <div className="flex items-center gap-3">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-9 h-9 bg-slate-800 hover:bg-amber-500 rounded-full flex items-center justify-center text-white hover:text-white transition-all duration-200 border border-slate-700 hover:border-amber-500"
              >
                <span className="flex items-center justify-center">{s.icon}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {footerLinks.map((col) => (
          <div key={col.title} className="flex flex-col gap-5">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">{col.title}</h4>
            <div className="w-8 h-0.5 bg-amber-500 rounded-full" />
            <ul className="flex flex-col gap-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-400 text-sm hover:text-amber-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-slate-600 group-hover:bg-amber-400 rounded-full transition-colors flex-shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-500 text-sm">
          {t('allRightsReserved', { year: new Date().getFullYear() })}
        </p>
        <div className="flex items-center gap-4 text-slate-600 text-xs">
          <Link href="#" className="hover:text-slate-400 transition-colors">
            {t('privacyPolicy')}
          </Link>
          <span>·</span>
          <Link href="#" className="hover:text-slate-400 transition-colors">
            {t('termsOfService')}
          </Link>
          <span>·</span>
          <Link href="#" className="hover:text-slate-400 transition-colors">
            {t('cookies')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FooterMenu;
