import {
  ActiveStatus,
  BookingStatus,
  PaymentStatus,
  Role,
} from "../../../generated/prisma/enums";

export interface IAdminQuery {
  page?: string;
  limit?: string;

  searchTerm?: string;

  role?: Role;
  activeStatus?: ActiveStatus;

  bookingStatus?: BookingStatus;
  paymentStatus?: PaymentStatus;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
}