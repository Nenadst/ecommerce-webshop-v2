import { useMutation, useQuery, Reference } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { GET_PRODUCT, UPDATE_PRODUCT } from '@/entities/product/api/product.queries';
import { GET_CATEGORIES } from '@/entities/category/api/category.queries';
import { Product } from '@/entities/product/types/product.types';
import { Category } from '@/entities/category/types/category.types';
import { useActivityTracker } from '@/shared/hooks/useActivityTracker';
import { TranslationFields, TranslationsState } from './useAddProductForm';

const emptyTranslations = (): TranslationsState => ({
  en: { name: '', description: '' },
  fr: { name: '', description: '' },
  nl: { name: '', description: '' },
});

export function useEditProductForm() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const { trackActivity } = useActivityTracker();

  const { data: productData, loading: productLoading } = useQuery<{ product: Product }>(
    GET_PRODUCT,
    { variables: { id: productId } }
  );
  const { data: categoriesData, loading: categoriesLoading } = useQuery<{ categories: Category[] }>(
    GET_CATEGORIES
  );

  const [form, setForm] = useState({
    translations: emptyTranslations(),
    price: '',
    hasDiscount: false,
    discountPrice: '',
    quantity: '',
    categoryId: '',
    existingImages: [] as string[],
    files: [] as File[],
    imagePreviews: [] as string[],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (productData?.product) {
      const product = productData.product;

      // Build translations state from the fetched translations array
      const translationsState = emptyTranslations();
      if (product.translations?.length) {
        product.translations.forEach((t) => {
          const locale = t.locale as 'en' | 'fr' | 'nl';
          if (locale in translationsState) {
            translationsState[locale] = {
              name: t.name,
              description: t.description ?? '',
            };
          }
        });
      } else {
        // Fallback: populate EN from legacy columns
        translationsState.en = {
          name: product.name,
          description: product.description ?? '',
        };
      }

      setForm({
        translations: translationsState,
        price: product.price.toString(),
        hasDiscount: product.hasDiscount ?? false,
        discountPrice: product.discountPrice?.toString() ?? '',
        quantity: product.quantity.toString(),
        categoryId: product.category?.id ?? '',
        existingImages: product.images ?? [],
        files: [],
        imagePreviews: [],
      });
    }
  }, [productData]);

  const [updateProduct, { loading: updateLoading }] = useMutation(UPDATE_PRODUCT, {
    update(cache, { data }) {
      if (!data?.updateProduct) return;
      const updated = data.updateProduct;
      cache.modify({
        fields: {
          products(existing, { readField, toReference }) {
            const list = Array.isArray(existing) ? existing : [];
            return list.map((item: Reference) =>
              readField('id', item) === updated.id
                ? toReference({ __typename: 'Product', id: updated.id })
                : item
            );
          },
        },
      });
    },
  });

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((file) => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 2MB`);
        return false;
      }
      return true;
    });
    setForm((f) => {
      const availableSlots = 8 - (f.existingImages.length + f.files.length);
      const newFiles = [...f.files, ...validFiles].slice(0, availableSlots);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      return { ...f, files: newFiles, imagePreviews: newPreviews };
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExistingImageRemove = (index: number) => {
    setForm((f) => ({ ...f, existingImages: f.existingImages.filter((_, i) => i !== index) }));
  };

  const handleNewImageRemove = (index: number) => {
    setForm((f) => ({
      ...f,
      files: f.files.filter((_, i) => i !== index),
      imagePreviews: f.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  const handleAllImagesReorder = (oldIndex: number, newIndex: number) => {
    setForm((f) => {
      const allImages = [...f.existingImages, ...f.imagePreviews];
      const [moved] = allImages.splice(oldIndex, 1);
      allImages.splice(newIndex, 0, moved);
      const existingCount = f.existingImages.length;
      return {
        ...f,
        existingImages: allImages.slice(0, existingCount),
        imagePreviews: allImages.slice(existingCount),
      };
    });
  };

  const handleImageClear = () => {
    setForm((f) => ({ ...f, files: [], imagePreviews: [], existingImages: [] }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTranslationChange = (
    locale: 'en' | 'fr' | 'nl',
    field: keyof TranslationFields,
    value: string
  ) => {
    setForm((f) => ({
      ...f,
      translations: {
        ...f.translations,
        [locale]: { ...f.translations[locale], [field]: value },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;

    try {
      if (!form.translations.en.name.trim()) {
        toast.error('English product name is required');
        submittingRef.current = false;
        return;
      }

      const price = parseFloat(form.price);
      const discountPrice = form.discountPrice ? parseFloat(form.discountPrice) : null;

      if (price <= 0) {
        toast.error('Price must be greater than 0');
        submittingRef.current = false;
        return;
      }
      if (form.hasDiscount && discountPrice !== null && discountPrice <= 0) {
        toast.error('Discount price must be greater than 0');
        submittingRef.current = false;
        return;
      }
      if (form.hasDiscount && discountPrice !== null && discountPrice >= price) {
        toast.error('Discount price must be less than the regular price');
        submittingRef.current = false;
        return;
      }

      const newImagesBase64 = await Promise.all(form.files.map((file) => convertToBase64(file)));
      const allImages = [...form.existingImages, ...newImagesBase64];

      const translations = (['en', 'fr', 'nl'] as const)
        .filter((l) => form.translations[l].name.trim())
        .map((l) => ({
          locale: l,
          name: form.translations[l].name.trim(),
          description: form.translations[l].description.trim() || undefined,
        }));

      await updateProduct({
        variables: {
          id: productId,
          input: {
            translations,
            price,
            hasDiscount: form.hasDiscount,
            discountPrice,
            quantity: parseInt(form.quantity),
            images: allImages,
            categoryId: form.categoryId,
          },
        },
      });

      trackActivity({
        action: 'ADMIN_ACTION',
        description: `Updated product: ${form.translations.en.name}`,
        metadata: {
          action: 'UPDATE_PRODUCT',
          productId,
          productName: form.translations.en.name,
          price,
          quantity: parseInt(form.quantity),
        },
      });

      toast.success('Product updated successfully!');
      router.push('/admin/products');
    } catch (error) {
      toast.error('Failed to update product');
      console.error(error);
      submittingRef.current = false;
    }
  };

  return {
    form,
    setForm,
    categoriesData,
    fileInputRef,
    handleSubmit,
    handleImageClear,
    handleFileChange,
    handleExistingImageRemove,
    handleNewImageRemove,
    handleAllImagesReorder,
    handleInputChange,
    handleTranslationChange,
    productLoading,
    categoriesLoading,
    updateLoading,
    router,
  };
}
