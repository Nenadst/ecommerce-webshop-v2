'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import Button from '@/shared/components/elements/Button';
import Spinner from '@/shared/components/spinner/Spinner';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useTranslations } from 'next-intl';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const t = useTranslations('checkoutSuccess');
  const [loading, setLoading] = useState(true);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      router.push('/');
      return;
    }

    const verifySession = async () => {
      try {
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
        const data = await response.json();

        if (data.orderNumber) {
          setOrderNumber(data.orderNumber);
          localStorage.removeItem('guest_cart');
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new Event('cart-cleared'));
        } else {
          console.error('No order number returned');
        }
      } catch (error) {
        console.error('Failed to verify session:', error);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [searchParams, router, isAuthenticated]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 max-w-md w-full text-center">
        {/* Success icon */}
        <div className="w-20 h-20 mx-auto bg-green-50 rounded-2xl flex items-center justify-center mb-6 border border-green-100">
          <svg
            className="w-9 h-9 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <p className="text-green-500 text-sm font-semibold uppercase tracking-widest mb-2">
          {t('orderConfirmed')}
        </p>
        <h1 className="text-slate-900 text-2xl font-bold mb-3">{t('thankYouOrder')}</h1>

        {orderNumber && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 mb-4 inline-block">
            <span className="text-slate-500 text-sm">{t('orderNumber')}: </span>
            <span className="text-slate-900 font-bold text-sm">#{orderNumber}</span>
          </div>
        )}

        <p className="text-slate-500 text-sm leading-relaxed mb-8">{t('paymentProcessed')}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isAuthenticated ? (
            <Link href="/profile?tab=orders">
              <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors shadow-sm">
                {t('viewMyOrders')}
              </Button>
            </Link>
          ) : orderNumber ? (
            <Link href={`/order-confirmation?orderNumber=${orderNumber}`}>
              <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors shadow-sm">
                {t('viewOrderDetails')}
              </Button>
            </Link>
          ) : null}
          <Link href="/products">
            <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-white px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-amber-500/30">
              {t('continueShopping')}
            </Button>
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-3 gap-3">
          {[
            { icon: '🔒', label: t('securePayment') },
            { icon: '📦', label: t('fastShipping') },
            { icon: '↩️', label: t('easyReturns') },
          ].map((badge) => (
            <div key={badge.label} className="text-center">
              <div className="text-xl mb-1">{badge.icon}</div>
              <div className="text-xs text-slate-400 font-medium">{badge.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-slate-50 min-h-screen flex items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
