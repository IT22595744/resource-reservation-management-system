import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  CreateReservationInput,
} from "@/lib/validations/reservation";

export async function getReservationsForUser(
  userId: string,
  isAdmin: boolean
) {
  return prisma.reservation.findMany({
    where: isAdmin ? {} : { userId },
    include: {
      resource: {
        include: {
          category: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      startTime: "desc",
    },
  });
}

export async function getReservationById(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
  });
}

export async function findOverlappingReservation(
  resourceId: string,
  startTime: Date,
  endTime: Date
) {
  return prisma.reservation.findFirst({
    where: {
      resourceId,
      status: "CONFIRMED",

      startTime: {
        lt: endTime,
      },

      endTime: {
        gt: startTime,
      },
    },
    select: {
      id: true,
    },
  });
}

export async function createReservation(
  userId: string,
  data: CreateReservationInput
) {
  return prisma.reservation.create({
    data: {
      userId,
      resourceId: data.resourceId,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      purpose: data.purpose,
      status: "CONFIRMED",
    },
    include: {
      resource: true,
    },
  });
}

export async function cancelReservation(id: string) {
  return prisma.reservation.update({
    where: { id },
    data: {
      status: "CANCELLED",
    },
  });
}