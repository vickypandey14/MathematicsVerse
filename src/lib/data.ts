import prisma from '@/lib/prisma';

export async function getCategories() {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: { formulas: true },
      },
    },
  });
}

export async function getFeaturedFormulas() {
  return await prisma.formula.findMany({
    where: { featured: true },
    include: { category: true },
    take: 6,
  });
}

export async function getFormulaBySlug(slug: string) {
  return await prisma.formula.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export async function getFormulasByCategory(categorySlug: string) {
  return await prisma.formula.findMany({
    where: {
      category: {
        slug: categorySlug,
      },
    },
    include: { category: true },
  });
}

export async function searchFormulas(query: string) {
  return await prisma.formula.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { explanation: { contains: query } },
      ],
    },
    include: { category: true },
  });
}

export async function getFormulasByIds(ids: string[]) {
  return await prisma.formula.findMany({
    where: {
      id: { in: ids },
    },
    include: { category: true },
  });
}
