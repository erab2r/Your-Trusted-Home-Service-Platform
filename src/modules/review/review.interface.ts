export interface ICreateReview {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface IReviewQuery {
  page?: string;
  limit?: string;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
}