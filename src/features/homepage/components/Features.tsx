import { BestQualityIcon, FreeDeliveryIcon, WarrantyIcon } from '@/shared/components/icons';
import React from 'react';

const features = [
  {
    icon: <FreeDeliveryIcon />,
    title: 'Free Delivery',
    desc: 'On orders above $50',
  },
  {
    icon: <BestQualityIcon />,
    title: 'Best Quality',
    desc: 'Premium products, low prices',
  },
  {
    icon: <WarrantyIcon />,
    title: '1 Year Warranty',
    desc: 'Full coverage on all items',
  },
];

const Features = () => {
  return (
    <section className="container mx-auto px-4 py-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          {features.map((feat, i) => (
            <div key={i} className="flex items-center gap-5">
              <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-amber-500/30 overflow-hidden p-2.5 text-amber-400">
                {feat.icon}
              </div>
              <div>
                <div className="text-white text-base md:text-lg font-semibold">{feat.title}</div>
                <div className="text-slate-400 text-sm">{feat.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
