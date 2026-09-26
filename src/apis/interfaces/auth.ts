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
  menu: MenuItem[];
}

export interface LoginSuccessResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: UserWithMenu;
}

// El registro público solo admite estos roles; ADMIN lo gestiona el backend.
export type RegisterRole = "LIDER" | "COLABORADOR";
export type PersonType = "ESTUDIANTE" | "DOCENTE";

export interface RegisterCollaboratorPayload {
  firstName: string;
  lastName: string;
  personType: PersonType;
  programId: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: RegisterRole;
  collaborator?: RegisterCollaboratorPayload;
}

export interface RegisterResponse {
  id: string;
  fullName: string;
  email: string;
  role: RegisterRole;
}

export interface RefreshResponse {
  access_token: string;
  expires_in: number;
}

export interface LogoutResponse {
  message: string;
}
