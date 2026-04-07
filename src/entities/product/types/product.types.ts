import { Category } from '../../category/types/category.types';

export type ProductTranslation = {
  locale: string;
  name: string;
  description?: string;
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  hasDiscount?: boolean;
  discountPrice?: number;
  quantity: number;
  images?: string[];
  category: Category;
  translations?: ProductTranslation[];
  file?: File | null;
};
