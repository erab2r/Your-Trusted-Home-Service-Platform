import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { paginationHelper } from "../../utils/pagination";
import {
  ICreateService,
  IServiceQuery,
  IUpdateService,
} from "./service.interface";

const createService = async (
  userId: string,
  payload: ICreateService
) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  await prisma.category.findUniqueOrThrow({
    where: {
      id: payload.categoryId,
    },
  });

  const result = await prisma.service.create({
    data: {
      title: payload.title,
      description: payload.description,
      price: new Prisma.Decimal(payload.price),
      duration: payload.duration,
      categoryId: payload.categoryId,
      technicianId: technician.id,
    },
    include: {
      category: true,
      technician: {
        include: {
          user: {
            omit: {
              password: true,
            },
          },
        },
      },
    },
  });

  return result;
};

const getAllServices = async (query: IServiceQuery) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination({
      page: Number(query.page),
      limit: Number(query.limit),
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

  const whereConditions: Prisma.ServiceWhereInput = {
    isActive: true,
  };

  const andConditions: Prisma.ServiceWhereInput[] = [];

  // Search
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  // Category
  if (query.categoryId) {
    andConditions.push({
      categoryId: query.categoryId,
    });
  }

  // Technician Location
  if (query.location) {
    andConditions.push({
      technician: {
        location: {
          contains: query.location,
          mode: "insensitive",
        },
      },
    });
  }

  // Technician Rating
  if (query.minRating) {
    andConditions.push({
      technician: {
        averageRating: {
          gte: Number(query.minRating),
        },
      },
    });
  }

  // Price Filter
  if (query.minPrice || query.maxPrice) {
    const priceFilter: Prisma.DecimalFilter = {};

    if (query.minPrice) {
      priceFilter.gte = new Prisma.Decimal(query.minPrice);
    }

    if (query.maxPrice) {
      priceFilter.lte = new Prisma.Decimal(query.maxPrice);
    }

    andConditions.push({
      price: priceFilter,
    });
  }

  if (andConditions.length > 0) {
    whereConditions.AND = andConditions;
  }

  const services = await prisma.service.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      category: true,
      technician: {
        include: {
          user: {
            omit: {
              password: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.service.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: services,
  };
};
const getServiceById = async (serviceId: string) => {
  const result = await prisma.service.findFirstOrThrow({
    where: {
      id: serviceId,
      isActive: true,
    },
    include: {
      category: true,
      technician: {
        include: {
          user: {
            omit: {
              password: true,
            },
          },
          reviews: true,
          services: {
            where: {
              isActive: true,
            },
          },
        },
      },
    },
  });

  return result;
};

const getMyServices = async (userId: string) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  const result = await prisma.service.findMany({
    where: {
      technicianId: technician.id,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const updateService = async (
  serviceId: string,
  userId: string,
  payload: IUpdateService
) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  await prisma.service.findFirstOrThrow({
    where: {
      id: serviceId,
      technicianId: technician.id,
    },
  });

  const data: Prisma.ServiceUpdateInput = {
    ...payload,
  };

  if (payload.price !== undefined) {
    data.price = new Prisma.Decimal(payload.price);
  }

  const result = await prisma.service.update({
    where: {
      id: serviceId,
    },
    data,
    include: {
      category: true,
      technician: {
        include: {
          user: {
            omit: {
              password: true,
            },
          },
        },
      },
    },
  });

  return result;
};

const deleteService = async (
  serviceId: string,
  userId: string
) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  await prisma.service.findFirstOrThrow({
    where: {
      id: serviceId,
      technicianId: technician.id,
    },
  });

  await prisma.service.update({
    where: {
      id: serviceId,
    },
    data: {
      isActive: false,
    },
  });

  return null;
};

export const serviceService = {
  createService,
  getAllServices,
  getServiceById,
  getMyServices,
  updateService,
  deleteService,
};