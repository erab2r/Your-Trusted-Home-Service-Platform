import { Response } from "express";

type TMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

type TResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: TMeta;
};

export const sendResponse = <T>(
  res: Response,
  data: TResponse<T>
) => {
  const responseData: Partial<TResponse<T>> = {
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
  };

  if (data.meta) {
    responseData.meta = data.meta;
  }

  return res.status(data.statusCode).json(responseData);
};