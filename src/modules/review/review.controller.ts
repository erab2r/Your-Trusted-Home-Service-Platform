import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewService } from "./review.service";

const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;

    const result = await reviewService.createReview(userId, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Review submitted successfully",
      data: result,
    });
  }
);

const getTechnicianReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { technicianId } = req.params;

    const result = await reviewService.getTechnicianReviews(
      technicianId as string,
      req.query
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Reviews retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getMyReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;

    const result = await reviewService.getMyReviews(
      userId,
      req.query
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "My reviews retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

export const reviewController = {
  createReview,
  getTechnicianReviews,
  getMyReviews,
};