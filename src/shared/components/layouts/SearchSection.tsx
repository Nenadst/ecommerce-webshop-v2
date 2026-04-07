'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import { GET_PRODUCTS } from '@/entities/product/api/product.queries';
import { Product } from '@/entities/product/types/product.types';
import { useActivityTracker } from '@/shared/hooks/useActivityTracker';
import { useTranslations } from 'next-intl';

const SearchSection = () => {
  const t = useTranslations('header');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { trackActivity } = useActivityTracker();

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, loading } = useQuery(GET_PRODUCTS, {
    variables: {
      page: 1,
      limit: 8,
      filter: { name: debouncedQuery },
    },
    skip: debouncedQuery.length < 2,
    fetchPolicy: 'cache-and-network',
  });

  const results: Product[] = data?.products?.items ?? [];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (product: Product) => {
      trackActivity({
        action: 'SEARCH',
        description: `Clicked search result: ${product.name}`,
        metadata: { query: debouncedQuery, productId: product.id },
      });
      setQuery('');
      setIsOpen(false);
      setActiveIndex(-1);
      router.push(`/products/${product.id}`);
    },
    [router, trackActivity, debouncedQuery]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;
      if (activeIndex >= 0 && results[activeIndex]) {
        handleSelect(results[activeIndex]);
        return;
      }
      trackActivity({
        action: 'SEARCH',
        description: `Searched for: ${query.trim()}`,
        metadata: { query: query.trim() },
      });
      setIsOpen(false);
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    },
    [query, activeIndex, results, handleSelect, trackActivity, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  const showDropdown = isOpen && query.trim().length >= 2;

  return (
    <div
      ref={containerRef}
      className="w-96 justify-center items-center lg:flex md:flex hidden relative"
    >
      <form onSubmit={handleSubmit} className="w-full relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t('searchPlaceholder')}
          className="w-full h-12 pl-5 pr-24 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 px-5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-r-2xl transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"
            />
          </svg>
          {t('search')}
        </button>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-14 left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/60 z-[100] overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-6 text-slate-400 text-sm">
              <div className="w-4 h-4 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
              {t('searching')}
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-slate-500 text-sm">{t('noProductsFoundFor')}</p>
              <p className="text-slate-800 font-semibold text-sm mt-0.5">
                &ldquo;{debouncedQuery}&rdquo;
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className="px-4 pt-3 pb-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {data?.products?.total ?? results.length} results for &ldquo;{debouncedQuery}
                  &rdquo;
                </p>
              </div>
              <ul>
                {results.map((product, index) => {
                  const price =
                    product.hasDiscount && product.discountPrice
                      ? product.discountPrice
                      : product.price;
                  const isActive = index === activeIndex;
                  return (
                    <li key={product.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => handleSelect(product)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isActive ? 'bg-amber-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center border border-slate-100">
                          <Image
                            src={product.images?.[0] ?? '/assets/img/no-product.png'}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{product.category?.name}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-slate-900">€{price.toFixed(2)}</p>
                          {product.hasDiscount && product.discountPrice && (
                            <p className="text-xs text-slate-400 line-through">
                              €{product.price.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {(data?.products?.total ?? 0) > 8 && (
                <div className="border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSubmit as unknown as React.MouseEventHandler}
                    className="w-full py-3 text-sm text-amber-600 font-semibold hover:bg-amber-50 transition-colors"
                  >
                    {t('viewAllResults', { count: data?.products?.total })}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchSection;
