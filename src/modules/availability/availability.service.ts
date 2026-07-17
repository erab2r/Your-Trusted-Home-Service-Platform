import { prisma } from "../../lib/prisma";
import {
  ICreateAvailability,
  IUpdateAvailability,
} from "./availability.interface";

const createAvailability = async (
  userId: string,
  payload: ICreateAvailability
) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  if (payload.startTime >= payload.endTime) {
    throw new Error("End time must be greater than start time.");
  }

  const availability = await prisma.availability.create({
    data: {
      ...payload,
      technicianId: technician.id,
    },
  });

  return availability;
};

const getMyAvailability = async (userId: string) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  const availabilities = await prisma.availability.findMany({
    where: {
      technicianId: technician.id,
    },
    orderBy: [
      {
        day: "asc",
      },
      {
        startTime: "asc",
      },
    ],
  });

  return availabilities;
};

const getTechnicianAvailability = async (technicianId: string) => {
  const availabilities = await prisma.availability.findMany({
    where: {
      technicianId,
      isBooked: false,
    },
    orderBy: [
      {
        day: "asc",
      },
      {
        startTime: "asc",
      },
    ],
  });

  return availabilities;
};

const updateAvailability = async (
  availabilityId: string,
  userId: string,
  payload: IUpdateAvailability
) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  await prisma.availability.findFirstOrThrow({
    where: {
      id: availabilityId,
      technicianId: technician.id,
    },
  });

  if (
    payload.startTime &&
    payload.endTime &&
    payload.startTime >= payload.endTime
  ) {
    throw new Error("End time must be greater than start time.");
  }

  const updatedAvailability = await prisma.availability.update({
    where: {
      id: availabilityId,
    },
    data: payload,
  });

  return updatedAvailability;
};

const deleteAvailability = async (
  availabilityId: string,
  userId: string
) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  await prisma.availability.findFirstOrThrow({
    where: {
      id: availabilityId,
      technicianId: technician.id,
    },
  });

  await prisma.availability.delete({
    where: {
      id: availabilityId,
    },
  });

  return null;
};

export const availabilityService = {
  createAvailability,
  getMyAvailability,
  getTechnicianAvailability,
  updateAvailability,
  deleteAvailability,
};