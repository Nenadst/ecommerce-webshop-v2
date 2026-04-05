import React from 'react';
import { LocationIcon, TruckDeliveryIcon } from '../icons';

const HeaderTop = () => {
  return (
    <div className="bg-slate-950 border-b border-slate-800/50 hidden lg:block">
      <div className="container mx-auto px-4 lg:px-16 h-9 flex items-center justify-between">
        {/* Left — phone */}
        <div className="text-slate-400 text-xs">
          Need help?{' '}
          <span className="text-amber-400 font-medium cursor-pointer hover:text-amber-300 transition-colors">
            (+98) 0234 456 789
          </span>
        </div>

        {/* Center — promo pill */}
        <div className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-400 text-xs font-medium px-3 py-1 rounded-full border border-amber-500/25">
          🚚 Free shipping on orders over $50
        </div>

        {/* Right — store + tracking */}
        <div className="flex items-center gap-5">
          <button className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors text-xs">
            <span className="flex-shrink-0 flex items-center justify-center">
              <LocationIcon />
            </span>
            Our store
          </button>
          <div className="w-px h-3.5 bg-slate-700" />
          <button className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors text-xs">
            <span className="flex-shrink-0 flex items-center justify-center">
              <TruckDeliveryIcon />
            </span>
            Track your order
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderTop;
