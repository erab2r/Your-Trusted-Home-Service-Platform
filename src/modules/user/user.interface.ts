import { Role } from "../../../generated/prisma/enums";

export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role: Role;
}

export interface IUpdateProfile {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  profilePhoto?: string;
}