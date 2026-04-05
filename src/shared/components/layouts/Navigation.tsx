'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { CategoriesDropdown } from '../navigation/CategoriesDropdown';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/blog', label: 'Blog' },
  { href: '/about-us', label: 'About Us' },
];

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="w-full bg-white border-b border-slate-100 shadow-sm">
        <div className="flex justify-between items-center h-14 px-4 md:px-8 lg:px-16">
          {/* Desktop nav */}
          <div className="hidden lg:flex items-center">
            <CategoriesDropdown />
            <div className="w-px h-6 bg-slate-200 mx-5" />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 h-14 flex items-center text-slate-600 font-medium text-sm hover:text-amber-500 transition-colors group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* 24/7 Support badge */}
          <div className="hidden lg:flex items-center gap-2 text-slate-500 text-sm font-medium">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            24/7 Support
          </div>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[136px] bg-white z-[70] overflow-y-auto shadow-2xl">
          <div className="flex flex-col py-2">
            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-6 py-4 text-slate-700 font-medium border-b border-slate-50 hover:bg-amber-50 hover:text-amber-600 transition-colors"
            >
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
              Browse Categories
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-6 py-4 text-slate-700 font-medium border-b border-slate-50 hover:bg-amber-50 hover:text-amber-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 px-6 py-4 text-slate-500 text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              24/7 Support
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
