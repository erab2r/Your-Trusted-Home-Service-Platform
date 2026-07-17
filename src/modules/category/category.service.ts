import { prisma } from "../../lib/prisma";
import {
  ICreateCategory,
  IUpdateCategory,
} from "./category.interface";

const createCategory = async (payload: ICreateCategory) => {
  const existingCategory = await prisma.category.findUnique({
    where: {
      name: payload.name,
    },
  });

  if (existingCategory) {
    throw new Error("Category already exists.");
  }

  const category = await prisma.category.create({
    data: payload,
  });

  return category;
};

const getAllCategories = async () => {
  return await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

const updateCategory = async (
  categoryId: string,
  payload: IUpdateCategory
) => {
  await prisma.category.findUniqueOrThrow({
    where: {
      id: categoryId,
    },
  });

  if (payload.name) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: payload.name,
        NOT: {
          id: categoryId,
        },
      },
    });

    if (existingCategory) {
      throw new Error("Category name already exists.");
    }
  }

  const updatedCategory = await prisma.category.update({
    where: {
      id: categoryId,
    },
    data: payload,
  });

  return updatedCategory;
};

const deleteCategory = async (categoryId: string) => {
  await prisma.category.findUniqueOrThrow({
    where: {
      id: categoryId,
    },
  });

  const service = await prisma.service.findFirst({
    where: {
      categoryId,
    },
  });

  if (service) {
    throw new Error(
      "Cannot delete category because it is assigned to one or more services."
    );
  }

  return await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });
};

export const categoryService = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};