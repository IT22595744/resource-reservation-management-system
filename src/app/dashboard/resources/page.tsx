import Link from "next/link";

import { prisma } from "@/lib/prisma";
import ResourceList from "@/components/resources/ResourceList";

export default async function ResourcesPage() {
  const resources = await prisma.resource.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      location: true,
      status: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      imageUrl: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-cyan-600">
            RESOURCE DIRECTORY
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Browse Resources
          </h2>

          <p className="mt-2 text-slate-500">
            Explore shared resources and find the right space or
            equipment for your needs.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ← Dashboard
        </Link>
      </div>

      <ResourceList resources={resources} />
    </div>
  );
}