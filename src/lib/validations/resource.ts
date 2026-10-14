import { z } from "zod";

const imageFields = {
  imageUrl: z
    .url()
    .startsWith("https://res.cloudinary.com/")
    .max(2048)
    .optional(),

  imagePublicId: z
    .string()
    .startsWith("reservehub/resources/")
    .max(255)
    .optional(),
};

export const createResourceSchema = z.object({
  name: z.string().trim().min(2).max(100),

  description: z.string().trim().max(500).optional().nullable(),

  location: z.string().trim().max(150).optional().nullable(),

  categoryId: z.uuid(),

  status: z
    .enum(["AVAILABLE", "UNAVAILABLE"])
    .default("AVAILABLE"),

  ...imageFields,
}).refine(
  (data) => Boolean(data.imageUrl) === Boolean(data.imagePublicId),
  {
    message: "Image URL and public ID must be provided together",
    path: ["imageUrl"],
  }
);

export const updateResourceSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),

    description: z.string().trim().max(500).optional().nullable(),

    location: z.string().trim().max(150).optional().nullable(),

    categoryId: z.uuid().optional(),

    status: z.enum(["AVAILABLE", "UNAVAILABLE"]).optional(),

    ...imageFields,
  })
  .refine(
    (data) => Boolean(data.imageUrl) === Boolean(data.imagePublicId),
    {
      message: "Image URL and public ID must be provided together",
      path: ["imageUrl"],
    }
  );

export type CreateResourceInput = z.infer<
  typeof createResourceSchema
>;

export type UpdateResourceInput = z.infer<
  typeof updateResourceSchema
>;