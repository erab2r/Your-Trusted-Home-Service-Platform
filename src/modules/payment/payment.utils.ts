import Stripe from "stripe";
import {
  BookingStatus,
  PaymentStatus,
} from "../../../generated/prisma/enums";

import { prisma } from "../../lib/prisma";

const syncPaymentFromCheckoutSession = async (
  session: Stripe.Checkout.Session,
  source: "webhook" | "verify"
) => {
  let paymentId = session.metadata?.paymentId;
  let bookingId = session.metadata?.bookingId;

  if (!paymentId && session.id) {
    const paymentBySession = await prisma.payment.findUnique({
      where: {
        sessionId: session.id,
      },
    });

    paymentId = paymentBySession?.id;
    bookingId = paymentBySession?.bookingId;
  }

  if (!paymentId || !bookingId) {
    console.log(
      `Payment sync (${source}): Missing paymentId or bookingId.`
    );
    return;
  }

  const transactionId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
  });

  if (!payment) {
    console.log(
      `Payment sync (${source}): Payment not found (${paymentId}).`
    );
    return;
  }

  if (payment.status === PaymentStatus.COMPLETED) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        transactionId,
        sessionId: session.id,
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
        failureReason: null,
      },
    });

    await tx.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: BookingStatus.PAID,
      },
    });
  });
};

/**
 * checkout.session.completed
 */
export const handleCheckoutCompleted = async (
  session: Stripe.Checkout.Session
) => {
  await syncPaymentFromCheckoutSession(session, "webhook");
};

/**
 * payment_intent.payment_failed
 */
export const handlePaymentFailed = async (
  paymentIntent: Stripe.PaymentIntent
) => {
  await prisma.payment.updateMany({
    where: {
      transactionId: paymentIntent.id,
    },
    data: {
      status: PaymentStatus.FAILED,
      failureReason:
        paymentIntent.last_payment_error?.message ??
        "Payment failed.",
    },
  });
};

/**
 * checkout.session.expired
 */
export const handleCheckoutExpired = async (
  session: Stripe.Checkout.Session
) => {
  const paymentId = session.metadata?.paymentId;

  if (!paymentId) {
    return;
  }

  await prisma.payment.update({
    where: {
      id: paymentId,
    },
    data: {
      status: PaymentStatus.FAILED,
      failureReason: "Checkout session expired.",
    },
  });
};

export const verifyCheckoutSessionAndSyncPayment = async (
  session: Stripe.Checkout.Session
) => {
  if (session.payment_status === "paid") {
    await syncPaymentFromCheckoutSession(session, "verify");
  }
};