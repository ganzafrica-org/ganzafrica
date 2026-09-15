import { z } from "zod";

export const settingKeySchema = z.object({
  params: z.object({ key: z.string().min(1) }),
});

export const putSettingSchema = z.object({
  params: z.object({ key: z.string().min(1) }),
  body: z.object({ value: z.unknown() }),
});
