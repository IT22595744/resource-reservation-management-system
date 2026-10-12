import { z } from "zod";

export const createResourceSchema = z.object({
  name: z.string().trim().min(2).max(100),

  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable(),

  location: z
    .string()
    .trim()
    .max(150)
    .optional()
    .nullable(),

  categoryId: z.uuid(),

  status: z
    .enum(["AVAILABLE", "UNAVAILABLE"])
    .default("AVAILABLE"),
});

export const updateResourceSchema =
  createResourceSchema.partial();

export type CreateResourceInput = z.infer<
  typeof createResourceSchema
>;