'use client';

import React, { useState } from 'react';
import { HeadphonesIcon } from '../icons';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  return (
    <div className="border-b border-slate-800">
      <div className="container mx-auto px-4 lg:px-16 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
          {/* Left — headline */}
          <div className="text-center lg:text-left flex-shrink-0">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-2">
              Newsletter
            </p>
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-1">Stay in the Loop</h2>
            <p className="text-slate-400 text-sm">
              Get exclusive deals and the latest updates delivered to your inbox.
            </p>
          </div>

          {/* Center — email input */}
          <div className="flex-1 w-full max-w-lg">
            <div className="relative flex items-center h-12 bg-slate-800 rounded-2xl border border-slate-700 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full h-full pl-11 pr-2 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none rounded-2xl"
              />
              <div className="flex items-center pr-1.5 flex-shrink-0">
                <button className="px-5 h-9 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-amber-500/30">
                  Subscribe
                </button>
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-2 pl-1">No spam, unsubscribe at any time.</p>
          </div>

          {/* Right — phone */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="w-12 h-12 bg-amber-500/15 rounded-xl flex items-center justify-center border border-amber-500/25 flex-shrink-0 overflow-hidden">
              <HeadphonesIcon />
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-0.5">Call us 24/7</div>
              <div className="text-white text-base font-semibold">(+62) 0123 567 789</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
