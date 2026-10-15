import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations/category";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function authorizeAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      role: true,
    },
  });

  if (user?.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { message: "Administrator access required" },
        { status: 403 }
      ),
    };
  }

  return { error: null };
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const authorization = await authorizeAdmin();

    if (authorization.error) {
      return authorization.error;
    }

    const { id } = await context.params;

    const body = await request.json().catch(() => null);
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid category data",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: parsed.data.name,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "A category with this name already exists" },
          { status: 409 }
        );
      }

      if (error.code === "P2025") {
        return NextResponse.json(
          { message: "Category not found" },
          { status: 404 }
        );
      }
    }

    console.error("PATCH /api/categories/[id]:", error);

    return NextResponse.json(
      { message: "Unable to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const authorization = await authorizeAdmin();

    if (authorization.error) {
      return authorization.error;
    }

    const { id } = await context.params;

    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            resources: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    if (category._count.resources > 0) {
      return NextResponse.json(
        {
          message:
            "Cannot delete a category containing resources. Reassign its resources first.",
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            message:
              "Cannot delete this category because resources still reference it.",
          },
          { status: 409 }
        );
      }

      if (error.code === "P2025") {
        return NextResponse.json(
          { message: "Category not found" },
          { status: 404 }
        );
      }
    }

    console.error("DELETE /api/categories/[id]:", error);

    return NextResponse.json(
      { message: "Unable to delete category" },
      { status: 500 }
    );
  }
}