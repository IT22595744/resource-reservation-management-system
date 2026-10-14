import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Info,
  MapPin,
  Package,
  Tag,
  XCircle,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import BookingForm from "@/components/resources/BookingForm";

type ResourceDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ResourceDetailsPage({
  params,
}: ResourceDetailsPageProps) {
  const { id } = await params;

  // Prevent invalid UUIDs from reaching PostgreSQL.
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
    notFound();
  }

  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!resource) {
    notFound();
  }

  const isAvailable = resource.status === "AVAILABLE";

  const isRoom = resource.category.name
    .toLowerCase()
    .includes("room");

  return (
    <div className="space-y-7 pb-8">
      {/* Navigation */}
      <nav aria-label="Breadcrumb">
        <Link
          href="/dashboard/resources"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
        >
          <ArrowLeft size={17} />
          Back to Resources
        </Link>
      </nav>

      {/* Page heading */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            RESOURCE DETAILS
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {resource.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Tag size={15} />
              {resource.category.name}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} />
              {resource.location || "Location not specified"}
            </span>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
            isAvailable
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {isAvailable ? (
            <CheckCircle2 size={17} />
          ) : (
            <XCircle size={17} />
          )}

          {isAvailable ? "Available" : "Unavailable"}
        </span>
      </div>

      {/* Main layout */}
      <div className="grid items-start gap-6 lg:grid-cols-5">
        {/* Resource information */}
        <div className="space-y-6 lg:col-span-3">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Uploaded image or fallback */}
            <div className="relative h-64 overflow-hidden bg-slate-100 sm:h-80">
              {resource.imageUrl ? (
                <Image
                  src={resource.imageUrl}
                  alt={`Photo of ${resource.name}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-blue-800 to-cyan-600 text-white">
                  {isRoom ? (
                    <Building2
                      size={72}
                      strokeWidth={1.3}
                      className="opacity-90"
                    />
                  ) : (
                    <Package
                      size={72}
                      strokeWidth={1.3}
                      className="opacity-90"
                    />
                  )}

                  <span className="mt-4 text-sm font-semibold text-blue-100">
                    {resource.category.name}
                  </span>
                </div>
              )}

              <span className="absolute bottom-4 left-4 rounded-lg bg-white/95 px-3 py-2 text-xs font-bold text-blue-800 shadow-sm">
                {resource.category.name}
              </span>
            </div>

            {/* Description */}
            <div className="space-y-6 p-6 sm:p-7">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                    <Info size={18} />
                  </div>

                  <h2 className="text-xl font-bold text-slate-900">
                    About This Resource
                  </h2>
                </div>

                <p className="whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
                  {resource.description ||
                    "No description has been provided for this resource."}
                </p>
              </div>

              <div className="grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <div className="rounded-lg bg-white p-2 text-blue-600 shadow-sm">
                    <Tag size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Category
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {resource.category.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <div className="rounded-lg bg-white p-2 text-blue-600 shadow-sm">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Location
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {resource.location || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Reservation information */}
          <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-3 text-blue-600 shadow-sm">
                <Clock3 size={22} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  How Reservations Work
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Select your preferred start and end times, check
                  availability, and confirm your reservation.
                  Your booking is confirmed only after the server
                  successfully saves it.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Booking panel */}
        <aside className="lg:col-span-2">
          {isAvailable ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1 text-sm font-semibold text-slate-700">
                <CalendarDays size={18} className="text-blue-600" />
                Reservation Booking
              </div>

              <BookingForm
                resourceId={resource.id}
                resourceName={resource.name}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-7 shadow-sm">
              <div className="mb-4 inline-flex rounded-xl bg-amber-100 p-3 text-amber-700">
                <XCircle size={26} />
              </div>

              <h2 className="text-xl font-bold text-amber-900">
                Resource Unavailable
              </h2>

              <p className="mt-3 text-sm leading-6 text-amber-800">
                This resource is currently disabled for new
                reservations. Please choose another resource.
              </p>

              <Link
                href="/dashboard/resources"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
              >
                <ArrowLeft size={17} />
                Browse Other Resources
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}