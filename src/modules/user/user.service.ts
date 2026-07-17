import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { Role } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { IRegisterUser, IUpdateProfile } from "./user.interface";

const registerUserIntoDB = async (payload: IRegisterUser) => {
  const { name, email, password, phone, address, role } = payload;
  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isUserExist) {
    throw new Error("User already exists with this email.");
  }
  if (role === Role.ADMIN) {
    throw new Error("You are not allowed to register as Admin.");
  }
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds)
  );
  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role,
      },
    });
    if (role === Role.TECHNICIAN) {
      await tx.technicianProfile.create({
        data: {
          userId: createdUser.id,
          experience: 0,
          skills: [],
          location: "",
          bio: null,
        },
      });
    }

    return createdUser;
  });

  const result = await prisma.user.findUniqueOrThrow({
    where: {
      id: user.id,
    },
    omit: {
      password: true,
    },
    include: {
      technicianProfile: true,
    },
  });

  return result;
};

const getMyProfileFromDB = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
    include: {
      technicianProfile: {
        include: {
          services: true,
          availabilities: true,
        },
      },
    },
  });

  return user;
};

const updateMyProfileInDB = async (
  userId: string,
  payload: IUpdateProfile
) => {
  const { name, phone, address, profilePhoto, email } = payload;

  if (email !== undefined) {
    const error: any = new Error("Email cannot be updated.");
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name,
      phone,
      address,
      profilePhoto,
    },
    omit: {
      password: true,
    },
    include: {
      technicianProfile: true,
    },
  });

  return updatedUser;
};

export const userService = {
  registerUserIntoDB,
  getMyProfileFromDB,
  updateMyProfileInDB,
};