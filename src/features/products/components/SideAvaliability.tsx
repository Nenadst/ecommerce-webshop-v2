'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '@/entities/product/api/product.queries';

interface SideAvailabilityProps {
  inStockSelected: boolean;
  outOfStockSelected: boolean;
  onAvailabilityChange: (inStock: boolean, outOfStock: boolean) => void;
  selectedCategories: string[];
}

const SideAvaliability = ({
  inStockSelected,
  outOfStockSelected,
  onAvailabilityChange,
  selectedCategories,
}: SideAvailabilityProps) => {
  const { data } = useQuery(GET_PRODUCTS, {
    variables: {
      page: 1,
      limit: 1000,
      filter: selectedCategories.length > 0 ? { categoryIds: selectedCategories } : {},
      sort: { field: 'createdAt', order: -1 },
    },
  });

  const allProducts = data?.products?.items || [];
  const inStockCount = allProducts.filter((p: { quantity: number }) => p.quantity > 0).length;
  const outOfStockCount = allProducts.filter((p: { quantity: number }) => p.quantity === 0).length;

  const options = [
    {
      id: 'ins',
      label: 'In Stock',
      count: inStockCount,
      checked: inStockSelected,
      disabled: inStockCount === 0,
      onChange: () => onAvailabilityChange(!inStockSelected, outOfStockSelected),
      dotColor: 'bg-green-500',
    },
    {
      id: 'oos',
      label: 'Out of Stock',
      count: outOfStockCount,
      checked: outOfStockSelected,
      disabled: outOfStockCount === 0,
      onChange: () => onAvailabilityChange(inStockSelected, !outOfStockSelected),
      dotColor: 'bg-red-400',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-900 font-bold text-sm uppercase tracking-wider">Availability</h3>
        <button
          onClick={() => onAvailabilityChange(true, true)}
          className="text-amber-500 text-xs font-medium hover:text-amber-600 transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label
            key={opt.id}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
              opt.disabled
                ? 'opacity-40 cursor-not-allowed'
                : opt.checked
                  ? 'bg-amber-50 border border-amber-200'
                  : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                  opt.checked ? 'bg-amber-500 border-amber-500' : 'border-slate-300 bg-white'
                }`}
              >
                {opt.checked && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input
                id={opt.id}
                type="checkbox"
                checked={opt.checked}
                onChange={opt.onChange}
                disabled={opt.disabled}
                className="sr-only"
              />
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${opt.dotColor}`} />
                <span className="text-sm text-slate-700">{opt.label}</span>
              </div>
            </div>
            <span className="text-xs font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
              {opt.count}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default SideAvaliability;
