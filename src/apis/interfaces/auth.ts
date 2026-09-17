export type UserRole = "LIDER" | "COLABORADOR" | "ADMIN";

export interface MenuItem {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  description?: string;
  isActive?: boolean;
  permissions?: string[];
  children?: MenuItem[];
}

export interface UserWithMenu {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  program?: string | null;
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

export type ProjectRole = "LIDER" | "COLABORADOR";

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: ProjectRole;
  program?: string;
}

export interface RegisterResponse {
  id: string;
  fullName: string;
  email: string;
  role: ProjectRole;
  program?: string | null;
}
