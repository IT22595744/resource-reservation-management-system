
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;
  const firstName = session.user.name?.trim().split(/\s+/)[0] || "there";

  const [
    totalResources,
    availableResources,
    myReservations,
    upcomingReservations,
  ] = await Promise.all([
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
          gt: new Date(),
        },
      },
    }),
  ]);

  const stats = [
    {
      title: "Total Resources",
      value: totalResources,
      description: "Resources in your workspace",
      icon: Layers3,
      iconColor: "text-blue-600",
      iconBackground: "bg-blue-50",
    },
    {
      title: "Available Resources",
      value: availableResources,
      description: "Ready for reservation",
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      iconBackground: "bg-emerald-50",
    },
    {
      title: "My Reservations",
      value: myReservations,
      description: "Your total reservations",
      icon: CalendarCheck2,
      iconColor: "text-violet-600",
      iconBackground: "bg-violet-50",
    },
    {
      title: "Upcoming Bookings",
      value: upcomingReservations,
      description: "Confirmed future bookings",
      icon: CalendarClock,
      iconColor: "text-amber-600",
      iconBackground: "bg-amber-50",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-8">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-5 text-white shadow-lg shadow-blue-100 sm:p-5">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-28 right-24 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-semibold text-blue-50">
            <Sparkles size={15} />
            YOUR WORKSPACE OVERVIEW
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Welcome back, {firstName}!
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-7 text-blue-50 sm:text-base">
            Everything you need to discover resources, manage
            reservations, and organize your workspace in one place.
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
            <h3 className="text-xl font-bold text-slate-900">
              Workspace Statistics
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              A quick overview of your resources and bookings.
            </p>
          </div>

          <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500">
            Live Database Data
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-100"
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

                <p className="mt-6 text-sm font-semibold text-slate-500">
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

      {/* Quick actions */}
      <section>
        <div className="mb-5">
          <h3 className="text-xl font-bold text-slate-900">
            Quick Actions
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Get to the tools you use most often.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-blue-200 hover:shadow-md">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Search size={25} />
            </div>

            <h4 className="mt-5 text-lg font-bold text-slate-900">
              Explore Resources
            </h4>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Browse meeting rooms, equipment, and other shared
              resources. Check availability and make reservations.
            </p>

            <Link
              href="/dashboard/resources"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Resources
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-violet-200 hover:shadow-md">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <CalendarCheck2 size={25} />
            </div>

            <h4 className="mt-5 text-lg font-bold text-slate-900">
              Manage Reservations
            </h4>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              View upcoming bookings, track reservation history,
              and cancel reservations when plans change.
            </p>

            <Link
              href="/dashboard/reservations"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              View Reservations
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* Helpful footer */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-4">
        <ShieldCheck size={20} className="text-blue-600" />
        <p className="text-sm text-slate-600">
          ReserveHub helps keep shared resources organized with
          availability checks and reservation management.
        </p>
      </div>
    </div>
  );
}
