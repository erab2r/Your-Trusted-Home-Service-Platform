
import {
  ActiveStatus,
  PaymentStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { paginationHelper } from "../../utils/pagination";

const getAllUsers = async (query: any) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination({
      page: Number(query.page),
      limit: Number(query.limit),
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

  const users = await prisma.user.findMany({
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    omit: {
      password: true,
    },
  });

  const total = await prisma.user.count();

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: users,
  };
};

const getUserById = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
    include: {
      technicianProfile: true,
      bookings: {
        include: {
          service: true,
          payment: true,
        },
      },
      reviews: true,
    },
  });

  return user;
};

const updateUserStatus = async (
  userId: string,
  status: ActiveStatus
) => {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      activeStatus: status,
    },
    omit: {
      password: true,
    },
  });

  return user;
};

const getAllBookings = async (query: any) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination({
      page: Number(query.page),
      limit: Number(query.limit),
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

  const bookings = await prisma.booking.findMany({
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      customer: {
        omit: {
          password: true,
        },
      },
      technician: {
        include: {
          user: {
            omit: {
              password: true,
            },
          },
        },
      },
      service: true,
      payment: true,
    },
  });

  const total = await prisma.booking.count();

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: bookings,
  };
};

const getBookingById = async (bookingId: string) => {
  return prisma.booking.findUniqueOrThrow({
    where: {
      id: bookingId,
    },
    include: {
      customer: {
        omit: {
          password: true,
        },
      },
      technician: {
        include: {
          user: {
            omit: {
              password: true,
            },
          },
        },
      },
      service: true,
      availability: true,
      payment: true,
      review: true,
    },
  });
};




export const adminService = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  getAllBookings,
  getBookingById,
};