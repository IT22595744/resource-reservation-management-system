"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  MapPin,
  Package,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

type Resource = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  status: "AVAILABLE" | "UNAVAILABLE";
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
  };
};

type ResourceListProps = {
  resources: Resource[];
};

export default function ResourceList({
  resources,
}: ResourceListProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const categories = useMemo(
    () =>
      Array.from(
        new Set(resources.map((resource) => resource.category.name))
      ).sort(),
    [resources]
  );

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesSearch =
        resource.name.toLowerCase().includes(query) ||
        (resource.location ?? "").toLowerCase().includes(query) ||
        (resource.description ?? "").toLowerCase().includes(query);

      const matchesCategory =
        category === "ALL" || resource.category.name === category;

      const matchesStatus =
        status === "ALL" || resource.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [resources, search, category, status]);

  const hasFilters =
    Boolean(search) || category !== "ALL" || status !== "ALL";

  function clearFilters() {
    setSearch("");
    setCategory("ALL");
    setStatus("ALL");
  }

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <SlidersHorizontal size={18} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Find a Resource
            </h2>
            <p className="text-xs text-slate-500">
              Search and filter available resources
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="resource-search"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Search Resources
            </label>

            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="resource-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search resources..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="category-filter"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Category
            </label>

            <select
              id="category-filter"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Categories</option>

              {categories.map((categoryName) => (
                <option key={categoryName} value={categoryName}>
                  {categoryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="status-filter"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Resource Status
            </label>

            <select
              id="status-filter"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Resources</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-bold text-slate-900">
            {filteredResources.length}
          </span>{" "}
          of {resources.length} resources
        </p>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
          >
            <X size={15} />
            Clear filters
          </button>
        )}
      </div>

      {/* Resource cards */}
      {filteredResources.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => {
            const isAvailable = resource.status === "AVAILABLE";
            const isRoom = resource.category.name
              .toLowerCase()
              .includes("room");

            return (
              <article
                key={resource.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >
                {/* Resource image */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  {resource.imageUrl ? (
                    <Image
                      src={resource.imageUrl}
                      alt={resource.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-blue-800 to-cyan-600 text-white">
                      {isRoom ? (
                        <Building2
                          size={52}
                          strokeWidth={1.5}
                          className="opacity-90"
                        />
                      ) : (
                        <Package
                          size={52}
                          strokeWidth={1.5}
                          className="opacity-90"
                        />
                      )}

                      <span className="mt-3 text-xs font-medium tracking-wide text-blue-100">
                        {resource.category.name}
                      </span>
                    </div>
                  )}

                  {/* Availability badge */}
                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${
                      isAvailable
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    <span
                      className={`mr-1.5 inline-block h-2 w-2 rounded-full ${
                        isAvailable ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                    {isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>

                {/* Card content */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3">
                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {resource.category.name}
                    </span>
                  </div>

                  <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
                    {resource.name}
                  </h3>

                  <p className="mt-2 line-clamp-3 min-h-18 text-sm leading-6 text-slate-500">
                    {resource.description ||
                      "Explore this resource and check its availability for your next reservation."}
                  </p>

                  <div className="mt-4 flex items-start gap-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-blue-500"
                    />

                    <span className="line-clamp-2">
                      {resource.location || "Location not specified"}
                    </span>
                  </div>

                  <div className="mt-auto pt-5">
                    <Link
                      href={`/dashboard/resources/${resource.id}`}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                        isAvailable
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {isAvailable ? "View & Reserve" : "View Details"}
                      <ArrowRight size={17} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Search size={30} />
          </div>

          <h3 className="mt-5 text-lg font-bold text-slate-900">
            No resources found
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Try adjusting your search or filter selections.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}