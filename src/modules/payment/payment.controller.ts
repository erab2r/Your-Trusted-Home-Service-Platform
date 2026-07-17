import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

import { IPaymentQuery } from "./payment.interface";
import { paymentService } from "./payment.service";

const createCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;

    const result = await paymentService.createCheckoutSession(
      userId,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Checkout session created successfully",
      data: result,
    });
  }
);

const handleWebhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body as Buffer;
    const signature = req.headers["stripe-signature"];

    if (!Buffer.isBuffer(payload)) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message:
          "Invalid webhook payload. Expected raw request body.",
        data: null,
      });
    }

    if (!signature || typeof signature !== "string") {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: "Missing Stripe signature header",
        data: null,
      });
    }

    await paymentService.handleWebhook(
      payload,
      signature
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Webhook triggered successfully",
      data: null,
    });
  }
);

const verifyCheckoutSession = catchAsync(
  async (req: Request, res: Response) => {
    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== "string") {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: "sessionId query parameter is required",
        data: null,
      });
    }

    const result = await paymentService.verifyCheckoutSession(
      sessionId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Checkout session verified successfully",
      data: result,
    });
  }
);

const getMyPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;

    const result = await paymentService.getMyPayments(
      userId,
      req.query as IPaymentQuery
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payments retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getPaymentById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const { id } = req.params;

    const result = await paymentService.getPaymentById(
      id as string,
      userId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment retrieved successfully",
      data: result,
    });
  }
);

export const paymentController = {
  createCheckoutSession,
  verifyCheckoutSession,
  handleWebhook,
  getMyPayments,
  getPaymentById,
};