import React from 'react';
import SearchSection from './SearchSection';
import CartSection from '@/shared/components/layouts/CartSection';
import Navigation from '@/shared/components/layouts/Navigation';
import { Link } from '@/i18n/navigation';

const HeaderBottom = () => {
  return (
    <div className="sticky top-0 z-[60] w-full">
      <div className="w-full h-[80px] bg-slate-900 flex items-center px-4 md:px-8 lg:px-16 border-b border-slate-800/60">
        <Link href="/" className="cursor-pointer flex items-center group flex-shrink-0">
          <div className="flex items-center gap-2 transition-transform duration-300 group-hover:scale-105">
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
            <span className="text-white font-bold text-xl tracking-tight">
              Web<span className="text-amber-500">Shop</span>
            </span>
          </div>
        </Link>
        <div className="flex-1 flex justify-center">
          <SearchSection />
        </div>
        <CartSection />
      </div>
      <Navigation />
    </div>
  );
};

export default HeaderBottom;
