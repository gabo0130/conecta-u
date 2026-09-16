export type UserRole = "ADMIN" | "USER";

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  description: string;
  is_active: boolean;
  permissions?: string[];
  children?: MenuItem[];
}

export interface UserWithMenu {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
  menu: MenuItem[];
}

export interface LoginSuccessResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: UserWithMenu;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationResponse;
}
