'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ORDERS } from '@/entities/order/api/order.queries';
import Spinner from '@/shared/components/spinner/Spinner';
import { Package, Calendar, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

const getStatusStyle = (status: string) => {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-700 border border-amber-200';
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-700 border border-blue-200';
    case 'SHIPPED':
      return 'bg-violet-100 text-violet-700 border border-violet-200';
    case 'DELIVERED':
      return 'bg-green-100 text-green-700 border border-green-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700 border border-red-200';
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
};

const getPaymentStatusStyle = (status: string) => {
  switch (status.toUpperCase()) {
    case 'PAID':
      return 'bg-green-100 text-green-700 border border-green-200';
    case 'PENDING':
      return 'bg-amber-100 text-amber-700 border border-amber-200';
    case 'FAILED':
      return 'bg-red-100 text-red-700 border border-red-200';
    case 'REFUNDED':
      return 'bg-slate-100 text-slate-600 border border-slate-200';
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
};

export default function OrdersTab() {
  const t = useTranslations('profile');
  const locale = useLocale();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  const { data, loading, error } = useQuery<{ orders: Order[] }>(GET_ORDERS, {
    fetchPolicy: 'network-only',
  });
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrder = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-slate-600 font-medium">{t('failedLoadOrders')}</p>
        <p className="text-slate-400 text-sm mt-1">{t('tryAgainLater')}</p>
      </div>
    );
  }

  const orders = data?.orders || [];

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-5">
          <Package className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{t('noOrders')}</h3>
        <p className="text-slate-500 mb-6">{t('noOrdersStart')}</p>
        <Link
          href="/products"
          className="inline-block bg-amber-500 hover:bg-amber-400 text-white font-semibold px-7 py-3 rounded-2xl transition-colors shadow-lg shadow-amber-500/30"
        >
          {t('startShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-slate-900">{t('orderHistory')}</h2>
        <span className="text-slate-400 text-sm">
          {orders.length !== 1
            ? t('ordersCount', { count: orders.length })
            : t('orderCount', { count: orders.length })}
        </span>
      </div>

      {orders.map((order) => {
        const isExpanded = expandedOrders.has(order.id);
        return (
          <div
            key={order.id}
            className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-amber-200 hover:shadow-lg transition-all duration-300"
          >
            {/* Order header — clickable */}
            <div
              className="px-6 py-5 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => toggleOrder(order.id)}
            >
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-0.5">{t('orderLabel')}</p>
                    <p className="text-slate-900 font-bold">{order.orderNumber}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <CreditCard className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="font-bold text-slate-900">€{order.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(order.status)}`}
                  >
                    {order.status}
                  </span>
                  <div className="text-slate-400">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t border-slate-100 px-6 py-5">
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-5 mb-5">
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <Package className="w-4 h-4" />
                    <span>
                      {order.items.length !== 1
                        ? t('itemCount', { count: order.items.length })
                        : t('itemCountSingular', { count: order.items.length })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400">{t('payment')}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPaymentStatusStyle(order.paymentStatus)}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Order items */}
                <div className="space-y-3 mb-5">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0"
                    >
                      <div className="w-14 h-14 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={56}
                            height={56}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <Package className="w-7 h-7 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 text-sm truncate">
                          {item.name}
                        </h4>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {t('qty')}: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-slate-900">€{item.price.toFixed(2)}</p>
                        <p className="text-slate-400 text-xs">{t('each')}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium text-sm">
                    {t('viewDetails')}
                  </button>
                  <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors font-medium text-sm">
                    {t('downloadInvoice')}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
