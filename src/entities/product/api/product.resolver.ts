import { prisma } from '@/shared/lib/prisma';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const getUserFromToken = (req: NextRequest): string | null => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
};

type ProductTranslationInput = {
  locale: string;
  name: string;
  description?: string;
};

type CreateProductInput = {
  input: {
    name?: string;
    description?: string;
    translations?: ProductTranslationInput[];
    price: number;
    hasDiscount?: boolean;
    discountPrice?: number;
    quantity: number;
    images?: string[];
    categoryId: string;
  };
};

type UpdateProductInput = {
  name?: string;
  description?: string;
  translations?: ProductTranslationInput[];
  price: number;
  hasDiscount?: boolean;
  discountPrice?: number;
  quantity: number;
  images?: string[];
  categoryId: string;
};

type DeleteProductArgs = {
  id: string;
};

type ProductFilter = {
  categoryId?: string;
  categoryIds?: string[];
  name?: string;
  minPrice?: number;
  maxPrice?: number;
};

type Context = {
  req: NextRequest;
  locale: string;
};

type ProductWithTranslations = {
  id: string;
  name: string;
  description?: string | null;
  translations?: Array<{ locale: string; name: string; description?: string | null }>;
};

/** Resolve name/description by locale, falling back to 'en' then the raw column */
function resolveTranslated(
  product: ProductWithTranslations,
  field: 'name' | 'description',
  locale: string
): string | null {
  const translations = product.translations ?? [];
  const match =
    translations.find((t) => t.locale === locale) ?? translations.find((t) => t.locale === 'en');
  if (match) return match[field] ?? null;
  // Fallback to the legacy column on the product itself
  return product[field] ?? null;
}

const PRODUCT_INCLUDE = {
  category: true,
  translations: true,
} as const;

const productResolvers = {
  // Field-level resolvers — called after any Query returns a Product
  Product: {
    name: (parent: ProductWithTranslations, _args: unknown, context: Context) =>
      resolveTranslated(parent, 'name', context.locale) ?? '',
    description: (parent: ProductWithTranslations, _args: unknown, context: Context) =>
      resolveTranslated(parent, 'description', context.locale),
    translations: (parent: ProductWithTranslations) => parent.translations ?? [],
  },

  Query: {
    userFavorites: async (_: unknown, __: unknown, context: Context) => {
      const userId = getUserFromToken(context.req);
      if (!userId) return [];

      const favorites = await prisma.userFavorite.findMany({
        where: { userId },
        select: { productId: true },
      });

      return favorites.map((fav) => fav.productId);
    },

    favoriteProducts: async (_: unknown, __: unknown, context: Context) => {
      const userId = getUserFromToken(context.req);
      if (!userId) return [];

      const favorites = await prisma.userFavorite.findMany({
        where: { userId },
        select: { productId: true },
      });

      const productIds = favorites.map((fav) => fav.productId);
      if (productIds.length === 0) return [];

      return prisma.product.findMany({
        where: { id: { in: productIds } },
        include: PRODUCT_INCLUDE,
        orderBy: { createdAt: 'desc' },
      });
    },

    products: async (
      _: unknown,
      {
        page = 1,
        limit = 10,
        filter = {},
        sort = { field: 'createdAt', order: -1 },
      }: {
        page?: number;
        limit?: number;
        filter?: ProductFilter;
        sort?: { field: string; order: 1 | -1 };
      }
    ) => {
      const where: Record<string, unknown> = {};

      if (filter.name) {
        // Search across translations AND the legacy name column
        where.OR = [
          { name: { contains: filter.name, mode: 'insensitive' } },
          {
            translations: {
              some: { name: { contains: filter.name, mode: 'insensitive' } },
            },
          },
        ];
      }

      if (filter.categoryIds && filter.categoryIds.length > 0) {
        where.categoryId = { in: filter.categoryIds };
      } else if (filter.categoryId) {
        where.categoryId = filter.categoryId;
      }

      if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
        const priceFilter: { gte?: number; lte?: number } = {};
        if (filter.minPrice !== undefined) priceFilter.gte = filter.minPrice;
        if (filter.maxPrice !== undefined) priceFilter.lte = filter.maxPrice;
        where.price = priceFilter;
      }

      const skip = (page - 1) * limit;
      const orderBy = { [sort.field]: sort.order === 1 ? 'asc' : 'desc' };

      const [items, total] = await Promise.all([
        prisma.product.findMany({ where, orderBy, skip, take: limit, include: PRODUCT_INCLUDE }),
        prisma.product.count({ where }),
      ]);

      return { items, total, page, totalPages: Math.ceil(total / limit) };
    },

    product: async (_: unknown, { id }: { id: string }) => {
      return prisma.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
    },

    productsByIds: async (_: unknown, { ids }: { ids: string[] }) => {
      if (!ids || ids.length === 0) return [];
      return prisma.product.findMany({
        where: { id: { in: ids } },
        include: PRODUCT_INCLUDE,
      });
    },
  },

  Mutation: {
    createProduct: async (_: unknown, args: CreateProductInput) => {
      const { translations, name, description, ...rest } = args.input;

      // Derive a canonical English name for the legacy column (required for backward-compat)
      const enTranslation = translations?.find((t) => t.locale === 'en');
      const canonicalName = enTranslation?.name ?? name ?? '';
      const canonicalDescription = enTranslation?.description ?? description;

      const product = await prisma.product.create({
        data: {
          ...rest,
          name: canonicalName,
          description: canonicalDescription,
          hasDiscount: rest.hasDiscount ?? false,
          images: rest.images ?? [],
          translations: translations?.length
            ? {
                create: translations.map((t) => ({
                  locale: t.locale,
                  name: t.name,
                  description: t.description,
                })),
              }
            : // Auto-create an 'en' translation from the legacy fields if no translations provided
              canonicalName
              ? {
                  create: [
                    {
                      locale: 'en',
                      name: canonicalName,
                      description: canonicalDescription,
                    },
                  ],
                }
              : undefined,
        },
        include: PRODUCT_INCLUDE,
      });

      return product;
    },

    deleteProduct: async (_: unknown, { id }: DeleteProductArgs) => {
      try {
        const cartItems = await prisma.cartItem.findFirst({ where: { productId: id } });
        if (cartItems) {
          throw new Error(
            'Cannot delete this product because it is currently in one or more shopping carts.'
          );
        }

        const orderItems = await prisma.orderItem.findFirst({ where: { productId: id } });
        if (orderItems) {
          throw new Error('Cannot delete this product because it exists in order history.');
        }

        await prisma.product.delete({ where: { id } });
        return true;
      } catch (error: unknown) {
        console.error('Failed to delete product:', error);
        if (error instanceof Error && error.message.includes('Cannot delete this product')) {
          throw error;
        }
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
          throw new Error('Cannot delete this product because it is referenced by other records.');
        }
        throw new Error('Failed to delete product');
      }
    },

    updateProduct: async (_: unknown, { id, input }: { id: string; input: UpdateProductInput }) => {
      const { translations, name, description, ...rest } = input;

      const enTranslation = translations?.find((t) => t.locale === 'en');
      const canonicalName = enTranslation?.name ?? name;
      const canonicalDescription = enTranslation?.description ?? description;

      const updateData: Record<string, unknown> = { ...rest };
      if (canonicalName !== undefined) updateData.name = canonicalName;
      if (canonicalDescription !== undefined) updateData.description = canonicalDescription;

      // Upsert each translation
      if (translations?.length) {
        await Promise.all(
          translations
            .filter((t) => t.name.trim())
            .map((t) =>
              prisma.productTranslation.upsert({
                where: { productId_locale: { productId: id, locale: t.locale } },
                update: { name: t.name, description: t.description },
                create: {
                  productId: id,
                  locale: t.locale,
                  name: t.name,
                  description: t.description,
                },
              })
            )
        );
      }

      const updated = await prisma.product.update({
        where: { id },
        data: updateData,
        include: PRODUCT_INCLUDE,
      });

      return updated;
    },

    toggleFavorite: async (_: unknown, { productId }: { productId: string }, context: Context) => {
      const userId = getUserFromToken(context.req);
      if (!userId) throw new Error('Authentication required');

      const existing = await prisma.userFavorite.findUnique({
        where: { userId_productId: { userId, productId } },
      });

      if (existing) {
        await prisma.userFavorite.delete({ where: { id: existing.id } });
        return false;
      } else {
        await prisma.userFavorite.create({ data: { userId, productId } });
        return true;
      }
    },
  },
};

export default productResolvers;
