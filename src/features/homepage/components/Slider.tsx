'use client';

import Link from 'next/link';
import React from 'react';

const Slider = () => {
  return (
    <section className="container mx-auto px-4 py-8 md:py-12">
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden min-h-[400px] md:min-h-[520px]">
        {/* Background glow accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center justify-between h-full p-8 md:p-14 gap-8">
          {/* Left Content */}
          <div className="flex-1 z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-amber-500/30">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              New Arrival 2025
            </div>
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Capture Every
              <br />
              <span className="text-amber-400">Moment</span>
              <br />
              Perfectly
            </h1>
            <p className="text-slate-400 text-base md:text-lg mb-8 max-w-sm mx-auto md:mx-0">
              Professional DSLR cameras with exceptional clarity and performance for every
              photographer.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-4 mb-10">
              <Link href="/products">
                <button className="w-40 h-12 bg-amber-500 text-white text-base font-semibold rounded-2xl hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/30">
                  Shop Now
                </button>
              </Link>
              <Link href="/products">
                <button className="w-40 h-12 border border-slate-600 text-slate-300 text-base font-medium rounded-2xl hover:bg-slate-700 hover:border-slate-500 transition-colors">
                  Explore All
                </button>
              </Link>
            </div>
            {/* Trust stats */}
            <div className="flex justify-center md:justify-start items-center gap-6 md:gap-8">
              <div className="text-center md:text-left">
                <div className="text-white text-2xl font-bold">10K+</div>
                <div className="text-slate-400 text-xs">Happy Customers</div>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div className="text-center md:text-left">
                <div className="text-white text-2xl font-bold">500+</div>
                <div className="text-slate-400 text-xs">Products</div>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div className="text-center md:text-left">
                <div className="text-white text-2xl font-bold">4.9★</div>
                <div className="text-slate-400 text-xs">Avg Rating</div>
              </div>
            </div>
          </div>

          {/* Right — Product image */}
          <div className="flex-1 flex justify-center items-center relative">
            <div className="absolute w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            <img
              className="relative w-full max-w-[240px] md:max-w-[360px] lg:max-w-[440px] drop-shadow-2xl"
              src="/assets/img/8-1.png"
              alt="Canon camera"
            />
            {/* Price badge */}
            <div className="absolute top-4 right-4 bg-amber-500 text-white rounded-2xl px-5 py-3 text-center shadow-xl shadow-amber-500/40">
              <div className="text-xs font-medium opacity-80 mb-0.5">Starting from</div>
              <div className="text-2xl font-bold">$89</div>
            </div>
          </div>
        </div>

        {/* Slider indicator dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-14 md:translate-x-0 flex items-center gap-2">
          <div className="w-8 h-2 bg-amber-500 rounded-full" />
          <div className="w-2 h-2 bg-slate-600 rounded-full hover:bg-amber-500 cursor-pointer transition-colors" />
          <div className="w-2 h-2 bg-slate-600 rounded-full hover:bg-amber-500 cursor-pointer transition-colors" />
        </div>
      </div>
    </section>
  );
};

export default Slider;
