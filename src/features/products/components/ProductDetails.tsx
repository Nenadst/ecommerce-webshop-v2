'use client';

import Star from '@/shared/components/elements/Star';
import { HeartIconBig } from '@/shared/components/icons';
import Image from 'next/image';
import React, { useState } from 'react';
import { useFavorites } from '@/shared/hooks/useFavorites';
import { useCart } from '@/shared/contexts/CartContext';
import { useCartDrawer } from '@/shared/contexts/CartDrawerContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useActivityTracker } from '@/shared/hooks/useActivityTracker';
import toast from 'react-hot-toast';
import { Link } from '@/i18n/navigation';
import { AuthModal } from '@/shared/components/modals/AuthModal';
import { useParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_PRODUCT } from '@/entities/product/api/product.queries';
import { useTranslations } from 'next-intl';

const ProductDetails = () => {
  const t = useTranslations('productDetail');
  const params = useParams();
  const productId = params.id as string;

  const { data, loading, error } = useQuery(GET_PRODUCT, {
    variables: { id: productId },
    skip: !productId,
  });

  const product = data?.product;

  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart, cartItems } = useCart();
  const { openDrawer } = useCartDrawer();
  const { isAuthenticated } = useAuth();
  const { trackActivity } = useActivityTracker();

  const quantityInCart = product
    ? cartItems.find((item) => item.productId === product.id)?.quantity || 0
    : 0;
  const availableQuantity = product ? product.quantity - quantityInCart : 0;

  React.useEffect(() => {
    if (product) {
      trackActivity({
        action: 'VIEW_PRODUCT',
        description: `Viewed product: ${product.name}`,
        metadata: { productId: product.id, productName: product.name, price: product.price },
      });
    }
  }, [product?.id, product?.name, product?.price, trackActivity]);

  React.useEffect(() => {
    if (selectedQuantity > availableQuantity && availableQuantity > 0) {
      setSelectedQuantity(availableQuantity);
    } else if (availableQuantity === 0) {
      setSelectedQuantity(0);
    }
  }, [availableQuantity, selectedQuantity]);

  React.useEffect(() => {
    if (!isFullscreen) return;
    const imagesLength = product?.images?.length || 0 || 1;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setSelectedImageIndex((p) => (p + 1) % imagesLength);
      else if (e.key === 'ArrowLeft')
        setSelectedImageIndex((p) => (p - 1 + imagesLength) % imagesLength);
      else if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, product?.images?.length]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 lg:px-16 py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-amber-500 mx-auto mb-4" />
            <p className="text-slate-500">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 lg:px-16 py-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-500 text-lg">{t('notFound')}</p>
            <Link
              href="/products"
              className="text-amber-500 hover:text-amber-600 mt-2 inline-block text-sm font-medium"
            >
              {t('backToProducts')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0 ? product.images : ['/assets/img/no-product.png'];

  const handleQuantityChange = (delta: number) => {
    setSelectedQuantity((q) => Math.max(1, Math.min(availableQuantity, q + delta)));
  };

  const handleAddToCart = async () => {
    if (availableQuantity === 0) {
      toast.error(t('allStockInCart'));
      return;
    }
    if (selectedQuantity > availableQuantity) {
      toast.error(t('maxStock', { count: availableQuantity }));
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product.id, selectedQuantity);
      setSelectedQuantity(1);
      openDrawer();
      toast.success(t('addToCartSuccess'));
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    await toggleFavorite(product.id);
  };

  const handleNextImage = () => setSelectedImageIndex((p) => (p + 1) % images.length);
  const handlePrevImage = () =>
    setSelectedImageIndex((p) => (p - 1 + images.length) % images.length);

  const discountPct =
    product.hasDiscount && product.discountPrice
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : null;
  const displayPrice =
    product.hasDiscount && product.discountPrice ? product.discountPrice : product.price;

  return (
    <>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      <div className="bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 lg:px-16 py-8">
          {/* Main product card */}
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Image panel */}
              <div className="p-8 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-100">
                {/* Main image */}
                <div
                  className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white cursor-zoom-in border border-slate-100 mb-4"
                  onClick={() => setIsFullscreen(true)}
                >
                  <Image
                    src={images[selectedImageIndex]}
                    alt={product.name}
                    fill
                    className="object-contain p-8 pointer-events-none"
                    priority
                  />
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                    🔍 {t('clickToZoom')}
                  </div>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square relative overflow-hidden rounded-xl border-2 transition-all bg-white ${
                          selectedImageIndex === index
                            ? 'border-amber-500 shadow-sm shadow-amber-500/20'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          className="object-contain p-1.5"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info panel */}
              <div className="p-8 flex flex-col gap-5">
                {/* Category + badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/products?category=${product.category.id}`}
                    className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full hover:bg-amber-100 transition-colors"
                  >
                    {product.category.name}
                  </Link>
                  {discountPct && (
                    <span className="text-xs font-bold text-white bg-red-500 px-3 py-1 rounded-full">
                      -{discountPct}% OFF
                    </span>
                  )}
                  {availableQuantity > 0 && availableQuantity <= 10 && (
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                      {t('onlyLeft', { count: availableQuantity })}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1 className="text-slate-900 font-bold text-2xl lg:text-3xl leading-tight">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <Star count={5} />
                  <span className="text-slate-400 text-sm">{t('noReviews')}</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-slate-900">
                    €{displayPrice.toFixed(2)}
                  </span>
                  {product.hasDiscount && product.discountPrice && (
                    <span className="text-lg text-slate-400 line-through">
                      €{product.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Availability */}
                <div className="flex items-center gap-3 py-3 border-y border-slate-100">
                  <span className="text-slate-600 text-sm font-medium">{t('availability')}:</span>
                  {availableQuantity > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      {t('inStock', { count: availableQuantity })}
                      {quantityInCart > 0 && (
                        <span className="text-slate-400 font-normal">
                          ({t('inCart', { count: quantityInCart })})
                        </span>
                      )}
                    </span>
                  ) : product.quantity > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      {t('allInCart')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-500">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      {t('outOfStock')}
                    </span>
                  )}
                </div>

                {/* Description preview */}
                {product.description && (
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                    {product.description}
                  </p>
                )}

                {/* Quantity + CTA */}
                <div className="flex items-center gap-4">
                  {/* Quantity stepper */}
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={availableQuantity === 0 || selectedQuantity <= 1}
                      className="w-10 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 border-r border-slate-200"
                    >
                      <svg
                        className="w-4 h-4"
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
                    <span className="w-14 h-12 flex items-center justify-center text-center font-bold text-slate-900 text-base">
                      {availableQuantity === 0 ? 0 : selectedQuantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={availableQuantity === 0 || selectedQuantity >= availableQuantity}
                      className="w-10 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 border-l border-slate-200"
                    >
                      <svg
                        className="w-4 h-4"
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

                  {/* Add to cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={availableQuantity === 0 || addingToCart}
                    className={`flex-1 h-12 rounded-xl font-semibold text-sm transition-all ${
                      availableQuantity > 0
                        ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/30'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    } disabled:opacity-60`}
                  >
                    {addingToCart
                      ? t('adding')
                      : availableQuantity > 0
                        ? t('addToCart')
                        : product.quantity > 0
                          ? t('allInCartBtn')
                          : t('outOfStock')}
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={handleToggleFavorite}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                      isFavorite(product.id)
                        ? 'bg-red-50 border-red-200 text-red-500'
                        : 'border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-400'
                    }`}
                  >
                    <HeartIconBig
                      className={`w-5 h-5 transition-colors ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </button>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-50 rounded-xl px-4 py-3">
                    <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
                      {t('sku')}
                    </span>
                    <p className="text-slate-700 font-semibold text-sm mt-0.5">
                      {product.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl px-4 py-3">
                    <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
                      {t('category')}
                    </span>
                    <p className="mt-0.5">
                      <Link
                        href={`/products?category=${product.category.id}`}
                        className="text-amber-600 font-semibold text-sm hover:text-amber-700 transition-colors"
                      >
                        {product.category.name}
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description / Reviews tabs */}
          <div className="bg-white rounded-3xl border border-slate-100 mt-6 overflow-hidden">
            <div className="flex border-b border-slate-100">
              {(['description', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-4 text-sm font-semibold capitalize transition-all border-b-2 ${
                    activeTab === tab
                      ? 'text-amber-600 border-amber-500'
                      : 'text-slate-500 border-transparent hover:text-slate-900'
                  }`}
                >
                  {tab === 'description' ? t('description') : t('reviews')}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'description' ? (
                product.description ? (
                  <p className="text-slate-600 leading-relaxed">{product.description}</p>
                ) : (
                  <p className="text-slate-400">{t('noDescriptionAvailable')}</p>
                )
              ) : (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-700 font-semibold">{t('noReviews')}</p>
                    <p className="text-slate-400 text-sm mt-1">{t('beFirstReview')}</p>
                  </div>
                  <button className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-amber-500/30">
                    {t('writeReview')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white z-10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          <div
            className="relative max-w-4xl max-h-[90vh] w-full h-full mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[selectedImageIndex]}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProductDetails;
