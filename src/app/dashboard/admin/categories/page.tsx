
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdminCategoryManager from "@/components/admin/AdminCategoryManager";

export default async function AdminCategoriesPage() {
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

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: {
        select: {
          resources: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-semibold text-cyan-600">
          ADMINISTRATION
        </p>

        <h1 className="text-3xl font-bold text-slate-900">
          Manage Categories
        </h1>

        <p className="mt-2 text-slate-500">
          Create, edit, and delete resource categories to keep
          your workspace organized.
        </p>
      </div>

      <AdminCategoryManager
        initialCategories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          createdAt: category.createdAt.toISOString(),
          resourceCount: category._count.resources,
        }))}
      />
    </div>
  );
}
