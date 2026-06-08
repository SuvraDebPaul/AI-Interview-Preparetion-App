import { useMutation } from "@tanstack/react-query";
import { uploadAvatar } from "@/features/auth/api/upload-avatar";

export function useUploadAvatar() {
  return useMutation({
    mutationFn: uploadAvatar,
  });
}
