import type { UserRole } from "./auth";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface AdminUsersResponse {
  users: AdminUser[];
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  role?: UserRole;
  active?: boolean;
}
