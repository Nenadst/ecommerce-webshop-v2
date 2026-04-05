import React from 'react';
import { PARTNERS } from '@/data/partners';

const Partner = () => {
  return (
    <section className="container mx-auto px-4 py-8 mb-4">
      <div className="text-center mb-6">
        <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">
          Trusted by leading brands worldwide
        </p>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16 bg-slate-50 rounded-2xl p-8 md:p-10">
        {PARTNERS.map((partner, index) => (
          <a
            key={index}
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all duration-300 hover:-translate-y-1 hover:scale-110 opacity-50 hover:opacity-100 grayscale hover:grayscale-0"
          >
            <img
              className="h-7 md:h-9 w-auto object-contain"
              src={partner.logo}
              alt={partner.name}
            />
          </a>
        ))}
      </div>
    </section>
  );
};

export default Partner;
