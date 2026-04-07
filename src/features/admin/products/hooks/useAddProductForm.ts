import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { CREATE_PRODUCT } from '@/entities/product/api/product.queries';
import { useActivityTracker } from '@/shared/hooks/useActivityTracker';

export type TranslationFields = { name: string; description: string };
export type TranslationsState = {
  en: TranslationFields;
  fr: TranslationFields;
  nl: TranslationFields;
};

const emptyTranslations = (): TranslationsState => ({
  en: { name: '', description: '' },
  fr: { name: '', description: '' },
  nl: { name: '', description: '' },
});

export function useAddProductForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { trackActivity } = useActivityTracker();

  const [form, setForm] = useState({
    translations: emptyTranslations(),
    price: '',
    hasDiscount: false,
    discountPrice: '',
    quantity: '',
    categoryId: '',
    files: [] as File[],
    imagePreviews: [] as string[],
  });
  const [loadingUpload, setLoadingUpload] = useState(false);

  const [createProduct, { loading }] = useMutation(CREATE_PRODUCT, {
    update(cache, { data: { createProduct } }) {
      cache.modify({
        fields: {
          products(existingProductsRef = {}, { toReference }) {
            const oldItems = existingProductsRef.items ?? [];
            return {
              ...existingProductsRef,
              items: [...oldItems, toReference({ __typename: 'Product', id: createProduct.id })],
              total: (existingProductsRef.total ?? 0) + 1,
            };
          },
        },
      });
    },
  });

  const convertToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }, []);

  const handleUpload = useCallback(async (): Promise<string[]> => {
    if (form.files.length === 0) return [];
    setLoadingUpload(true);
    try {
      const base64Images = await Promise.all(form.files.map((file) => convertToBase64(file)));
      setLoadingUpload(false);
      return base64Images;
    } catch (error) {
      console.error('Failed to convert images:', error);
      setLoadingUpload(false);
      toast.error('Failed to process images');
      return [];
    }
  }, [form.files, convertToBase64]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((file) => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 2MB`);
        return false;
      }
      return true;
    });
    setForm((f) => {
      const newFiles = [...f.files, ...validFiles].slice(0, 8);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      return { ...f, files: newFiles, imagePreviews: newPreviews };
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleImageRemove = useCallback((index: number) => {
    setForm((f) => ({
      ...f,
      files: f.files.filter((_, i) => i !== index),
      imagePreviews: f.imagePreviews.filter((_, i) => i !== index),
    }));
  }, []);

  const handleImageReorder = useCallback((oldIndex: number, newIndex: number) => {
    setForm((f) => {
      const newFiles = [...f.files];
      const newPreviews = [...f.imagePreviews];
      const [movedFile] = newFiles.splice(oldIndex, 1);
      const [movedPreview] = newPreviews.splice(oldIndex, 1);
      newFiles.splice(newIndex, 0, movedFile);
      newPreviews.splice(newIndex, 0, movedPreview);
      return { ...f, files: newFiles, imagePreviews: newPreviews };
    });
  }, []);

  const handleImageClear = useCallback(() => {
    setForm((f) => ({ ...f, files: [], imagePreviews: [] }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;
      setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    },
    []
  );

  const handleTranslationChange = useCallback(
    (locale: 'en' | 'fr' | 'nl', field: 'name' | 'description', value: string) => {
      setForm((f) => ({
        ...f,
        translations: {
          ...f.translations,
          [locale]: { ...f.translations[locale], [field]: value },
        },
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (!form.translations.en.name.trim()) {
          toast.error('English product name is required');
          return;
        }

        const price = parseFloat(form.price);
        const discountPrice = form.discountPrice ? parseFloat(form.discountPrice) : null;

        if (price <= 0) {
          toast.error('Price must be greater than 0');
          return;
        }
        if (form.hasDiscount && discountPrice !== null && discountPrice <= 0) {
          toast.error('Discount price must be greater than 0');
          return;
        }
        if (form.hasDiscount && discountPrice !== null && discountPrice >= price) {
          toast.error('Discount price must be less than the regular price');
          return;
        }

        const imageUrls = form.files.length > 0 ? await handleUpload() : [];

        // Build translations array — include only locales that have a name filled in
        const translations = (['en', 'fr', 'nl'] as const)
          .filter((l) => form.translations[l].name.trim())
          .map((l) => ({
            locale: l,
            name: form.translations[l].name.trim(),
            description: form.translations[l].description.trim() || undefined,
          }));

        const result = await createProduct({
          variables: {
            input: {
              translations,
              price,
              hasDiscount: form.hasDiscount,
              discountPrice,
              quantity: parseInt(form.quantity),
              categoryId: form.categoryId,
              images: imageUrls,
            },
          },
        });

        trackActivity({
          action: 'ADMIN_ACTION',
          description: `Created product: ${form.translations.en.name}`,
          metadata: {
            action: 'CREATE_PRODUCT',
            productId: result.data?.createProduct?.id,
            productName: form.translations.en.name,
            price,
            quantity: parseInt(form.quantity),
          },
        });

        setForm({
          translations: emptyTranslations(),
          price: '',
          hasDiscount: false,
          discountPrice: '',
          quantity: '',
          categoryId: '',
          files: [],
          imagePreviews: [],
        });
        toast.success('Product created successfully');
        router.push('/admin/products');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Something went wrong.');
      }
    },
    [form, createProduct, handleUpload, router, trackActivity]
  );

  return {
    form,
    setForm,
    fileInputRef,
    handleFileChange,
    handleImageClear,
    handleImageRemove,
    handleImageReorder,
    handleInputChange,
    handleTranslationChange,
    handleSubmit,
    loading,
    router,
    loadingUpload,
  };
}
