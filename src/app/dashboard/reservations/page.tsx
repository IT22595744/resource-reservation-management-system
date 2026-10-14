
import Link from "next/link";
import { Plus } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ReservationList from "@/components/reservations/ReservationList";

export default async function ReservationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      role: true,
    },
  });

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            RESERVATION MANAGEMENT
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {isAdmin ? "All Reservations" : "My Reservations"}
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
            {isAdmin
              ? "View and manage resource reservations across all users."
              : "Track your upcoming bookings, review reservation details, and manage your reservations."}
          </p>
        </div>

        <Link
          href="/dashboard/resources"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          New Reservation
        </Link>
      </div>

      <ReservationList isAdmin={isAdmin} />
    </div>
  );
}
