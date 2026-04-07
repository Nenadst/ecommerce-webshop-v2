import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  console.log(`Seeding translations for ${products.length} products...`);

  let created = 0;
  for (const product of products) {
    await prisma.productTranslation.upsert({
      where: { productId_locale: { productId: product.id, locale: 'en' } },
      update: {},
      create: {
        productId: product.id,
        locale: 'en',
        name: product.name,
        description: product.description,
      },
    });
    created++;
  }

  console.log(`✓ Created ${created} English translations`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
