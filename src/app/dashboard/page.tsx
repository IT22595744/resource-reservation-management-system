
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Layers3,
  MapPin,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-LK", {
    timeZone: "Asia/Colombo",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;
  const firstName =
    session.user.name?.trim().split(/\s+/)[0] || "there";

  const now = new Date();

  const [
    currentUser,
    totalResources,
    availableResources,
    myReservations,
    upcomingReservations,
    nextReservation,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    }),

    prisma.resource.count(),

    prisma.resource.count({
      where: {
        status: "AVAILABLE",
      },
    }),

    prisma.reservation.count({
      where: {
        userId,
      },
    }),

    prisma.reservation.count({
      where: {
        userId,
        status: "CONFIRMED",
        startTime: {
          gt: now,
        },
      },
    }),

    prisma.reservation.findFirst({
      where: {
        userId,
        status: "CONFIRMED",
        startTime: {
          gt: now,
        },
      },
      orderBy: {
        startTime: "asc",
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        resource: {
          select: {
            id: true,
            name: true,
            location: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const isAdmin = currentUser?.role === "ADMIN";

  const stats = [
    {
      title: "Total Resources",
      value: totalResources,
      description: "Resources in the workspace",
      icon: Layers3,
      iconColor: "text-blue-600",
      iconBackground: "bg-blue-50",
    },
    {
      title: "Available Resources",
      value: availableResources,
      description: "Currently open for booking",
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      iconBackground: "bg-emerald-50",
    },
    {
      title: "My Reservations",
      value: myReservations,
      description: "Your reservation history",
      icon: CalendarCheck2,
      iconColor: "text-violet-600",
      iconBackground: "bg-violet-50",
    },
    {
      title: "Upcoming Bookings",
      value: upcomingReservations,
      description: "Confirmed future reservations",
      icon: CalendarClock,
      iconColor: "text-amber-600",
      iconBackground: "bg-amber-50",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-8">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-600 p-6 text-white shadow-lg shadow-blue-100 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-28 right-24 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-semibold text-blue-50">
            <Sparkles size={15} />
            YOUR WORKSPACE OVERVIEW
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Welcome back, {firstName}!
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-blue-50 sm:text-base">
            Discover resources, manage reservations, and keep
            your workspace organized — all in one place.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/dashboard/resources"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              <Search size={17} />
              Explore Resources
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/dashboard/reservations"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              My Reservations
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Workspace Statistics
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A quick overview of resources and bookings.
            </p>
          </div>

          <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500">
            Database Overview
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBackground} ${stat.iconColor}`}
                  >
                    <Icon size={23} strokeWidth={2} />
                  </div>

                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-400">
                    Overview
                  </span>
                </div>

                <p className="mt-5 text-sm font-semibold text-slate-500">
                  {stat.title}
                </p>

                <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
                  {stat.value}
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Upcoming reservation */}
      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Your Next Reservation
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep track of your next scheduled booking.
            </p>
          </div>

          <Link
            href="/dashboard/reservations"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        {nextReservation ? (
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CalendarDays size={23} />
                </div>

                <div>
                  <span className="mb-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Confirmed Booking
                  </span>

                  <h3 className="text-lg font-bold text-slate-900">
                    {nextReservation.resource.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {nextReservation.resource.category.name}
                  </p>
                </div>
              </div>

              <Link
                href={`/dashboard/resources/${nextReservation.resource.id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                View Resource
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <CalendarClock
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Start Time
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatDateTime(nextReservation.startTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock3
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    End Time
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatDateTime(nextReservation.endTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Location
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {nextReservation.resource.location ||
                      "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              All dates and times are shown in Sri Lanka time.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <CalendarDays size={27} />
            </div>

            <h3 className="mt-4 font-bold text-slate-900">
              No Upcoming Reservations
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              You don&apos;t have any confirmed future
              bookings yet.
            </p>

            <Link
              href="/dashboard/resources"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Resources
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Get to the tools you use most often.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Search size={24} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              Explore Resources
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Browse meeting rooms, equipment, and shared
              resources. Check availability and make bookings.
            </p>

            <Link
              href="/dashboard/resources"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Resources
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <CalendarCheck2 size={24} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              Manage Reservations
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Review upcoming bookings, track your reservation
              history, and cancel bookings when plans change.
            </p>

            <Link
              href="/dashboard/reservations"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              View Reservations
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
                <Settings2 size={23} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Admin Resource Management
                </h3>

                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
                  Create resources, update details, upload
                  images, and control resource availability.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/admin/resources"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Manage Resources
              <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-4">
        <ShieldCheck
          size={20}
          className="mt-0.5 shrink-0 text-blue-600"
        />

        <p className="text-sm leading-6 text-slate-600">
          ReserveHub keeps shared resources organized with
          availability checks, reservation management, and
          role-based access control.
        </p>
      </div>
    </div>
  );
}
