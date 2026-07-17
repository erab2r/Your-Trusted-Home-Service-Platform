import { z } from "zod";
import { ActiveStatus, BookingStatus, Role, WeekDay } from "../../generated/prisma/enums";

const objectIdSchema = z.string().trim().min(1, "Value is required");

const emailSchema = z.string().trim().email("Please provide a valid email");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters");
const phoneSchema = z.string().trim().min(7, "Phone must be at least 7 characters").optional();
const addressSchema = z.string().trim().min(3, "Address must be at least 3 characters").optional();

export const authSchemas = {
  login: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
};

export const userSchemas = {
  register: z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    phone: phoneSchema,
    address: addressSchema,
    role: z.nativeEnum(Role),
  }),
  updateProfile: z.object({
    name: nameSchema.optional(),
    phone: phoneSchema,
    address: addressSchema,
    profilePhoto: z.string().trim().url("Please provide a valid URL").optional(),
    email: z.string().trim().email("Please provide a valid email").optional(),
  }).superRefine((data, ctx) => {
    if (data.email !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Email cannot be updated",
      });
    }
  }),
};

export const categorySchemas = {
  create: z.object({
    name: z.string().trim().min(2, "Category name must be at least 2 characters"),
    description: z.string().trim().min(5, "Description must be at least 5 characters").optional(),
  }),
  update: z.object({
    name: z.string().trim().min(2, "Category name must be at least 2 characters").optional(),
    description: z.string().trim().min(5, "Description must be at least 5 characters").optional(),
  }),
  idParam: z.object({ id: objectIdSchema }),
};

export const serviceSchemas = {
  create: z.object({
    title: z.string().trim().min(3, "Title must be at least 3 characters"),
    description: z.string().trim().min(10, "Description must be at least 10 characters"),
    price: z.number().positive("Price must be greater than 0"),
    duration: z.number().int().positive("Duration must be a positive integer"),
    categoryId: objectIdSchema,
  }),
  update: z.object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").optional(),
    description: z.string().trim().min(10, "Description must be at least 10 characters").optional(),
    price: z.number().positive("Price must be greater than 0").optional(),
    duration: z.number().int().positive("Duration must be a positive integer").optional(),
    categoryId: objectIdSchema.optional(),
    isActive: z.boolean().optional(),
  }),
  query: z.object({
    searchTerm: z.string().trim().optional(),
    categoryId: objectIdSchema.optional(),
    location: z.string().trim().optional(),
    minRating: z.string().trim().optional(),
    minPrice: z.string().trim().optional(),
    maxPrice: z.string().trim().optional(),
    page: z.string().trim().optional(),
    limit: z.string().trim().optional(),
    sortBy: z.string().trim().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
  idParam: z.object({ id: objectIdSchema }),
};

export const availabilitySchemas = {
  create: z.object({
    day: z.nativeEnum(WeekDay),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  }),
  update: z.object({
    day: z.nativeEnum(WeekDay).optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
  }),
  idParam: z.object({ id: objectIdSchema }),
  technicianParam: z.object({ technicianId: objectIdSchema }),
};

export const bookingSchemas = {
  create: z.object({
    serviceId: objectIdSchema,
    availabilityId: objectIdSchema,
    serviceAddress: z.string().trim().min(5, "Service address must be at least 5 characters"),
  }),
  updateStatus: z.object({
    status: z.nativeEnum(BookingStatus),
  }),
  query: z.object({
    page: z.string().trim().optional(),
    limit: z.string().trim().optional(),
    sortBy: z.string().trim().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    status: z.nativeEnum(BookingStatus).optional(),
  }),
  bookingParam: z.object({ bookingId: objectIdSchema }),
};

export const paymentSchemas = {
  createCheckoutSession: z.object({
    bookingId: objectIdSchema,
  }),
  verifySessionQuery: z.object({
    sessionId: objectIdSchema,
  }),
  query: z.object({
    page: z.string().trim().optional(),
    limit: z.string().trim().optional(),
    status: z.nativeEnum(ActiveStatus).optional(),
    sortBy: z.string().trim().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
  idParam: z.object({ id: objectIdSchema }),
};

export const reviewSchemas = {
  create: z.object({
    bookingId: objectIdSchema,
    rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
    comment: z.string().trim().min(3, "Comment must be at least 3 characters").optional(),
  }),
  query: z.object({
    page: z.string().trim().optional(),
    limit: z.string().trim().optional(),
    sortBy: z.string().trim().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
  technicianParam: z.object({ technicianId: objectIdSchema }),
};

export const adminSchemas = {
  userStatus: z.object({
    status: z.nativeEnum(ActiveStatus),
  }),
  userIdParam: z.object({ id: objectIdSchema }),
  bookingIdParam: z.object({ bookingId: objectIdSchema }),
};

export const commonSchemas = {
  paginationQuery: z.object({
    page: z.string().trim().optional(),
    limit: z.string().trim().optional(),
  }),
};
