import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { createReservationSchema } from
  "@/lib/validations/reservation";

import {
  createReservation,
  findOverlappingReservation,
  getReservationsForUser,
} from "@/services/reservation.service";



function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

// GET /api/reservations
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return errorResponse("Authentication required", 401);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user) {
      return errorResponse("User not found", 401);
    }

    const reservations = await getReservationsForUser(
      session.user.id,
      user.role === "ADMIN"
    );

    return NextResponse.json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    console.error("Failed to fetch reservations:", error);

    return errorResponse(
      "Unable to retrieve reservations",
      500
    );
  }
}

// POST /api/reservations
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return errorResponse("Authentication required", 401);
  }

  try {
    const body = await request.json();

    const parsed = createReservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reservation data",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (startTime.getTime() <= Date.now()) {
      return errorResponse(
        "Reservation must start in the future",
        400
      );
    }

    const resource = await prisma.resource.findUnique({
      where: { id: data.resourceId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!resource) {
      return errorResponse("Resource not found", 404);
    }

    if (resource.status !== "AVAILABLE") {
      return errorResponse(
        "This resource is currently unavailable",
        409
      );
    }

    const overlapping = await findOverlappingReservation(
      data.resourceId,
      startTime,
      endTime
    );

    if (overlapping) {
      return errorResponse(
        "This resource is already booked during the selected time",
        409
      );
    }

    try {
      const reservation = await createReservation(
        session.user.id,
        data
      );

      return NextResponse.json(
        {
          success: true,
          message: "Reservation created successfully",
          data: reservation,
        },
        { status: 201 }
      );
    } catch (error) {
      // PostgreSQL exclusion violation: SQLSTATE 23P01.
      // Prisma may wrap this code in a nested adapter error.
      let current: unknown = error;
      let isOverlapViolation = false;

      for (let depth = 0; depth < 6; depth++) {
        if (
          !current ||
          typeof current !== "object"
        ) {
          break;
        }

        const details = current as {
          code?: unknown;
          originalCode?: unknown;
          cause?: unknown;
          meta?: {
            database_error?: {
              code?: unknown;
            };
            driverAdapterError?: {
              cause?: {
                originalCode?: unknown;
              };
            };
          };
        };

        if (
          details.code === "23P01" ||
          details.originalCode === "23P01" ||
          details.meta?.database_error?.code === "23P01" ||
          details.meta?.driverAdapterError?.cause
            ?.originalCode === "23P01"
        ) {
          isOverlapViolation = true;
          break;
        }

        current = details.cause;
      }

      if (isOverlapViolation) {
        return errorResponse(
          "This resource was just booked by another user. Please choose another time.",
          409
        );
      }

      console.error("Failed to create reservation:", error);

      return errorResponse(
        "Unable to create reservation",
        500
      );
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse("Invalid JSON request body", 400);
    }

    console.error("Reservation request failed:", error);

    return errorResponse(
      "Unable to process reservation request",
      500
    );
  }
}