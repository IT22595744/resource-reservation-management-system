import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdminResourceManager from "@/components/admin/AdminResourceManager";

export default async function AdminResourcesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [resources, categories] = await Promise.all([
    prisma.resource.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-semibold text-cyan-600">
          ADMINISTRATION
        </p>

        <h1 className="text-3xl font-bold text-slate-900">
          Manage Resources
        </h1>

        <p className="mt-2 text-slate-500">
          Create, update, activate, and deactivate shared resources.
        </p>
      </div>

      <AdminResourceManager
        initialResources={resources.map((resource) => ({
          id: resource.id,
          name: resource.name,
          description: resource.description,
          location: resource.location,
          status: resource.status,
          categoryId: resource.categoryId,
          category: resource.category,

          // Resource image fields
          imageUrl: resource.imageUrl,
          imagePublicId: resource.imagePublicId,
        }))}
        categories={categories}
      />
    </div>
  );
}