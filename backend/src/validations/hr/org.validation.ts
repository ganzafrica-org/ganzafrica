import { z } from "zod";

export const setManagerSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ manager_id: z.string().uuid().nullable() }),
});

export const getReportsSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  query: z.object({ direct: z.coerce.boolean().optional() }),
});
