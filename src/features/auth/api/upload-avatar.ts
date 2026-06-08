import { apiClient } from "@/services/http";

type UploadAvatarResponse = {
  success: true;
  data: {
    url: string;
  };
  message?: string;
};

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<UploadAvatarResponse>(
    "/upload",
    formData,
  );

  return data.data.url;
}
