import { create } from "zustand";

type OAuthProvider = "google" | "github" | null;

type AuthState = {
  oAuthProvider: OAuthProvider;
  setOAuthProvider: (provider: OAuthProvider) => void;
  resetOAuthProvider: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  oAuthProvider: null,
  setOAuthProvider: (provider) => set({ oAuthProvider: provider }),
  resetOAuthProvider: () => set({ oAuthProvider: null }),
}));
