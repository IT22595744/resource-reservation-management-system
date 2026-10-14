"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ShieldCheck,
} from "lucide-react";

type BookingFormProps = {
  resourceId: string;
  resourceName: string;
};

type AvailabilityResponse = {
  success: boolean;
  available?: boolean;
  message?: string;
};

type ReservationResponse = {
  success: boolean;
  message?: string;
};

export default function BookingForm({
  resourceId,
  resourceName,
}: BookingFormProps) {
  const router = useRouter();

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");

  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [availability, setAvailability] = useState<
    "available" | "unavailable" | null
  >(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function resetAvailability() {
    setAvailability(null);
    setMessage("");
    setError("");
  }

  function validateDates() {
    if (!startTime || !endTime) {
      setError("Please select both start and end times.");
      return false;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      setError("Please enter valid dates and times.");
      return false;
    }

    if (start <= new Date()) {
      setError("Start time must be in the future.");
      return false;
    }

    if (end <= start) {
      setError("End time must be after start time.");
      return false;
    }

    return true;
  }

  async function checkAvailability() {
    resetAvailability();

    if (!validateDates()) {
      return;
    }

    setChecking(true);

    try {
      const params = new URLSearchParams({
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });

      const response = await fetch(
        `/api/resources/${resourceId}/availability?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result: AvailabilityResponse =
        await response.json();

      if (!response.ok || !result.success) {
        setError(
          result.message || "Unable to check availability."
        );
        return;
      }

      if (result.available) {
        setAvailability("available");
        setMessage(
          "This resource is available for the selected time."
        );
      } else {
        setAvailability("unavailable");
        setMessage(
          result.message ||
            "This resource is already reserved for the selected time."
        );
      }
    } catch {
      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setChecking(false);
    }
  }

  async function handleReservation(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!validateDates()) {
      setAvailability(null);
      return;
    }

    if (availability !== "available") {
      setError("Please check availability before booking.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resourceId,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          purpose: purpose.trim() || null,
        }),
      });

      const result: ReservationResponse =
        await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 409) {
          setAvailability("unavailable");
        }

        setError(
          result.message ||
            "Unable to create the reservation."
        );
        return;
      }

      router.push("/dashboard/reservations");
      router.refresh();
    } catch {
      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleReservation}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
    >
    <div>
      <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3 text-blue-600">
        <CalendarCheck2 size={24} />
      </div>

      <h2 className="text-xl font-bold text-slate-900">
        Reserve This Resource
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Choose your preferred date and time to book{" "}
        <span className="font-semibold text-slate-700">
          {resourceName}
        </span>
        .
      </p>
    </div>

      <div>
        <label
          htmlFor="startTime"
          className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
        >
          <CalendarClock size={16} className="text-blue-600" />
          Start Date & Time
        </label>

        <input
          id="startTime"
          type="datetime-local"
          required
          value={startTime}
          onChange={(event) => {
            setStartTime(event.target.value);
            resetAvailability();
          }}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label
          htmlFor="endTime"
          className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
        >
          <Clock3 size={16} className="text-blue-600" />
          End Date & Time
        </label>

        <input
          id="endTime"
          type="datetime-local"
          required
          value={endTime}
          onChange={(event) => {
            setEndTime(event.target.value);
            resetAvailability();
          }}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label
          htmlFor="purpose"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Reservation Purpose (Optional)
        </label>

        <textarea
          id="purpose"
          rows={3}
          maxLength={500}
          value={purpose}
          onChange={(event) =>
            setPurpose(event.target.value)
          }
          placeholder="e.g. Weekly team meeting"
          className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

        <button
          type="button"
          onClick={checkAvailability}
          disabled={checking || submitting}
          className="w-full rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {checking
            ? "Checking Availability..."
            : "Check Availability"}
        </button>

        {availability === "available" && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700"
          >
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

      {availability === "unavailable" && (
        <div
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-700"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

        <button
          type="submit"
          disabled={
            submitting ||
            checking ||
            availability !== "available"
          }
          className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          {submitting
            ? "Creating Reservation..."
            : "Confirm Reservation"}
        </button>

        <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
          <ShieldCheck
            size={17}
            className="mt-0.5 shrink-0 text-slate-500"
          />

          <p className="text-xs leading-5 text-slate-500">
            Availability is checked again when you submit.
            Your reservation is confirmed only after the server
            successfully saves it.
          </p>
        </div>
    </form>
  );
}