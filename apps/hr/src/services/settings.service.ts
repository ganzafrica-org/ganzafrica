import { httpClient } from "@/services/http.service";

/** Generic HR settings store (key-value), e.g. "require_multiple_signers". */
export const settingsService = {
  async get<T = unknown>(key: string): Promise<T | null> {
    const { data } = await httpClient.get<{ value: T | null }>(`/hr/settings/${key}`);
    return data.value;
  },

  async set<T = unknown>(key: string, value: T): Promise<void> {
    await httpClient.put(`/hr/settings/${key}`, { value });
  },
};
