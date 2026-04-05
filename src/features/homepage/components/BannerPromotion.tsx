import Link from 'next/link';
import React from 'react';

const BannerPromotion = () => {
  return (
    <section className="container mx-auto px-4 py-6">
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden min-h-[260px] md:min-h-[320px] flex items-center">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center w-full gap-8 p-8 md:p-14">
          {/* Text content */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-amber-500/30">
              ⚡ LIMITED TIME OFFER
            </div>
            <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
              Sale Up to <span className="text-amber-400">50% Off</span>
            </h2>
            <p className="text-slate-400 text-base md:text-lg mb-7">
              Latest laptops with 12-inch HD display. Don&apos;t miss this incredible deal!
            </p>
            <Link href="/products">
              <button className="px-8 py-3 bg-amber-500 text-white font-semibold rounded-full hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/30">
                Shop the Sale →
              </button>
            </Link>
          </div>

          {/* Product image */}
          <div className="flex-shrink-0 relative">
            <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-2xl" />
            <img
              className="relative w-52 md:w-72 object-contain drop-shadow-2xl rounded-2xl"
              src="/assets/img/pexels-nao-triponez-129208-1.png"
              alt="Laptop promotion"
            />
            <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              -50%
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerPromotion;
