export interface User {
  id?: number;
  name?: string;
  lastName?: string;
  middleName?: string;
  email: string;
  login: string;
  isActive?: boolean;
  roles: UserRole[];
  avatar?: string;
  isBlocked: boolean;
  isVerified: boolean;
  password?: string;
}
export type UserRole = "ROLE_USER" | "ROLE_ADMIN" | "ROLE_SUPPORT";

export type UserLogin = Required<Pick<User, "email" | "password">>;
export type UserRegister = Omit<
  User,
  "id" | "roles" | "isActive" | "isBlocked" | "isVerified" | "avatar" | "login"
> & { login?: string };
export type UserProfile = Omit<User, "password">;

export interface UserSettings {
  generationModel: ModelType;
  generationCreative: number;
}
