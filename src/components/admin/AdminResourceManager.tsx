
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  AlertCircle,
  Boxes,
  CheckCircle2,
  CircleOff,
  ImageIcon,
  MapPin,
  Pencil,
  Plus,
  Search,
  UploadCloud,
  X,
} from "lucide-react";

type ResourceStatus = "AVAILABLE" | "UNAVAILABLE";

type Category = {
  id: string;
  name: string;
};

type Resource = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  status: ResourceStatus;
  categoryId: string;
  category: Category;
  imageUrl: string | null;
  imagePublicId: string | null;
};

type Props = {
  initialResources: Resource[];
  categories: Category[];
};

type ResourceForm = {
  name: string;
  description: string;
  location: string;
  categoryId: string;
  status: ResourceStatus;
};

type UploadedImage = {
  imageUrl: string;
  imagePublicId: string;
};

function emptyForm(categoryId = ""): ResourceForm {
  return {
    name: "",
    description: "",
    location: "",
    categoryId,
    status: "AVAILABLE",
  };
}

async function readError(response: Response): Promise<string> {
  try {
    const result = await response.json();

    return (
      result.message ||
      result.error ||
      `Request failed with status ${response.status}.`
    );
  } catch {
    return `Request failed with status ${response.status}.`;
  }
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700";

export default function AdminResourceManager({
  initialResources,
  categories,
}: Props) {
  const router = useRouter();

  const resources = initialResources;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | ResourceStatus
  >("ALL");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const [form, setForm] = useState<ResourceForm>(
    emptyForm(categories[0]?.id)
  );

  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedImage, setSelectedImage] = useState<File | null>(
    null
  );

  const [imagePreview, setImagePreview] = useState<string | null>(
    null
  );

  const [formError, setFormError] = useState("");

  const objectUrlRef = useRef<string | null>(null);

  // Clean up temporary browser image URLs when unmounting.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  function releaseImagePreview() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesSearch = [
        resource.name,
        resource.description ?? "",
        resource.location ?? "",
        resource.category.name,
      ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "ALL" ||
        resource.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [resources, search, statusFilter]);

  const availableCount = resources.filter(
    (resource) => resource.status === "AVAILABLE"
  ).length;

  const unavailableCount = resources.filter(
    (resource) => resource.status === "UNAVAILABLE"
  ).length;

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFormError(
        "Only JPG, PNG, and WebP images are allowed."
      );
      event.target.value = "";
      return;
    }

    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      setFormError(
        "Image must be between 1 byte and 5 MB."
      );
      event.target.value = "";
      return;
    }

    releaseImagePreview();

    const previewUrl = URL.createObjectURL(file);
    objectUrlRef.current = previewUrl;

    setSelectedImage(file);
    setImagePreview(previewUrl);
    setFormError("");
  }

  function openCreate() {
    releaseImagePreview();

    setEditingId(null);
    setForm(emptyForm(categories[0]?.id));
    setSelectedImage(null);
    setImagePreview(null);

    setFormError("");
    setError("");
    setSuccess("");
    setFormOpen(true);
  }

  function openEdit(resource: Resource) {
    releaseImagePreview();

    setEditingId(resource.id);

    setForm({
      name: resource.name,
      description: resource.description ?? "",
      location: resource.location ?? "",
      categoryId: resource.categoryId,
      status: resource.status,
    });

    setSelectedImage(null);
    setImagePreview(resource.imageUrl);

    setFormError("");
    setError("");
    setSuccess("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;

    releaseImagePreview();

    setFormOpen(false);
    setEditingId(null);
    setSelectedImage(null);
    setImagePreview(null);
    setFormError("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim() || !form.categoryId) {
      setFormError(
        "Resource name and category are required."
      );
      return;
    }

    if (saving) return;

    setSaving(true);
    setFormError("");
    setError("");
    setSuccess("");

    const isEditing = Boolean(editingId);

    try {
      let uploadedImage: UploadedImage | undefined;

      // Step 1: Upload new image if one was selected.
      if (selectedImage) {
        const imageData = new FormData();
        imageData.append("image", selectedImage);

        const uploadResponse = await fetch(
          "/api/uploads/resource-image",
          {
            method: "POST",
            body: imageData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error(
            await readError(uploadResponse)
          );
        }

        const uploadResult: {
          success?: boolean;
          data?: UploadedImage;
        } = await uploadResponse.json();

        if (
          !uploadResult.success ||
          !uploadResult.data?.imageUrl ||
          !uploadResult.data?.imagePublicId
        ) {
          throw new Error(
            "Image upload returned invalid data."
          );
        }

        uploadedImage = uploadResult.data;
      }

      // Step 2: Save resource details.
      const response = await fetch(
        isEditing
          ? `/api/resources/${editingId}`
          : "/api/resources",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim() || null,
            location: form.location.trim() || null,
            categoryId: form.categoryId,
            status: form.status,

            ...(uploadedImage
              ? {
                  imageUrl: uploadedImage.imageUrl,
                  imagePublicId:
                    uploadedImage.imagePublicId,
                }
              : {}),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      // Step 3: Clear form after successful save.
      releaseImagePreview();

      setSelectedImage(null);
      setImagePreview(null);
      setEditingId(null);
      setFormOpen(false);

      setSuccess(
        isEditing
          ? "Resource updated successfully."
          : "Resource created successfully."
      );

      router.refresh();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to save resource."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(resource: Resource) {
    if (busyId || saving) return;

    const deactivate = resource.status === "AVAILABLE";

    const confirmed = window.confirm(
      deactivate
        ? `Deactivate "${resource.name}"? Users will not be able to create new reservations for it.`
        : `Activate "${resource.name}"?`
    );

    if (!confirmed) return;

    setBusyId(resource.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/resources/${resource.id}`,
        deactivate
          ? {
              method: "DELETE",
            }
          : {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status: "AVAILABLE",
              }),
            }
      );

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      setSuccess(
        deactivate
          ? "Resource deactivated successfully."
          : "Resource activated successfully."
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to change resource status."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Boxes size={22} />
            </div>

            <span className="text-xs font-bold text-slate-400">
              TOTAL
            </span>
          </div>

          <p className="mt-4 text-3xl font-bold text-slate-900">
            {resources.length}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Total Resources
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>

            <span className="text-xs font-bold text-slate-400">
              ACTIVE
            </span>
          </div>

          <p className="mt-4 text-3xl font-bold text-slate-900">
            {availableCount}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Available Resources
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <CircleOff size={22} />
            </div>

            <span className="text-xs font-bold text-slate-400">
              INACTIVE
            </span>
          </div>

          <p className="mt-4 text-3xl font-bold text-slate-900">
            {unavailableCount}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Unavailable Resources
          </p>
        </div>
      </div>

      {/* Search and filter toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900">
              Resource Directory
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Manage resource information, images, and
              availability.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            disabled={saving || Boolean(busyId)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />
            Add Resource
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              aria-label="Search resources"
              placeholder="Search name, category, or location..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            aria-label="Filter resources by status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as "ALL" | ResourceStatus
              )
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Success message */}
      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          <CheckCircle2 size={19} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Resource management table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-900">
            Manage Resources
          </h2>

          <span className="text-xs font-medium text-slate-500">
            Showing {filteredResources.length} of{" "}
            {resources.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Resource</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredResources.map((resource) => {
                const isAvailable =
                  resource.status === "AVAILABLE";

                return (
                  <tr
                    key={resource.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex min-w-[230px] items-center gap-3">
                        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          {resource.imageUrl ? (
                            <Image
                              src={resource.imageUrl}
                              alt={resource.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-900 to-cyan-600 text-white">
                              <ImageIcon size={25} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="font-bold text-slate-900">
                            {resource.name}
                          </p>

                          <p className="mt-1 max-w-48 truncate text-xs text-slate-500">
                            {resource.description ||
                              "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {resource.category.name}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <MapPin
                          size={15}
                          className="shrink-0 text-blue-500"
                        />
                        {resource.location || "Not specified"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                          isAvailable
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isAvailable
                              ? "bg-emerald-500"
                              : "bg-red-500"
                          }`}
                        />

                        {isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(resource)}
                          disabled={Boolean(busyId) || saving}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(resource)
                          }
                          disabled={Boolean(busyId) || saving}
                          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                            isAvailable
                              ? "border-red-200 text-red-700 hover:bg-red-50"
                              : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {busyId === resource.id
                            ? "Updating..."
                            : isAvailable
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredResources.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Search
              size={30}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-3 font-bold text-slate-900">
              No resources found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or status filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              <X size={15} />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit resource modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="resource-form-title"
            className="my-8 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
          >
            {/* Modal heading */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-blue-600">
                  RESOURCE MANAGEMENT
                </p>

                <h2
                  id="resource-form-title"
                  className="text-xl font-bold text-slate-900"
                >
                  {editingId
                    ? "Edit Resource"
                    : "Add New Resource"}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {editingId
                    ? "Update resource information and replace its photo if needed."
                    : "Create a new resource for users to reserve."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close resource form"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal error */}
            {formError && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle
                  size={18}
                  className="shrink-0"
                />
                <span>{formError}</span>
              </div>
            )}

            <form
              onSubmit={handleSave}
              className="mt-6 space-y-5"
            >
              {/* Resource image */}
              <div>
                <label
                  htmlFor="resource-image"
                  className={labelClass}
                >
                  Resource Image
                </label>

                <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-4">
                  {imagePreview ? (
                    <div className="relative mb-4 h-48 overflow-hidden rounded-xl bg-slate-100">
                      {imagePreview.startsWith("blob:") ? (
                        // Browser-generated previews use blob URLs.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imagePreview}
                          alt="Selected resource image preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Image
                          src={imagePreview}
                          alt="Resource image preview"
                          fill
                          sizes="(max-width: 640px) 100vw, 520px"
                          className="object-cover"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="mb-4 flex h-40 flex-col items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <ImageIcon size={42} />

                      <p className="mt-3 text-sm font-medium">
                        No image selected
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                    <UploadCloud size={17} />
                    Upload Resource Photo
                  </div>

                  <input
                    key={editingId ?? "new"}
                    id="resource-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    disabled={saving}
                    className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:font-semibold file:text-white hover:file:bg-blue-700 disabled:opacity-50"
                  />

                  <p className="mt-3 text-xs text-slate-500">
                    JPG, PNG, or WebP. Maximum file size: 5 MB.
                  </p>

                  {editingId && imagePreview && (
                    <p className="mt-2 text-xs text-blue-700">
                      Select another image to replace the current
                      photo.
                    </p>
                  )}
                </div>
              </div>

              {/* Resource name */}
              <div>
                <label
                  htmlFor="resource-name"
                  className={labelClass}
                >
                  Resource Name *
                </label>

                <input
                  id="resource-name"
                  required
                  maxLength={150}
                  value={form.name}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Conference Room A"
                  className={inputClass}
                />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="resource-category"
                  className={labelClass}
                >
                  Category *
                </label>

                <select
                  id="resource-category"
                  required
                  value={form.categoryId}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      categoryId: event.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="">Select category</option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="resource-location"
                  className={labelClass}
                >
                  Location
                </label>

                <input
                  id="resource-location"
                  value={form.location}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      location: event.target.value,
                    }))
                  }
                  placeholder="e.g. Floor 2, Building A"
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="resource-description"
                  className={labelClass}
                >
                  Description
                </label>

                <textarea
                  id="resource-description"
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe this resource..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="resource-status"
                  className={labelClass}
                >
                  Status
                </label>

                <select
                  id="resource-status"
                  value={form.status}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      status: event.target.value as ResourceStatus,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="UNAVAILABLE">
                    Unavailable
                  </option>
                </select>
              </div>

              {/* Form actions */}
              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeForm}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving || categories.length === 0
                  }
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Uploading / Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Resource"}
                </button>
              </div>
            </form>

            {categories.length === 0 && (
              <p className="mt-4 text-sm text-amber-700">
                No categories exist yet. Create a category
                in the database before adding resources.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
