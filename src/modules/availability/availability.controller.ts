import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { availabilityService } from "./availability.service";

const createAvailability = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;

    const result = await availabilityService.createAvailability(
      userId,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Availability created successfully",
      data: result,
    });
  }
);

const getMyAvailability = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;

    const result = await availabilityService.getMyAvailability(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "My availability retrieved successfully",
      data: result,
    });
  }
);

const getTechnicianAvailability = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { technicianId } = req.params;

    const result = await availabilityService.getTechnicianAvailability(
      technicianId as string
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Availability retrieved successfully",
      data: result,
    });
  }
);

const updateAvailability = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const { id } = req.params;

    const result = await availabilityService.updateAvailability(
      id as string,
      userId,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Availability updated successfully",
      data: result,
    });
  }
);

const deleteAvailability = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const { id } = req.params;

    await availabilityService.deleteAvailability(id as string, userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Availability deleted successfully",
      data: null,
    });
  }
);

export const availabilityController = {
  createAvailability,
  getMyAvailability,
  getTechnicianAvailability,
  updateAvailability,
  deleteAvailability,
};