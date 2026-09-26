export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PageParams {
  page?: number;
  pageSize?: number;
}
