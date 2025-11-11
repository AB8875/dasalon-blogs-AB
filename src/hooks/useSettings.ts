// src/hooks/useSettings.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { SiteSettings } from "@/types/settings";

type PartialSettings = Partial<SiteSettings>;

export function useSettings() {
  const queryClient = useQueryClient();

  const query = useQuery<SiteSettings | null, Error>({
    queryKey: ["settings"],
    queryFn: async () => {
      const data = await apiFetch<SiteSettings>("/api/settings");
      return data ?? null;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });

  const mutation = useMutation<unknown, Error, PartialSettings>({
    mutationFn: async (updated) => {
      const settings = query.data as SiteSettings | null;

      if (settings && settings._id) {
        return await apiFetch(`/api/settings/${settings._id}`, {
          method: "PUT",
          body: JSON.stringify({
            ...updated,
            updatedAt: new Date().toISOString(),
          }),
        });
      }

      return await apiFetch("/api/settings", {
        method: "POST",
        body: JSON.stringify({
          ...updated,
          updatedAt: new Date().toISOString(),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.refetchQueries({ queryKey: ["settings"] });
    },
  });

  // react-query v4 uses 'loading', v5 uses 'pending' — normalize with a string check
  const statusStr = String(mutation.status);
  const isSaving = statusStr === "loading" || statusStr === "pending";

  return {
    ...query,
    save: mutation.mutateAsync,
    isSaving,
  };
}
