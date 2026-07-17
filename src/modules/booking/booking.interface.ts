import { BookingStatus } from "../../../generated/prisma/enums";

export interface ICreateBooking {
  serviceId: string;
  availabilityId: string;
  serviceAddress: string;
}

export interface IUpdateBookingStatus {
  status: BookingStatus;
}

export interface IBookingQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: BookingStatus;
}