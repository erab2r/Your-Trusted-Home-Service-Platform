import { Prisma } from "../../../generated/prisma/client";
import {
  BookingStatus,
  PaymentStatus,
} from "../../../generated/prisma/enums";

import { prisma } from "../../lib/prisma";
import { paginationHelper } from "../../utils/pagination";
import {
  ICreateReview,
  IReviewQuery,
} from "./review.interface";

const createReview = async (
  userId: string,
  payload: ICreateReview
) => {
  if (payload.rating < 1 || payload.rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: payload.bookingId,
      customerId: userId,
      status: BookingStatus.COMPLETED,
      payment: {
        status: PaymentStatus.COMPLETED,
      },
    },
    include: {
      technician: true,
      payment: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  const bookingCompleted =
    booking.status === BookingStatus.COMPLETED ||
    (booking.payment?.status === PaymentStatus.COMPLETED &&
      new Date(booking.bookingDate) <= new Date());

  if (!bookingCompleted) {
    throw new Error(
      "Review can only be submitted after the service is completed."
    );
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      bookingId: booking.id,
    },
  });

  if (existingReview) {
    throw new Error("Review already submitted.");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        bookingId: booking.id,
        customerId: userId,
        technicianId: booking.technicianId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    const aggregate = await tx.review.aggregate({
      where: {
        technicianId: booking.technicianId,
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    await tx.technicianProfile.update({
      where: {
        id: booking.technicianId,
      },
      data: {
        averageRating: Number(
          (aggregate._avg.rating ?? 0).toFixed(2)
        ),
        totalReviews: aggregate._count.id,
      },
    });

    return tx.review.findUnique({
      where: {
        bookingId: booking.id,
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
        booking: {
          include: {
            service: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });
  });
  return result;
};
const getTechnicianReviews = async (
  technicianId: string,
  query: IReviewQuery
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination({
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      sortBy: query.sortBy || "createdAt",
      sortOrder: query.sortOrder || "desc",
    });

  const whereConditions: Prisma.ReviewWhereInput = {
    technicianId,
  };

  const reviews = await prisma.review.findMany({
    where: whereConditions,
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
      booking: {
        include: {
          service: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.review.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: reviews,
  };
};
const getMyReviews = async (
  userId: string,
  query: IReviewQuery
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination({
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      sortBy: query.sortBy || "createdAt",
      sortOrder: query.sortOrder || "desc",
    });

  const whereConditions: Prisma.ReviewWhereInput = {
    customerId: userId,
  };

  const reviews = await prisma.review.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      booking: {
        include: {
          service: {
            include: {
              category: true,
            },
          },
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
    },
  });

  const total = await prisma.review.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: reviews,
  };
};

export const reviewService = {
  createReview,
  getTechnicianReviews,
  getMyReviews,
};