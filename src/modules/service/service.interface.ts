export interface ICreateService {
  title: string;
  description: string;
  price: number;
  duration: number;
  categoryId: string;
}

export interface IUpdateService {
  title?: string;
  description?: string;
  price?: number;
  duration?: number;
  categoryId?: string;
  isActive?: boolean;
}

export interface IServiceQuery {
  searchTerm?: string;

  categoryId?: string;

  location?: string;

  minRating?: string;

  minPrice?: string;
  maxPrice?: string;

  page?: string;
  limit?: string;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
}