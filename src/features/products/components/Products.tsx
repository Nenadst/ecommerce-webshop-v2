'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import SideCategories from './SideCategories';
import SideAvaliability from './SideAvaliability';
import Star from '@/shared/components/elements/Star';
import BannerPromotion from '@/features/homepage/components/BannerPromotion';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '@/entities/product/api/product.queries';
import { HeartIconBig } from '@/shared/components/icons';
import { useFavorites } from '@/shared/hooks/useFavorites';
import { useCart } from '@/shared/contexts/CartContext';
import { useCartDrawer } from '@/shared/contexts/CartDrawerContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import Button from '@/shared/components/elements/Button';
import toast from 'react-hot-toast';
import { AuthModal } from '@/shared/components/modals/AuthModal';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  images?: string[];
  category: {
    id: string;
    name: string;
  };
}

interface ProductsProps {
  initialData: Product[];
}

const Products = ({ initialData }: ProductsProps) => {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [inStockSelected, setInStockSelected] = useState(true);
  const [outOfStockSelected, setOutOfStockSelected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1);
  const [productsPerPage, setProductsPerPage] = useState(12);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart, cartItems } = useCart();
  const { openDrawer } = useCartDrawer();
  const { isAuthenticated } = useAuth();

  const getAvailableQuantity = (productId: string, stockQuantity: number) => {
    const quantityInCart = cartItems.find((item) => item.productId === productId)?.quantity || 0;
    return stockQuantity - quantityInCart;
  };

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategories([categoryFromUrl]);
      setCurrentPage(1);
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, inStockSelected, outOfStockSelected]);

  const { data, loading } = useQuery(GET_PRODUCTS, {
    variables: {
      page: 1,
      limit: 1000,
      filter: {},
      sort: { field: sortField, order: sortOrder },
    },
    fetchPolicy: 'cache-and-network',
  });

  const allProducts = data?.products?.items || initialData;

  const filteredProducts = allProducts.filter((product: Product) => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category.id)) {
      return false;
    }
    if (!inStockSelected && !outOfStockSelected) return true;
    if (inStockSelected && outOfStockSelected) return true;
    if (inStockSelected && product.quantity > 0) return true;
    if (outOfStockSelected && product.quantity === 0) return true;
    return false;
  });

  const filteredTotal = filteredProducts.length;
  const totalPages = Math.ceil(filteredTotal / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const products = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const handleAvailabilityChange = (inStock: boolean, outOfStock: boolean) => {
    setInStockSelected(inStock);
    setOutOfStockSelected(outOfStock);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const map: Record<string, { field: string; order: 1 | -1 }> = {
      'price-asc': { field: 'price', order: 1 },
      'price-desc': { field: 'price', order: -1 },
      'name-asc': { field: 'name', order: 1 },
      'name-desc': { field: 'name', order: -1 },
      newest: { field: 'createdAt', order: -1 },
      oldest: { field: 'createdAt', order: 1 },
    };
    const mapped = map[value] || { field: 'createdAt', order: -1 as -1 };
    setSortField(mapped.field);
    setSortOrder(mapped.order);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    await toggleFavorite(productId);
  };

  const getSelectedQuantity = (productId: string) => quantities[productId] || 1;

  const updateQuantity = (productId: string, delta: number, availableStock: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      return { ...prev, [productId]: Math.max(1, Math.min(availableStock, current + delta)) };
    });
  };

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const availableQty = getAvailableQuantity(product.id, product.quantity);
    if (availableQty === 0) {
      toast.error('All available stock is already in your cart');
      return;
    }
    const selectedQty = getSelectedQuantity(product.id);
    if (selectedQty > availableQty) {
      toast.error(`Only ${availableQty} more item(s) can be added to cart`);
      return;
    }
    setAddingToCart(product.id);
    try {
      await addToCart(product.id, selectedQty);
      setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
      openDrawer();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <div className="bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 lg:px-16 py-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 hidden lg:block">
              <SideCategories
                selectedCategories={selectedCategories}
                onCategoriesChange={setSelectedCategories}
                allProducts={allProducts}
              />
              <SideAvaliability
                inStockSelected={inStockSelected}
                outOfStockSelected={outOfStockSelected}
                onAvailabilityChange={handleAvailabilityChange}
                selectedCategories={selectedCategories}
              />
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 bg-white rounded-2xl border border-slate-100 px-5 py-3.5">
                <p className="text-slate-500 text-sm">
                  Showing <span className="font-semibold text-slate-900">{products.length}</span> of{' '}
                  <span className="font-semibold text-slate-900">{filteredTotal}</span> products
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-sm">Sort:</span>
                  <select
                    onChange={handleSortChange}
                    className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              {loading && initialData.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl h-[480px] animate-pulse border border-slate-100"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {products.length === 0 ? (
                    <div className="col-span-full text-center py-24">
                      <div className="text-slate-300 text-6xl mb-4">🔍</div>
                      <p className="text-slate-500 text-lg font-medium">No products found</p>
                      <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
                    </div>
                  ) : (
                    products.map((product: Product, index: number) => {
                      const availableQty = getAvailableQuantity(product.id, product.quantity);
                      return (
                        <Link href={`/products/${product.id}`} key={product.id}>
                          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all duration-300 group flex flex-col h-full">
                            {/* Image */}
                            <div className="relative h-52 bg-slate-50 flex items-center justify-center overflow-hidden">
                              <Image
                                src={product.images?.[0] || '/assets/img/no-product.png'}
                                alt={product.name}
                                width={200}
                                height={200}
                                className="object-contain w-full h-full p-4 group-hover:scale-105 transition-transform duration-300"
                                priority={index < 4}
                              />
                              {/* Category badge */}
                              <span className="absolute top-3 left-3 bg-slate-900 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                                {product.category.name}
                              </span>
                              {/* Stock badge */}
                              {availableQty > 0 ? (
                                <span className="absolute bottom-3 left-3 bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                                  In Stock
                                </span>
                              ) : product.quantity > 0 ? (
                                <span className="absolute bottom-3 left-3 bg-orange-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                                  All in Cart
                                </span>
                              ) : (
                                <span className="absolute bottom-3 left-3 bg-red-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                                  Out of Stock
                                </span>
                              )}
                              {/* Wishlist */}
                              <button
                                onClick={(e) => handleToggleFavorite(e, product.id)}
                                className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-amber-50 transition-colors shadow-sm z-10"
                                aria-label={
                                  isFavorite(product.id)
                                    ? 'Remove from favorites'
                                    : 'Add to favorites'
                                }
                              >
                                <HeartIconBig
                                  className={`w-4 h-4 transition-colors ${
                                    isFavorite(product.id)
                                      ? 'fill-red-500 text-red-500'
                                      : 'text-slate-400'
                                  }`}
                                />
                              </button>
                            </div>

                            {/* Info */}
                            <div className="p-4 flex flex-col flex-1">
                              <h3 className="text-slate-900 font-semibold text-sm leading-snug line-clamp-2 mb-1">
                                {product.name}
                              </h3>
                              <p className="text-slate-400 text-xs line-clamp-2 mb-3 flex-1">
                                {product.description || 'No description available'}
                              </p>

                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xl font-bold text-slate-900">
                                  €{product.price}
                                </span>
                                <Star count={5} />
                              </div>

                              {/* Quantity */}
                              <div
                                className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 mb-3"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <span className="text-xs text-slate-500 font-medium">Qty</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      updateQuantity(product.id, -1, availableQty);
                                    }}
                                    disabled={
                                      availableQty === 0 || getSelectedQuantity(product.id) <= 1
                                    }
                                    className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600"
                                  >
                                    <svg
                                      className="w-3 h-3"
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
                                  <span className="w-8 text-center text-sm font-bold text-slate-900">
                                    {availableQty === 0 ? 0 : getSelectedQuantity(product.id)}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      updateQuantity(product.id, 1, availableQty);
                                    }}
                                    disabled={
                                      availableQty === 0 ||
                                      getSelectedQuantity(product.id) >= availableQty
                                    }
                                    className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600"
                                  >
                                    <svg
                                      className="w-3 h-3"
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
                              </div>

                              {/* Add to cart */}
                              <div
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <Button
                                  onClick={(e) => e && handleAddToCart(e, product)}
                                  disabled={availableQty === 0 || addingToCart === product.id}
                                  className={`w-full py-2.5 text-sm font-semibold rounded-xl transition-all ${
                                    availableQty > 0
                                      ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-sm shadow-amber-500/30'
                                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  } disabled:opacity-60`}
                                >
                                  {addingToCart === product.id
                                    ? 'Adding...'
                                    : availableQty > 0
                                      ? 'Add to Cart'
                                      : product.quantity > 0
                                        ? 'All in Cart'
                                        : 'Out of Stock'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              )}

              {/* Pagination */}
              {allProducts.length > 0 && totalPages > 0 && (
                <div className="flex items-center justify-between mt-8 bg-white rounded-2xl border border-slate-100 px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-sm">Show:</span>
                    <select
                      value={productsPerPage}
                      onChange={(e) => {
                        setProductsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="12">12</option>
                      <option value="24">24</option>
                      <option value="48">48</option>
                      <option value="96">96</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-slate-200 rounded-xl hover:border-amber-400 hover:text-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-9 h-9 text-sm rounded-xl font-medium transition-all ${
                          currentPage === page
                            ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                            : 'border border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-500'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-slate-200 rounded-xl hover:border-amber-400 hover:text-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <BannerPromotion />
    </>
  );
};

export default Products;
