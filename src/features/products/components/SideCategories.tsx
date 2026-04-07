'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  category: {
    id: string;
    name: string;
  };
}

interface SideCategoriesProps {
  selectedCategories: string[];
  onCategoriesChange: (categoryIds: string[]) => void;
  allProducts?: Product[];
}

const SideCategories = ({
  selectedCategories,
  onCategoriesChange,
  allProducts = [],
}: SideCategoriesProps) => {
  const t = useTranslations('products');
  const categories = useMemo(() => {
    const uniqueCategories = new Map<string, Category>();
    allProducts.forEach((product) => {
      if (product.category && !uniqueCategories.has(product.category.id)) {
        uniqueCategories.set(product.category.id, {
          id: product.category.id,
          name: product.category.name,
        });
      }
    });
    return Array.from(uniqueCategories.values());
  }, [allProducts]);

  const getCategoryCount = (categoryId: string) => {
    return allProducts.filter((p) => p.category.id === categoryId).length;
  };

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-900 font-bold text-sm uppercase tracking-wider">
          {t('categories')}
        </h3>
        {selectedCategories.length > 0 && (
          <button
            onClick={() => onCategoriesChange([])}
            className="text-amber-500 text-xs font-medium hover:text-amber-600 transition-colors"
          >
            {t('clearFilter')}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <button
          onClick={() => onCategoriesChange([])}
          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm transition-all ${
            selectedCategories.length === 0
              ? 'bg-amber-500 text-white font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <span>{t('allCategories')}</span>
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
              selectedCategories.length === 0
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {allProducts.length}
          </span>
        </button>

        {categories
          .filter((category) => getCategoryCount(category.id) > 0)
          .map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{category.name}</span>
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {getCategoryCount(category.id)}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default SideCategories;
