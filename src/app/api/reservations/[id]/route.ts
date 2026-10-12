import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getReservationById,
} from "@/services/reservation.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json(
        { success: false, message: "Invalid reservation ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const parsed = z
      .object({
        status: z.literal("CANCELLED"),
      })
      .strict()
      .safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Only cancellation is supported",
        },
        { status: 400 }
      );
    }

    const reservation = await getReservationById(id);

    if (!reservation) {
      return NextResponse.json(
        { success: false, message: "Reservation not found" },
        { status: 404 }
      );
    }

    if (
      reservation.userId !== user.id &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot cancel another user's reservation",
        },
        { status: 403 }
      );
    }

    if (reservation.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          message: "Reservation is already cancelled",
        },
        { status: 409 }
      );
    }

    // Conditional update prevents duplicate cancellation
    // when two requests arrive at nearly the same time.
    const result = await prisma.reservation.updateMany({
      where: {
        id,
        status: "CONFIRMED",
      },
      data: {
        status: "CANCELLED",
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Reservation is already cancelled",
        },
        { status: 409 }
      );
    }

    const updatedReservation = await getReservationById(id);

    return NextResponse.json({
      success: true,
      message: "Reservation cancelled successfully",
      data: updatedReservation,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    console.error("Cancellation failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to cancel reservation",
      },
      { status: 500 }
    );
  }
}