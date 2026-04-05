'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useActivityTracker } from '@/shared/hooks/useActivityTracker';
import { LogOut } from 'lucide-react';
import Link from 'next/link';

export default function LogoutPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { trackActivity } = useActivityTracker();

  useEffect(() => {
    if (user) {
      trackActivity({
        action: 'LOGOUT',
        description: `User ${user.email} logged out`,
      });
    }

    logout();

    const timer = setTimeout(() => {
      router.push('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [logout, router]);

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20">
          <LogOut className="w-9 h-9 text-amber-500" />
        </div>

        <h1 className="text-slate-900 text-2xl font-bold mb-2">Logging Out...</h1>
        <p className="text-slate-500 text-sm mb-8">
          You have been successfully signed out. Redirecting you to the homepage shortly.
        </p>

        {/* Spinner */}
        <div className="flex justify-center mb-8">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-amber-500 animate-spin" />
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm shadow-amber-500/30 text-sm"
        >
          Go to Homepage
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
