import axios, { AxiosError } from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
});

export function getApiErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return "Something went wrong. Please try again.";
  }

  const axiosError = error as AxiosError<{
    error?: { message?: string };
    message?: string;
  }>;

  return (
    axiosError.response?.data?.error?.message ??
    axiosError.response?.data?.message ??
    axiosError.message ??
    "Something went wrong. Please try again."
  );
}
