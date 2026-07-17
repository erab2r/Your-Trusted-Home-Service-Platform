import { PaymentStatus } from "../../../generated/prisma/enums";

export interface ICreateCheckoutSession {
  bookingId: string;
}

export interface IStripeMetadata {
  bookingId: string;
  paymentId: string;
}

export interface IPaymentQuery {
  page?: string;
  limit?: string;

  status?: PaymentStatus;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
}