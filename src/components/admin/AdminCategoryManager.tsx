
"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  FolderOpen,
  FolderPlus,
  Layers3,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  createdAt: string;
  resourceCount: number;
};

type Props = {
  initialCategories: Category[];
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    id: string;
    name: string;
  };
};

export default function AdminCategoryManager({
  initialCategories,
}: Props) {
  const router = useRouter();

  const [categories, setCategories] =
    useState<Category[]>(initialCategories);

  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<
    "create" | "edit" | null
  >(null);

  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState<Category | null>(null);

  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories.filter((category) =>
      category.name.toLowerCase().includes(query)
    );
  }, [categories, search]);

  const totalResources = categories.reduce(
    (sum, category) => sum + category.resourceCount,
    0
  );

  const emptyCategories = categories.filter(
    (category) => category.resourceCount === 0
  ).length;

  function openCreateModal() {
    setNotice(null);
    setSelectedCategory(null);
    setCategoryName("");
    setModalMode("create");
  }

  function openEditModal(category: Category) {
    setNotice(null);
    setSelectedCategory(category);
    setCategoryName(category.name);
    setModalMode("edit");
  }

  function closeModal() {
    if (isSubmitting) return;

    setModalMode(null);
    setSelectedCategory(null);
    setCategoryName("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = categoryName.trim();

    if (name.length < 2 || name.length > 80) {
      setNotice({
        type: "error",
        message:
          "Category name must contain between 2 and 80 characters.",
      });
      return;
    }

    setIsSubmitting(true);
    setNotice(null);

    try {
      const isEditing = modalMode === "edit";

      if (isEditing && !selectedCategory) {
        throw new Error("No category selected.");
      }

      const url = isEditing
        ? `/api/categories/${selectedCategory?.id}`
        : "/api/categories";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.data) {
        throw new Error(
          result.message || "Unable to save category."
        );
      }

      const saved = result.data;

      if (isEditing) {
        setCategories((previous) =>
          previous
            .map((category) =>
              category.id === saved.id
                ? { ...category, name: saved.name }
                : category
            )
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      } else {
        setCategories((previous) =>
          [
            ...previous,
            {
              id: saved.id,
              name: saved.name,
              createdAt: new Date().toISOString(),
              resourceCount: 0,
            },
          ].sort((a, b) => a.name.localeCompare(b.name))
        );
      }

      setModalMode(null);
      setSelectedCategory(null);
      setCategoryName("");

      setNotice({
        type: "success",
        message: isEditing
          ? "Category updated successfully."
          : "Category created successfully.",
      });

      router.refresh();
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    setNotice(null);

    try {
      const response = await fetch(
        `/api/categories/${deleteTarget.id}`,
        {
          method: "DELETE",
        }
      );

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to delete category."
        );
      }

      setCategories((previous) =>
        previous.filter(
          (category) => category.id !== deleteTarget.id
        )
      );

      setDeleteTarget(null);

      setNotice({
        type: "success",
        message: "Category deleted successfully.",
      });

      router.refresh();
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to delete category.",
      });
      setDeleteTarget(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notice && (
        <div
          role="alert"
          className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-sm ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{notice.message}</span>
          </div>

          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Categories",
            value: categories.length,
            icon: Layers3,
            color: "text-blue-600",
            background: "bg-blue-50",
          },
          {
            label: "Assigned Resources",
            value: totalResources,
            icon: FolderOpen,
            color: "text-violet-600",
            background: "bg-violet-50",
          },
          {
            label: "Empty Categories",
            value: emptyCategories,
            icon: FolderPlus,
            color: "text-amber-600",
            background: "bg-amber-50",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.background} ${stat.color}`}
              >
                <Icon size={22} />
              </div>

              <p className="mt-4 text-sm font-medium text-slate-500">
                {stat.label}
              </p>

              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Category list */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Resource Categories
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Organize and manage resource classifications.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={17} />
            Add Category
          </button>
        </div>

        <div className="p-5">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search categories..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="px-5 pb-10 pt-4 text-center">
            <FolderOpen
              size={36}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-semibold text-slate-700">
              No categories found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {search
                ? "Try a different search term."
                : "Create your first resource category."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">
                    Category
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Resources
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Created
                  </th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Layers3 size={19} />
                        </div>

                        <span className="font-semibold text-slate-900">
                          {category.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {category.resourceCount} resources
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Intl.DateTimeFormat("en-LK", {
                        timeZone: "Asia/Colombo",
                        dateStyle: "medium",
                      }).format(new Date(category.createdAt))}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(category)
                          }
                          aria-label={`Edit ${category.name}`}
                          className="rounded-lg border border-slate-200 p-2 text-blue-600 transition hover:bg-blue-50"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setNotice(null);
                            setDeleteTarget(category);
                          }}
                          aria-label={`Delete ${category.name}`}
                          className="rounded-lg border border-slate-200 p-2 text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Create / Edit modal */}
      {modalMode && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3">
              <h2
                id="category-modal-title"
                className="text-xl font-bold text-slate-900"
              >
                {modalMode === "create"
                  ? "Add Category"
                  : "Edit Category"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              {modalMode === "create"
                ? "Create a new classification for shared resources."
                : "Update the category name. Existing resources will remain assigned."}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Category Name
                </label>

                <input
                  id="category-name"
                  autoFocus
                  required
                  minLength={2}
                  maxLength={80}
                  value={categoryName}
                  onChange={(event) =>
                    setCategoryName(event.target.value)
                  }
                  placeholder="e.g. Equipment"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Saving..."
                    : modalMode === "create"
                      ? "Create Category"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={23} />
            </div>

            <h2
              id="delete-category-title"
              className="mt-4 text-xl font-bold text-slate-900"
            >
              Delete Category?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>?
            </p>

            {deleteTarget.resourceCount > 0 && (
              <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                This category contains{" "}
                {deleteTarget.resourceCount} resources.
                Reassign these resources before deleting it.
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  isSubmitting ||
                  deleteTarget.resourceCount > 0
                }
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? "Deleting..."
                  : "Delete Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
