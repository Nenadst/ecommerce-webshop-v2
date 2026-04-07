'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { Dropdown } from '../elements/Dropdown';
import { DropdownItem } from '../elements/types/dropdown.types';
import { GET_CATEGORIES } from '@/entities/category/api/category.queries';
import { GET_PRODUCTS } from '@/entities/product/api/product.queries';
import { Category } from '@/entities/category/types/category.types';
import { CategoriesDropdownProps } from './types/categories-dropdown.types';
import { useTranslations } from 'next-intl';

export const CategoriesDropdown: React.FC<CategoriesDropdownProps> = ({ className = '' }) => {
  const t = useTranslations('navigation');
  const { data, loading, error } = useQuery<{ categories: Category[] }>(GET_CATEGORIES);
  const { data: productsData } = useQuery(GET_PRODUCTS, {
    variables: {
      page: 1,
      limit: 1000,
      filter: {},
      sort: { field: 'createdAt', order: -1 },
    },
  });

  const categories = data?.categories || [];
  const allProducts = productsData?.products?.items || [];

  const getCategoryCount = (categoryId: string) => {
    return allProducts.filter((p: { category: { id: string } }) => p.category.id === categoryId)
      .length;
  };

  const categoriesWithProducts = categories.filter((category) => getCategoryCount(category.id) > 0);

  const categoryItems: DropdownItem[] = [
    {
      id: 'all',
      label: t('allCategories'),
      href: '/products',
      description: t('browseAllProducts'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    ...categoriesWithProducts.map((category) => ({
      id: category.id,
      label: category.name,
      href: `/products?category=${category.id}`,
      description: t('productsAvailable', { count: getCategoryCount(category.id) }),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
    })),
  ];

  const trigger = (
    <div className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm px-5 py-2.5 rounded-full cursor-pointer transition-all duration-200 shadow-sm shadow-amber-500/30 group select-none">
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
      {t('browseCategories')}
      <svg
        className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:rotate-180"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );

  return (
    <div className={className}>
      <Dropdown
        trigger={trigger}
        items={categoryItems}
        loading={loading}
        emptyMessage={error ? t('failedLoadCategories') : t('noCategoriesAvailable')}
        dropdownClassName="border-0 shadow-2xl"
        maxHeight="max-h-96"
        placement="bottom-left"
        openOnHover={true}
        showSearch={categoriesWithProducts.length > 8}
      />
    </div>
  );
};
