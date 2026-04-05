'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { gql } from 'graphql-tag';
import Star from '@/shared/components/elements/Star';
import { HeartIconBig } from '@/shared/components/icons';
import { useFavorites } from '@/shared/hooks/useFavorites';
import { useCart } from '@/shared/contexts/CartContext';
import Spinner from '@/shared/components/spinner/Spinner';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useCartDrawer } from '@/shared/contexts/CartDrawerContext';
import toast from 'react-hot-toast';

const GET_FAVORITE_PRODUCTS = gql`
  query GetFavoriteProducts {
    favoriteProducts {
      id
      name
      description
      price
      quantity
      images
      category {
        id
        name
      }
    }
  }
`;

const GET_PRODUCTS_BY_IDS = gql`
  query GetProducts($page: Int, $limit: Int, $filter: ProductFilterInput, $sort: ProductSortInput) {
    products(page: $page, limit: $limit, filter: $filter, sort: $sort) {
      items {
        id
        name
        description
        price
        quantity
        images
        category {
          id
          name
        }
      }
      total
      page
      totalPages
    }
  }
`;

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

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart, cartItems } = useCart();
  const { openDrawer } = useCartDrawer();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const getCartQuantity = (productId: string): number => {
    const cartItem = cartItems.find(
      (item) => item.productId === productId || item.product?.id === productId
    );
    return cartItem?.quantity || 0;
  };

  const getSelectedQuantity = (productId: string): number => {
    return quantities[productId] || 1;
  };

  const updateQuantity = (productId: string, delta: number, maxStock: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const newQty = Math.max(1, Math.min(maxStock, current + delta));
      return { ...prev, [productId]: newQty };
    });
  };

  const { data: authData, loading: authLoading } = useQuery(GET_FAVORITE_PRODUCTS, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const { data: guestData, loading: guestLoading } = useQuery(GET_PRODUCTS_BY_IDS, {
    variables: {
      page: 1,
      limit: 1000,
      filter: {},
      sort: { field: 'createdAt', order: -1 },
    },
    skip: isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const loading = isAuthenticated ? authLoading : guestLoading;

  const products: Product[] = isAuthenticated
    ? authData?.favoriteProducts || []
    : (guestData?.products?.items || []).filter((p: Product) => favorites.includes(p.id));

  const displayProducts = hasLocalChanges ? localProducts : products;

  const handleToggleFavorite = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const current = hasLocalChanges ? localProducts : products;
    const updated = current.filter((p) => p.id !== productId);
    setLocalProducts(updated);
    setHasLocalChanges(true);
    await toggleFavorite(productId);
  };

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.quantity === 0) {
      toast.error('This product is out of stock');
      return;
    }

    const selectedQty = getSelectedQuantity(product.id);
    if (selectedQty > product.quantity) {
      toast.error(`Only ${product.quantity} items available in stock`);
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

  const handleAddAllToCart = async () => {
    const inStockProducts = displayProducts.filter((p: Product) => p.quantity > 0);
    if (inStockProducts.length === 0) {
      toast.error('No products in stock to add');
      return;
    }
    setAddingToCart('all');
    let successCount = 0;
    let failCount = 0;
    for (const product of inStockProducts) {
      try {
        await addToCart(product.id, 1);
        successCount++;
      } catch (error) {
        console.error(`Failed to add ${product.name} to cart:`, error);
        failCount++;
      }
    }
    setAddingToCart(null);
    if (successCount > 0) openDrawer();
    if (failCount > 0)
      toast.error(`Failed to add ${failCount} ${failCount === 1 ? 'item' : 'items'}`);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-16 py-8">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
            <Link href="/" className="hover:text-amber-500 transition-colors">
              Home
            </Link>
            <span>›</span>
            <span className="text-slate-700 font-medium">Wishlist</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">My Wishlist</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-16 py-10">
        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner />
          </div>
        ) : displayProducts.length === 0 ? (
          /* Empty state */
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <HeartIconBig className="w-12 h-12 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your wishlist is empty</h2>
            <p className="text-slate-500 mb-8">
              Save your favorite products here to keep track of them and add them to cart later.
            </p>
            <Link href="/products">
              <button className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-2xl transition-colors shadow-lg shadow-amber-500/30">
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Stats + actions bar */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{displayProducts.length}</div>
                  <div className="text-slate-400 text-xs font-medium mt-0.5">Total Items</div>
                </div>
                <div className="w-px h-10 bg-slate-100" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {displayProducts.filter((p) => p.quantity > 0).length}
                  </div>
                  <div className="text-slate-400 text-xs font-medium mt-0.5">In Stock</div>
                </div>
                <div className="w-px h-10 bg-slate-100" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">
                    €{displayProducts.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
                  </div>
                  <div className="text-slate-400 text-xs font-medium mt-0.5">Total Value</div>
                </div>
              </div>
              <button
                onClick={handleAddAllToCart}
                disabled={
                  addingToCart === 'all' ||
                  displayProducts.filter((p) => p.quantity > 0).length === 0
                }
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-2xl transition-colors shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm"
              >
                {addingToCart === 'all' ? 'Adding All...' : 'Add All to Cart'}
              </button>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayProducts.map((product: Product, index: number) => (
                <Link href={`/products/${product.id}`} key={product.id}>
                  <div className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-amber-200 transition-all duration-300 cursor-pointer flex flex-col">
                    {/* Image area */}
                    <div className="relative h-52 bg-slate-50 flex items-center justify-center overflow-hidden">
                      <Image
                        src={product.images?.[0] || '/assets/img/no-product.png'}
                        alt={product.name}
                        width={256}
                        height={256}
                        className="object-contain w-full h-full p-5 group-hover:scale-105 transition-transform duration-300"
                        priority={index < 4}
                      />
                      {/* Remove from wishlist */}
                      <button
                        onClick={(e) => handleToggleFavorite(e, product.id)}
                        className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors z-10"
                        aria-label="Remove from wishlist"
                      >
                        <HeartIconBig className="w-4 h-4 fill-red-500 text-red-500" />
                      </button>
                      {/* Category badge */}
                      <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                        {product.category.name}
                      </span>
                      {/* Stock badge */}
                      {product.quantity > 0 ? (
                        <span className="absolute bottom-3 left-3 bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                          In Stock
                        </span>
                      ) : (
                        <span className="absolute bottom-3 left-3 bg-red-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Info area */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-slate-900 font-semibold text-sm mb-1 line-clamp-1 group-hover:text-amber-500 transition-colors">
                        {product.name}
                      </h3>
                      <div className="mb-2">
                        <Star count={5} />
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-900 text-xl font-bold">€{product.price}</span>
                        {getCartQuantity(product.id) > 0 && (
                          <span className="text-xs text-amber-500 font-semibold bg-amber-50 px-2 py-1 rounded-full">
                            {getCartQuantity(product.id)} in cart
                          </span>
                        )}
                      </div>

                      {/* Quantity selector */}
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl mb-3"
                      >
                        <span className="text-slate-500 text-xs font-medium">Qty</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateQuantity(product.id, -1, product.quantity);
                            }}
                            disabled={
                              product.quantity === 0 || getSelectedQuantity(product.id) <= 1
                            }
                            className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg
                              className="w-3 h-3 text-slate-600"
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
                          <span className="w-8 text-center font-bold text-slate-900 text-sm">
                            {product.quantity === 0 ? 0 : getSelectedQuantity(product.id)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateQuantity(product.id, 1, product.quantity);
                            }}
                            disabled={
                              product.quantity === 0 ||
                              getSelectedQuantity(product.id) >= product.quantity
                            }
                            className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg
                              className="w-3 h-3 text-slate-600"
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

                      {/* Add to cart button */}
                      <button
                        onClick={(e) => e && handleAddToCart(e, product)}
                        disabled={product.quantity === 0 || addingToCart === product.id}
                        className={`w-full py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 mt-auto ${
                          product.quantity > 0
                            ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-sm shadow-amber-500/30'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        } disabled:opacity-50`}
                      >
                        {addingToCart === product.id
                          ? 'Adding...'
                          : product.quantity > 0
                            ? 'Add to Cart'
                            : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 bg-slate-900 rounded-3xl p-8 md:p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <h3 className="text-white text-2xl font-bold mb-2 relative z-10">Ready to shop?</h3>
              <p className="text-slate-400 mb-6 relative z-10">
                Add these items to your cart and complete your purchase.
              </p>
              <Link href="/products">
                <button className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-full transition-colors shadow-lg shadow-amber-500/30 relative z-10">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
