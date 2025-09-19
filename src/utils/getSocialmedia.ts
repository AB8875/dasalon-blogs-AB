import { socialMediaLink, subscribeSalon } from "@/service/blog/SocialMedia";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSocialMedia = () => {
  return useQuery({
    queryKey: ["socialmedia"],
    queryFn: () => socialMediaLink(),
  });
};
export const useSubscriber = () => {
  return useMutation({
    mutationFn: subscribeSalon,
    onSuccess: () => {
      toast.success("Subscribed Successfully!");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Subscription Failed");
      }
    },
  });
};
