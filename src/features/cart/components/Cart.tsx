'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useCart } from '@/shared/contexts/CartContext';
import Spinner from '@/shared/components/spinner/Spinner';
import ConfirmModal from '@/shared/components/modals/ConfirmModal';
import { useTranslations } from 'next-intl';

const Cart = () => {
  const t = useTranslations('cart');
  const {
    cartItems,
    total,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    loading,
    mounted,
  } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [isClearing, setIsClearing] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    setUpdatingItems((prev) => new Set(prev).add(productId));
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    setRemovingItems((prev) => new Set(prev).add(productId));
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setRemovingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleClearCartClick = () => {
    if (cartItems.length === 0) return;
    setShowClearModal(true);
  };

  const handleConfirmClearCart = async () => {
    setIsClearing(true);
    try {
      await clearCart();
      setShowClearModal(false);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    } finally {
      setIsClearing(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <div className="bg-white border-b border-slate-100">
          <div className="container mx-auto px-4 lg:px-16 py-8">
            <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
          </div>
        </div>
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-16 py-8">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
            <Link href="/" className="hover:text-amber-500 transition-colors">
              {t('home')}
            </Link>
            <span>›</span>
            <span className="text-slate-700 font-medium">{t('title')}</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
            {cartItems.length > 0 && (
              <span className="text-slate-500 text-sm">
                {itemCount === 1
                  ? t('item', { count: itemCount })
                  : t('items', { count: itemCount })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-16 py-10">
        {cartItems.length === 0 ? (
          /* Empty state */
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('empty')}</h2>
            <p className="text-slate-500 mb-8">{t('emptyCartMessage')}</p>
            <Link href="/products">
              <button className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-2xl transition-colors shadow-lg shadow-amber-500/30">
                {t('startShopping')}
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header row */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">
                  {t('cartItems', { count: itemCount })}
                </h2>
                <button
                  onClick={handleClearCartClick}
                  disabled={isClearing}
                  className="text-sm text-slate-400 hover:text-red-500 transition-colors font-medium disabled:opacity-50"
                >
                  {isClearing ? t('clearing') : t('clearAll')}
                </button>
              </div>

              {cartItems.map((item) => {
                const product = item.product;
                const isRemoving = removingItems.has(item.productId);
                const isUpdating = updatingItems.has(item.productId);

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border border-slate-100 p-5 flex gap-5 transition-all duration-300 ${
                      isRemoving ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                    }`}
                  >
                    {/* Product image */}
                    <Link
                      href={`/products/${product?.id || item.productId}`}
                      className="flex-shrink-0"
                    >
                      <div className="w-24 h-24 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center">
                        <Image
                          src={product?.images?.[0] || '/assets/img/no-product.png'}
                          alt={product?.name || 'Product'}
                          width={96}
                          height={96}
                          className="object-contain w-full h-full p-2 hover:scale-105 transition-transform"
                        />
                      </div>
                    </Link>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3 mb-1">
                        <div className="min-w-0">
                          {product?.category && (
                            <span className="text-amber-500 text-xs font-semibold uppercase tracking-wide">
                              {product.category.name}
                            </span>
                          )}
                          <Link href={`/products/${product?.id || item.productId}`}>
                            <h3 className="text-slate-900 font-semibold text-base hover:text-amber-500 transition-colors truncate">
                              {product?.name || 'Product'}
                            </h3>
                          </Link>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          disabled={isRemoving}
                          className="text-slate-300 hover:text-red-400 transition-colors disabled:opacity-50 flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>

                      {product?.quantity !== undefined && product.quantity < 10 && (
                        <p className="text-amber-500 text-xs font-medium mb-2">
                          {t('onlyLeft', { count: product.quantity })}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-1 py-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating || isRemoving}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 12H4"
                              />
                            </svg>
                          </button>
                          <span className="w-10 text-center font-bold text-slate-900 text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            disabled={
                              (product?.quantity !== undefined &&
                                item.quantity >= product.quantity) ||
                              isUpdating ||
                              isRemoving
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-slate-400 text-xs mb-0.5">
                            €{product?.price?.toFixed(2)} {t('each')}
                          </div>
                          <div className="text-slate-900 text-lg font-bold">
                            €{((product?.price || 0) * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Link href="/products">
                <button className="w-full mt-2 py-3 bg-white border border-slate-200 hover:border-amber-300 text-slate-600 hover:text-amber-500 rounded-2xl font-medium transition-all text-sm">
                  {t('continueShopping')}
                </button>
              </Link>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-24">
                <h2 className="text-lg font-bold text-slate-900 mb-5">{t('orderSummary')}</h2>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-slate-600 text-sm">
                    <span>
                      {itemCount === 1
                        ? t('item', { count: itemCount })
                        : t('items', { count: itemCount })}
                    </span>
                    <span className="font-medium text-slate-900">€{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-sm">
                    <span>{t('shipping')}</span>
                    <span className="font-semibold text-green-500">{t('freeShipping')}</span>
                  </div>
                  <div className="h-px bg-slate-100 my-1" />
                  <div className="flex justify-between text-slate-900 font-bold text-lg">
                    <span>{t('total')}</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>

                <Link href="/checkout">
                  <button className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-amber-500/30 mb-4">
                    {t('proceedToCheckout')}
                  </button>
                </Link>

                {/* Trust badges */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-slate-800 text-xs font-semibold">
                        {t('secureCheckout')}
                      </div>
                      <div className="text-slate-400 text-xs">{t('sslEncryption')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-slate-800 text-xs font-semibold">
                        {t('freeShippingBadge')}
                      </div>
                      <div className="text-slate-400 text-xs">{t('noMinimum')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleConfirmClearCart}
        title={t('clearCart')}
        message={t('clearCartConfirm')}
        confirmText={t('clearCart')}
        cancelText={t('cancel')}
        isLoading={isClearing}
      />
    </div>
  );
};

export default Cart;
