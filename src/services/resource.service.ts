import "server-only";
import { prisma } from "@/lib/prisma";
import type {
  CreateResourceInput,
} from "@/lib/validations/resource";

export async function getAllResources() {
  return prisma.resource.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getResourceById(id: string) {
  return prisma.resource.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
}

export async function createResource(
  data: CreateResourceInput
) {
  return prisma.resource.create({
    data: {
      name: data.name,
      description: data.description,
      location: data.location,
      categoryId: data.categoryId,
      status: data.status,
    },
    include: {
      category: true,
    },
  });
}

export async function updateResource(
  id: string,
  data: Partial<CreateResourceInput>
) {
  return prisma.resource.update({
    where: { id },
    data,
    include: {
      category: true,
    },
  });
}

export async function deactivateResource(id: string) {
  return prisma.resource.update({
    where: { id },
    data: {
      status: "UNAVAILABLE",
    },
  });
}