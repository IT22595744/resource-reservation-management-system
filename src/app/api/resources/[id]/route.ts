import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateResourceSchema } from "@/lib/validations/resource";

import {
  getResourceById,
  updateResource,
  deactivateResource,
} from "@/services/resource.service";

import { isValidResourceImage } from "@/lib/validate-resource-image";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });
}

// GET /api/resources/:id
export async function GET(
  _request: Request,
  context: RouteContext
) {
  const user = await requireUser();

  if (!user) {
    return jsonError("Authentication required", 401);
  }

  const { id } = await context.params;

  if (!z.uuid().safeParse(id).success) {
    return jsonError("Invalid resource ID", 400);
  }

  try {
    const resource = await getResourceById(id);

    if (!resource) {
      return jsonError("Resource not found", 404);
    }

    return NextResponse.json({
      success: true,
      data: resource,
    });
  } catch (error) {
    console.error("Failed to fetch resource:", error);
    return jsonError("Unable to retrieve resource", 500);
  }
}

// PATCH /api/resources/:id
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const user = await requireUser();

  if (!user) {
    return jsonError("Authentication required", 401);
  }

  if (user.role !== "ADMIN") {
    return jsonError("Administrator access required", 403);
  }

  const { id } = await context.params;

  if (!z.uuid().safeParse(id).success) {
    return jsonError("Invalid resource ID", 400);
  }

try {
  const body = await request.json();
  const parsed = updateResourceSchema.safeParse(body);

  // Step 1: Validate resource data
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid resource data",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  // Step 2: Validate Cloudinary image
  if (!(await isValidResourceImage(parsed.data))) {
    return jsonError("Invalid or unverified resource image", 400);
  }

  // Step 3: Check whether update fields were provided
  if (Object.keys(parsed.data).length === 0) {
    return jsonError("No update fields provided", 400);
  }

  // Step 4: Check whether resource exists
  const existingResource = await getResourceById(id);

  if (!existingResource) {
    return jsonError("Resource not found", 404);
  }

  // Step 5: Validate category if changed
  if (parsed.data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
    });

    if (!category) {
      return jsonError("Category not found", 404);
    }
  }

  // Step 6: Update resource
  const resource = await updateResource(id, parsed.data);

  return NextResponse.json({
    success: true,
    message: "Resource updated successfully",
    data: resource,
  });
} catch (error) {
  console.error("Failed to update resource:", error);
  return jsonError("Unable to update resource", 500);
}
}

// DELETE /api/resources/:id
// Soft delete: sets status to UNAVAILABLE.
export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  const user = await requireUser();

  if (!user) {
    return jsonError("Authentication required", 401);
  }

  if (user.role !== "ADMIN") {
    return jsonError("Administrator access required", 403);
  }

  const { id } = await context.params;

  if (!z.uuid().safeParse(id).success) {
    return jsonError("Invalid resource ID", 400);
  }

  try {
    const existingResource = await getResourceById(id);

    if (!existingResource) {
      return jsonError("Resource not found", 404);
    }

    const resource = await deactivateResource(id);

    return NextResponse.json({
      success: true,
      message: "Resource deactivated successfully",
      data: resource,
    });
  } catch (error) {
    console.error("Failed to deactivate resource:", error);
    return jsonError("Unable to deactivate resource", 500);
  }
}