import { z } from "zod";

export const createReservationSchema = z
  .object({
    resourceId: z.uuid(),

    startTime: z.iso.datetime({
      offset: true,
    }),

    endTime: z.iso.datetime({
      offset: true,
    }),

    purpose: z
      .string()
      .trim()
      .max(500)
      .optional()
      .nullable(),
  })
  .refine(
    (data) =>
      new Date(data.endTime).getTime() >
      new Date(data.startTime).getTime(),
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

export type CreateReservationInput = z.infer<
  typeof createReservationSchema
>;