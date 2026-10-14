
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Tag,
  Trash2,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

type ReservationStatus = "CONFIRMED" | "CANCELLED";

type Reservation = {
  id: string;
  userId: string;
  resourceId: string;
  startTime: string;
  endTime: string;
  purpose: string | null;
  status: ReservationStatus;
  createdAt: string;
  resource: {
    id: string;
    name: string;
    location: string | null;
    category: {
      name: string;
    };
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type ReservationsResponse = {
  success: boolean;
  data?: Reservation[];
  message?: string;
};

type ReservationListProps = {
  isAdmin: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("en-LK", {
  timeZone: "Asia/Colombo",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-LK", {
  timeZone: "Asia/Colombo",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function formatDate(dateString: string) {
  return dateFormatter.format(new Date(dateString));
}

function formatTime(dateString: string) {
  return timeFormatter.format(new Date(dateString));
}

export default function ReservationList({
  isAdmin,
}: ReservationListProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchReservations() {
      try {
        const response = await fetch("/api/reservations", {
          cache: "no-store",
          signal: controller.signal,
        });

        const result: ReservationsResponse = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(
            result.message || "Unable to load reservations."
          );
        }

        if (!controller.signal.aborted) {
          setReservations(result.data);
          setError("");
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading reservations."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchReservations();

    return () => controller.abort();
  }, []);

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reservations
      .filter((reservation) => {
        const matchesSearch =
          reservation.resource.name.toLowerCase().includes(query) ||
          (reservation.resource.location ?? "")
            .toLowerCase()
            .includes(query) ||
          (reservation.purpose ?? "").toLowerCase().includes(query) ||
          (isAdmin &&
            (reservation.user.name.toLowerCase().includes(query) ||
              reservation.user.email.toLowerCase().includes(query)));

        const matchesStatus =
          statusFilter === "ALL" ||
          reservation.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() -
          new Date(a.startTime).getTime()
      );
  }, [reservations, search, statusFilter, isAdmin]);

  const confirmedCount = reservations.filter(
    (reservation) => reservation.status === "CONFIRMED"
  ).length;

  const cancelledCount = reservations.filter(
    (reservation) => reservation.status === "CANCELLED"
  ).length;

  const upcomingCount = reservations.filter(
    (reservation) =>
      reservation.status === "CONFIRMED" &&
      new Date(reservation.startTime) > new Date()
  ).length;

  const hasFilters = search.trim() !== "" || statusFilter !== "ALL";

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
  }

  async function handleCancel() {
    if (!selectedReservation || cancellingId) {
      return;
    }

    const reservationId = selectedReservation.id;

    setCancellingId(reservationId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/reservations/${reservationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "CANCELLED",
          }),
        }
      );

      const result: {
        success: boolean;
        message?: string;
      } = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to cancel reservation."
        );
      }

      setReservations((previous) =>
        previous.map((reservation) =>
          reservation.id === reservationId
            ? { ...reservation, status: "CANCELLED" }
            : reservation
        )
      );

      setSuccess("Reservation cancelled successfully.");
      setSelectedReservation(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel reservation."
      );
      setSelectedReservation(null);
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <CalendarCheck2 size={22} />
            </span>
            <span className="text-xs font-semibold text-slate-400">
              CONFIRMED
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {loading ? "—" : confirmedCount}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Confirmed Reservations
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <CalendarClock size={22} />
            </span>
            <span className="text-xs font-semibold text-slate-400">
              UPCOMING
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {loading ? "—" : upcomingCount}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Upcoming Reservations
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="rounded-xl bg-slate-100 p-3 text-slate-600">
              <XCircle size={22} />
            </span>
            <span className="text-xs font-semibold text-slate-400">
              CANCELLED
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {loading ? "—" : cancelledCount}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Cancelled Reservations
          </p>
        </div>
      </div>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">
              Find a Reservation
            </h2>
            <p className="text-xs text-slate-500">
              Search and filter your booking records
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label
              htmlFor="reservation-search"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Search Reservations
            </label>

            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="reservation-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  isAdmin
                    ? "Search resource, purpose, or user..."
                    : "Search resource, location, or purpose..."
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="reservation-status"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Status
            </label>

            <select
              id="reservation-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Reservations</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </section>

      {/* Feedback */}
      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          <CheckCircle2 size={19} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results header */}
      {!loading && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-900">
              {filteredReservations.length}
            </span>{" "}
            of {reservations.length} reservations
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              <X size={15} />
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div
          role="status"
          className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm"
        >
          Loading reservations...
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <CalendarDays size={30} />
          </div>

          <h3 className="mt-5 text-lg font-bold text-slate-900">
            No reservations found
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {hasFilters
              ? "Try adjusting your search or status filter."
              : "Browse resources to create your first reservation."}
          </p>

          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Reset Filters
            </button>
          ) : (
            <Link
              href="/dashboard/resources"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={17} />
              Browse Resources
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredReservations.map((reservation) => {
            const isConfirmed =
              reservation.status === "CONFIRMED";

            const isUpcoming =
              isConfirmed &&
              new Date(reservation.startTime) > new Date();

            return (
              <article
                key={reservation.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                {/* Card heading */}
                <div className="border-b border-slate-100 p-5 sm:p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      <Tag size={13} />
                      {reservation.resource.category.name}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                        isConfirmed
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isConfirmed ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}
                      {isConfirmed ? "Confirmed" : "Cancelled"}
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/resources/${reservation.resource.id}`}
                    className="group inline-flex items-center gap-2 text-lg font-bold text-slate-900 transition hover:text-blue-700"
                  >
                    {reservation.resource.name}
                    <ArrowRight
                      size={17}
                      className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                    />
                  </Link>

                  <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin size={15} className="shrink-0" />
                    <span>
                      {reservation.resource.location ||
                        "Location not specified"}
                    </span>
                  </div>

                  {isUpcoming && (
                    <span className="mt-3 inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                      Upcoming Booking
                    </span>
                  )}
                </div>

                {/* Date and time */}
                <div className="grid grid-cols-2 gap-3 px-5 py-5 sm:px-6">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <CalendarDays size={15} className="text-blue-600" />
                      Start
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {formatDate(reservation.startTime)}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                      <Clock3 size={13} />
                      {formatTime(reservation.startTime)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <CalendarDays size={15} className="text-blue-600" />
                      End
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {formatDate(reservation.endTime)}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                      <Clock3 size={13} />
                      {formatTime(reservation.endTime)}
                    </p>
                  </div>
                </div>

                {/* Additional details */}
                <div className="flex-1 space-y-3 px-5 pb-5 sm:px-6">
                  {reservation.purpose && (
                    <div className="rounded-xl border border-slate-100 p-3">
                      <p className="text-xs font-semibold text-slate-500">
                        Reservation Purpose
                      </p>
                      <p className="mt-1 break-words text-sm text-slate-700">
                        {reservation.purpose}
                      </p>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-3">
                      <UserRound
                        size={18}
                        className="mt-0.5 shrink-0 text-blue-600"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-500">
                          Reserved By
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {reservation.user.name}
                        </p>
                        <p className="break-all text-xs text-slate-500">
                          {reservation.user.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
                  <span className="text-xs text-slate-500">
                    Times shown in Sri Lanka time
                  </span>

                  {isConfirmed ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReservation(reservation);
                        setSuccess("");
                        setError("");
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                      Cancel Reservation
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">
                      No actions available
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Cancellation confirmation modal */}
      {selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-dialog-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="mb-5 inline-flex rounded-xl bg-red-50 p-3 text-red-600">
              <AlertCircle size={27} />
            </div>

            <h2
              id="cancel-dialog-title"
              className="text-xl font-bold text-slate-900"
            >
              Cancel Reservation?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Are you sure you want to cancel your reservation for{" "}
              <span className="font-semibold text-slate-900">
                {selectedReservation.resource.name}
              </span>
              ?
            </p>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">
                Reservation Start
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatDate(selectedReservation.startTime)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {formatTime(selectedReservation.startTime)} (Sri Lanka)
              </p>
            </div>

            <div className="mt-7 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={Boolean(cancellingId)}
                onClick={() => setSelectedReservation(null)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Keep Reservation
              </button>

              <button
                type="button"
                disabled={Boolean(cancellingId)}
                onClick={handleCancel}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {cancellingId ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
