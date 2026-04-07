'use client';

import DotSlide from '@/shared/components/elements/DotSlide';
import Star from '@/shared/components/elements/Star';
import { Link } from '@/i18n/navigation';
import React from 'react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  category: {
    id: string;
    name: string;
  };
}

interface ProductProps {
  initialProducts: Product[];
}

const Product = ({ initialProducts }: ProductProps) => {
  const products = initialProducts;

  if (products.length === 0) {
    return null;
  }

  const displayProducts = products.slice(0, 8);

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
        {displayProducts.map((product: Product) => (
          <Link href={`/products/${product.id}`} key={product.id}>
            <div className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              {/* Image container */}
              <div className="relative h-44 bg-slate-50 flex items-center justify-center overflow-hidden">
                <Image
                  src={product.images?.[0] || '/assets/img/no-product.png'}
                  alt={product.name}
                  fill
                  className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                />
                {/* Wishlist button */}
                <button
                  onClick={(e) => e.preventDefault()}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-400 hover:text-red-400"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
                {/* Category badge */}
                <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-slate-500 text-xs font-medium px-2 py-1 rounded-full">
                  {product.category?.name || 'Tech'}
                </div>
              </div>
              {/* Product info */}
              <div className="p-4">
                <h3 className="text-slate-800 text-sm md:text-base font-semibold mb-1.5 line-clamp-1 group-hover:text-amber-500 transition-colors">
                  {product.name}
                </h3>
                <Star count={5} />
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-slate-900 text-base md:text-lg font-bold">
                    €{product.price}
                  </span>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center hover:bg-amber-400 transition-all duration-200 shadow-sm opacity-0 group-hover:opacity-100 shadow-amber-500/30"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-center">
        <DotSlide className="mt-2" count={2} />
      </div>
    </section>
  );
};

export default Product;
