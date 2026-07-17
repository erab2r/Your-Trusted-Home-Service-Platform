import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { paginationHelper } from "../../utils/pagination";
import {
  ITechnicianQuery,
  IUpdateTechnicianProfile,
} from "./technician.interface";

const getAllTechnicians = async (query: ITechnicianQuery) => {
  const { searchTerm, location, minRating } = query;

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination({
      page: Number(query.page),
      limit: Number(query.limit),
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

  const whereConditions: Prisma.TechnicianProfileWhereInput = {};

  const andConditions: Prisma.TechnicianProfileWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          user: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          bio: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          skills: {
            has: searchTerm,
          },
        },
      ],
    });
  }

  if (location) {
    andConditions.push({
      location: {
        contains: location,
        mode: "insensitive",
      },
    });
  }

  if (minRating) {
    andConditions.push({
      averageRating: {
        gte: Number(minRating),
      },
    });
  }

  if (andConditions.length > 0) {
    whereConditions.AND = andConditions;
  }

  const result = await prisma.technicianProfile.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      user: {
        omit: {
          password: true,
        },
      },
      services: {
        include: {
          category: true,
        },
      },
    },
  });

  const total = await prisma.technicianProfile.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getTechnicianById = async (id: string) => {
  const result = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      user: {
        omit: {
          password: true,
        },
      },
      services: {
        include: {
          category: true,
        },
      },
      availabilities: true,
      reviews: {
        include: {
          customer: {
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

const getMyTechnicianProfile = async (userId: string) => {
  const result = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
    include: {
      user: {
        omit: {
          password: true,
        },
      },
      services: {
        include: {
          category: true,
        },
      },
      availabilities: true,
      reviews: true,
    },
  });

  return result;
};

const updateTechnicianProfile = async (
  userId: string,
  payload: IUpdateTechnicianProfile
) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  const result = await prisma.technicianProfile.update({
    where: {
      id: technician.id,
    },
    data: payload,
    include: {
      user: {
        omit: {
          password: true,
        },
      },
      services: true,
      availabilities: true,
    },
  });

  return result;
};

export const technicianService = {
  getAllTechnicians,
  getTechnicianById,
  getMyTechnicianProfile,
  updateTechnicianProfile,
};