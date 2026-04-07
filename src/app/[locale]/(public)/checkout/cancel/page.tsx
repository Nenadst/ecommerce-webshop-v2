'use client';

import { Link } from '@/i18n/navigation';
import Button from '@/shared/components/elements/Button';
import { useTranslations } from 'next-intl';

export default function CancelPage() {
  const t = useTranslations('checkoutCancel');
  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 border border-amber-200">
          <svg
            className="w-9 h-9 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-2">
          {t('paymentCancelled')}
        </p>
        <h1 className="text-slate-900 text-2xl font-bold mb-3">{t('orderNotCompleted')}</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">{t('paymentNotProcessed')}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/checkout">
            <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors shadow-sm">
              {t('returnToCheckout')}
            </Button>
          </Link>
          <Link href="/cart">
            <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-white px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-amber-500/30">
              {t('viewCart')}
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <Link
            href="/products"
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            ← {t('continueShopping')}
          </Link>
        </div>
      </div>
    </div>
  );
}
