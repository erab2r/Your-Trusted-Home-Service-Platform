export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IPaginationResult {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const calculatePagination = (
  options: IPaginationOptions
): IPaginationResult => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    sortBy: options.sortBy || "createdAt",
    sortOrder: options.sortOrder || "desc",
  };
};

export const paginationHelper = {
  calculatePagination,
};