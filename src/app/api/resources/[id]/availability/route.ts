import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { findOverlappingReservation } from "@/services/reservation.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const querySchema = z
  .object({
    startTime: z.iso.datetime({ offset: true }),
    endTime: z.iso.datetime({ offset: true }),
  })
  .refine(
    (data) =>
      new Date(data.endTime).getTime() >
      new Date(data.startTime).getTime(),
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json(
        { success: false, message: "Invalid resource ID" },
        { status: 400 }
      );
    }

    const url = new URL(request.url);

    const parsed = querySchema.safeParse({
      startTime: url.searchParams.get("startTime"),
      endTime: url.searchParams.get("endTime"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid date range",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const startTime = new Date(parsed.data.startTime);
    const endTime = new Date(parsed.data.endTime);

    if (startTime.getTime() <= Date.now()) {
      return NextResponse.json(
        {
          success: false,
          message: "Start time must be in the future",
        },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    if (!resource) {
      return NextResponse.json(
        { success: false, message: "Resource not found" },
        { status: 404 }
      );
    }

    if (resource.status !== "AVAILABLE") {
      return NextResponse.json({
        success: true,
        available: false,
        message: "Resource is currently unavailable",
      });
    }

    const overlap = await findOverlappingReservation(
      id,
      startTime,
      endTime
    );

    return NextResponse.json({
      success: true,
      resourceId: id,
      available: overlap === null,
      message: overlap
        ? "Resource is already booked for this period"
        : "Resource is available for this period",
    });
  } catch (error) {
    console.error("Availability check failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to check availability",
      },
      { status: 500 }
    );
  }
}