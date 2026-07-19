import Stripe from "stripe";
import { Prisma } from "../../../generated/prisma/client";
import {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "../../../generated/prisma/enums";

import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

import {
  ICreateCheckoutSession,
  IPaymentQuery,
} from "./payment.interface";

import { paginationHelper } from "../../utils/pagination";

import {
  handleCheckoutCompleted,
  handleCheckoutExpired,
  handlePaymentFailed,
  verifyCheckoutSessionAndSyncPayment,
} from "./payment.utils";



const createCheckoutSession = async (
  userId: string,
  payload: ICreateCheckoutSession
) => {
  const booking = await prisma.booking.findFirstOrThrow({
    where: {
      id: payload.bookingId,
      customerId: userId,
    },
    
    include: {
      service: true,
      payment: true,
    },
  });

  if (booking.status !== BookingStatus.ACCEPTED) {
    throw new Error(
      "Payment can only be made after technician accepts the booking."
    );
  }

  if (booking.payment) {
    throw new Error(
      "Payment has already been created for this booking."
    );
  }

  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount: booking.totalAmount,
      method: PaymentMethod.STRIPE,
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    payment_method_types: ["card"],

    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",

          unit_amount: Math.round(
            Number(booking.totalAmount) * 100
          ),

          product_data: {
            name: booking.service.title,
            description: booking.service.description,
          },
        },
      },
    ],

    metadata: {
      bookingId: booking.id,
      paymentId: payment.id,
    },

    success_url: `${config.app_url}/payment/success?bookingId=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,

    cancel_url: `${config.app_url}/payment/cancel?bookingId=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
  });

  const checkoutSession = await stripe.checkout.sessions.retrieve(
    session.id,
    {
      expand: ["payment_intent"],
    }
  );

  const paymentIntentId =
    typeof checkoutSession.payment_intent === "string"
      ? checkoutSession.payment_intent
      : checkoutSession.payment_intent?.id;

  await prisma.payment.update({
    where: {
      id: payment.id,
    },
    data: {
      sessionId: checkoutSession.id,
      transactionId: paymentIntentId ?? undefined,
    },
  });

  return {
    checkoutUrl: checkoutSession.url,
    sessionId: checkoutSession.id,
    paymentId: payment.id,
    bookingId: booking.id,
    paymentIntentId,
  };
};

const verifyCheckoutSession = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(
    sessionId,
    {
      expand: ["payment_intent"],
    }
  );

  await verifyCheckoutSessionAndSyncPayment(session);

  const payment = await prisma.payment.findUnique({
    where: {
      sessionId: session.id,
    },
    include: {
      booking: true,
    },
  });

  return {
    sessionId: session.id,
    paymentStatus: session.payment_status,
    sessionStatus: session.status,
    payment,
  };
};

const cancelCheckoutSession = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(
    sessionId,
    {
      expand: ["payment_intent"],
    }
  );

  if (session.payment_status === "paid") {
    await verifyCheckoutSessionAndSyncPayment(session);
  } else {
    const paymentId = session.metadata?.paymentId;

    if (paymentId) {
      await prisma.payment.updateMany({
        where: {
          id: paymentId,
          status: {
            not: PaymentStatus.COMPLETED,
          },
        },
        data: {
          status: PaymentStatus.FAILED,
          failureReason: "Checkout cancelled by customer.",
        },
      });
    } else {
      await prisma.payment.updateMany({
        where: {
          sessionId: session.id,
          status: {
            not: PaymentStatus.COMPLETED,
          },
        },
        data: {
          status: PaymentStatus.FAILED,
          failureReason: "Checkout cancelled by customer.",
        },
      });
    }
  }

  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        {
          sessionId: session.id,
        },
        ...(session.metadata?.paymentId
          ? [
              {
                id: session.metadata.paymentId,
              },
            ]
          : []),
      ],
    },
  });

  return {
    sessionId: session.id,
    paymentStatus: session.payment_status,
    sessionStatus: session.status,
    payment,
  };
};

const handleWebhook = async (
  payload: Buffer,
  signature: string
) => {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    config.stripe_webhook_secret
  );

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session
      );
      break;

    case "payment_intent.payment_failed":
      await handlePaymentFailed(
        event.data.object as Stripe.PaymentIntent
      );
      break;

    case "checkout.session.expired":
      await handleCheckoutExpired(
        event.data.object as Stripe.Checkout.Session
      );
      break;

    default:
      console.log(
        `Unhandled webhook event: ${event.type}`
      );
      break;
  }
};

const getMyPayments = async (
  userId: string,
  query: IPaymentQuery
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination({
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      sortBy: query.sortBy || "createdAt",
      sortOrder: query.sortOrder || "desc",
    });

  const whereConditions: Prisma.PaymentWhereInput = {
    booking: {
      customerId: userId,
    },
  };

  if (query.status) {
    whereConditions.status = query.status;
  }

  const payments = await prisma.payment.findMany({
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
      },
    },
  });

  const total = await prisma.payment.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: payments,
  };
};

const getPaymentById = async (
  paymentId: string,
  userId: string
) => {
  const payment = await prisma.payment.findFirstOrThrow({
    where: {
      id: paymentId,
      booking: {
        customerId: userId,
      },
    },
    include: {
      booking: {
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
          service: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  return payment;
};

export const paymentService = {
  createCheckoutSession,
  verifyCheckoutSession,
  cancelCheckoutSession,
  handleWebhook,
  getMyPayments,
  getPaymentById,
};