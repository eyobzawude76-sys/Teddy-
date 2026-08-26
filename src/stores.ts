import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  username?: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setAuth: (
    user: User,
    accessToken: string,
    refreshToken: string
  ) => void;

  logout: () => void;

  updateUser: (user: User) => void;
}

export const useAuthStore =
  create<AuthState>()(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,

        setAuth: (
          user,
          accessToken,
          refreshToken
        ) => {
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
          });
        },

        logout: () => {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });

          if (
            typeof window !== "undefined"
          ) {
            localStorage.removeItem(
              "access_token"
            );

            localStorage.removeItem(
              "refresh_token"
            );
          }
        },

        updateUser: (user) => {
          set({ user });
        },
      }),

      {
        name: "auth-storage",
      }
    )
  )