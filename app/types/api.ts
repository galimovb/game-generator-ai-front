interface ApiResponse<T> {
  result: T;
  timestamp: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

interface PaginatedResult<T> {
  items: T[];
  pagination: Pagination;
}

export interface ApiError {
  error: string;
  errorMessage: string;
}

export type SingleResponse<T> = ApiResponse<T>;
export type ListResponse<T> = ApiResponse<PaginatedResult<T>>;
