export interface ITechnicianQuery {
  searchTerm?: string;
  location?: string;
  minRating?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IUpdateTechnicianProfile {
  bio?: string;
  experience?: number;
  skills?: string[];
  location?: string;
  isAvailable?: boolean;
}