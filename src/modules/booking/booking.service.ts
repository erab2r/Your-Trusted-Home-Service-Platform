import { Prisma } from "../../../generated/prisma/client";
import { BookingStatus, Role } from "../../../generated/prisma/enums";

import { prisma } from "../../lib/prisma";
import { paginationHelper } from "../../utils/pagination";
import {
  IBookingQuery,
  ICreateBooking,
} from "./booking.interface";

const createBooking = async (
  customerId: string,
  payload: ICreateBooking
) => {
  const service = await prisma.service.findFirstOrThrow({
    where: {
      id: payload.serviceId,
      isActive: true,
    },
  });

  const availability = await prisma.availability.findUniqueOrThrow({
    where: {
      id: payload.availabilityId,
    },
  });

  if (availability.isBooked) {
    throw new Error("This time slot is already booked.");
  }

  if (availability.technicianId !== service.technicianId) {
    throw new Error("Invalid availability for this technician.");
  }

  const result = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const booking = await tx.booking.create({
        data: {
          customerId,
          technicianId: service.technicianId,
          serviceId: service.id,
          availabilityId: availability.id,
          bookingDate: availability.startTime,

          serviceAddress: payload.serviceAddress,

          totalAmount: service.price,
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
        },
      });

      await tx.availability.update({
        where: {
          id: availability.id,
        },
        data: {
          isBooked: true,
        },
      });

      return booking;
    }
  );

  return result;
};

const getMyBookings = async (
  customerId: string,
  query: IBookingQuery
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination({
      page: Number(query.page),
      limit: Number(query.limit),
      sortBy: query.sortBy,
      sortOrder: query.sortOrder as "asc" | "desc",
    });

  const whereConditions: Prisma.BookingWhereInput = {
    customerId,
  };

  if (query.status) {
    whereConditions.status = query.status;
  }

  const bookings = await prisma.booking.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      service: true,
      availability: true,
      payment: true,
      review: true,
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

  const total = await prisma.booking.count({
    where: whereConditions,
  });

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
const getBookingById = async (
  bookingId: string,
  userId: string
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  const whereCondition: Prisma.BookingWhereInput = {
    id: bookingId,
  };

  if (user.role === Role.CUSTOMER) {
    whereCondition.customerId = userId;
  }

  if (user.role === Role.TECHNICIAN) {
    const technician = await prisma.technicianProfile.findUniqueOrThrow({
      where: {
        userId,
      },
    });

    whereCondition.technicianId = technician.id;
  }

  const booking = await prisma.booking.findFirstOrThrow({
    where: whereCondition,
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

  return booking;
};

const getTechnicianBookings = async (
  userId: string,
  query: IBookingQuery
) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination({
      page: Number(query.page),
      limit: Number(query.limit),
      sortBy: query.sortBy,
      sortOrder: query.sortOrder as "asc" | "desc",
    });

  const whereConditions: Prisma.BookingWhereInput = {
    technicianId: technician.id,
  };

  if (query.status) {
    whereConditions.status = query.status;
  }

  const bookings = await prisma.booking.findMany({
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
      service: true,
      payment: true,
      review: true,
      availability: true,
    },
  });

  const total = await prisma.booking.count({
    where: whereConditions,
  });

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

const updateBookingStatus = async (
  bookingId: string,
  userId: string,
  status: BookingStatus
) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  const booking = await prisma.booking.findFirstOrThrow({
    where: {
      id: bookingId,
      technicianId: technician.id,
    },
  });

  const allowedTransitions: Record<
    BookingStatus,
    BookingStatus[]
  > = {
    REQUESTED: [
      BookingStatus.ACCEPTED,
      BookingStatus.DECLINED,
    ],
    ACCEPTED: [
      BookingStatus.IN_PROGRESS,
    ],
    PAID: [
      BookingStatus.IN_PROGRESS,
      BookingStatus.COMPLETED
    ],
    IN_PROGRESS: [
      BookingStatus.COMPLETED,
    ],
    COMPLETED: [],
    DECLINED: [],
    CANCELED: [],
  };

  if (
    !allowedTransitions[booking.status].includes(status)
  ) {
    throw new Error(
      `Cannot change booking status from ${booking.status} to ${status}.`
    );
  }

  const result = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status,
    },
    include: {
      customer: {
        omit: {
          password: true,
        },
      },
      service: true,
      payment: true,
    },
  });

  return result;
};
const cancelBooking = async (
  bookingId: string,
  customerId: string
) => {
  const booking = await prisma.booking.findFirstOrThrow({
    where: {
      id: bookingId,
      customerId,
    },
  });

  if (
    booking.status === BookingStatus.IN_PROGRESS ||
    booking.status === BookingStatus.COMPLETED ||
    booking.status === BookingStatus.DECLINED ||
    booking.status === BookingStatus.CANCELED
  ) {
    throw new Error(
      `Booking cannot be cancelled when status is ${booking.status}.`
    );
  }

  const result = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const updatedBooking = await tx.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          status: BookingStatus.CANCELED,
        },
        include: {
          service: true,
          payment: true,
          review: true,
        },
      });

      await tx.availability.update({
        where: {
          id: booking.availabilityId,
        },
        data: {
          isBooked: false,
        },
      });

      return updatedBooking;
    }
  );

  return result;
};

export const bookingService = {
  createBooking,
  getMyBookings,
  getBookingById,
  getTechnicianBookings,
  updateBookingStatus,
  cancelBooking,
};