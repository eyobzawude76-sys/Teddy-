import axios from "axios";
import { useAuthStore } from "@/stores";

import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  FileText,
  BarChart3,
  Shield,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

/* =========================================================
   NAVIGATION TYPES
========================================================= */

export type RoleNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

/* =========================================================
   ROLE NAVIGATION
========================================================= */

export const roleNavItems: Record<string, RoleNavItem[]> = {
  admin: [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "Departments",
      href: "/admin/departments",
      icon: Building2,
    },
    {
      label: "Pending Students",
      href: "/admin/students/pending",
      icon: GraduationCap,
    },
    {
      label: "Promotions",
      href: "/admin/promotions",
      icon: ClipboardCheck,
    },
    {
      label: "Reports",
      href: "/admin/reports",
      icon: BarChart3,
    },
    {
      label: "Audit Logs",
      href: "/admin/audit-logs",
      icon: Shield,
    },
  ],

  department: [
    {
      label: "Dashboard",
      href: "/department",
      icon: LayoutDashboard,
    },
    {
      label: "Levels",
      href: "/department/levels",
      icon: BookOpen,
    },
    {
      label: "Modules",
      href: "/department/modules",
      icon: BookOpen,
    },
    {
      label: "Teachers",
      href: "/department/teachers",
      icon: Users,
    },
    {
      label: "Review Marks",
      href: "/department/review",
      icon: ClipboardCheck,
    },
  ],

  teacher: [
    {
      label: "Dashboard",
      href: "/teacher",
      icon: LayoutDashboard,
    },
    {
      label: "Enter Marks",
      href: "/teacher/marks-entry",
      icon: FileText,
    },
  ],

  committee: [
    {
      label: "Dashboard",
      href: "/committee",
      icon: LayoutDashboard,
    },
    {
      label: "Review Results",
      href: "/committee/review",
      icon: ClipboardCheck,
    },
  ],

  record_officer: [
    {
      label: "Dashboard",
      href: "/records",
      icon: LayoutDashboard,
    },
    {
      label: "Students",
      href: "/records/students",
      icon: Users,
    },
    {
      label: "Transcripts",
      href: "/records/transcripts",
      icon: FileText,
    },
  ],

  student: [
    {
      label: "Dashboard",
      href: "/student",
      icon: LayoutDashboard,
    },
    {
      label: "My Profile",
      href: "/student/profile",
      icon: Users,
    },
    {
      label: "My Marks",
      href: "/student/marks",
      icon: FileText,
    },
    {
      label: "History",
      href: "/student/history",
      icon: BookOpen,
    },
    {
      label: "Transcript",
      href: "/student/transcript",
      icon: FileText,
    },
  ],
};

/* =========================================================
   API CLIENT
========================================================= */

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://college-management-backend-ysny.onrender.com/api/v1",

  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================================================
   REQUEST INTERCEPTOR
========================================================= */

api.interceptors.request.use(
  (config) => {
    const authState = useAuthStore.getState();

    const token =
      authState.accessToken ||
      (typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null);

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);

/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Login/refresh irratti 401 yoo dhufe
    // refresh loop akka hin uumamne
    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken =
      useAuthStore.getState().refreshToken ||
      (typeof window !== "undefined"
        ? localStorage.getItem("refresh_token")
        : null);

    if (!refreshToken) {
      useAuthStore.getState().logout();

      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }

    try {
      /* =====================================================
         REFRESH TOKEN
      ===================================================== */

      const refreshResponse = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        {
          refresh_token: refreshToken,
        }
      );

      const {
        access_token,
        refresh_token: newRefreshToken,
      } = refreshResponse.data;

      if (!access_token) {
        throw new Error("No access token returned");
      }

      const currentUser =
        useAuthStore.getState().user;

      if (!currentUser) {
        throw new Error("Current user not found");
      }

      const finalRefreshToken =
        newRefreshToken || refreshToken;

      /* =====================================================
         UPDATE AUTH STORE
      ===================================================== */

      useAuthStore.getState().setAuth(
        currentUser,
        access_token,
        finalRefreshToken
      );

      /* =====================================================
         UPDATE LOCAL STORAGE
      ===================================================== */

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "access_token",
          access_token
        );

        localStorage.setItem(
          "refresh_token",
          finalRefreshToken
        );
      }

      /* =====================================================
         RETRY ORIGINAL REQUEST
      ===================================================== */

      originalRequest.headers = {
        ...(originalRequest.headers || {}),
        Authorization: `Bearer ${access_token}`,
      };

      return api(originalRequest);
    } catch (refreshError) {
      console.error(
        "TOKEN REFRESH FAILED:",
        refreshError
      );

      useAuthStore.getState().logout();

      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    }
  }
);

/* =========================================================
   CLASS NAME HELPER
========================================================= */

export function cn(
  ...classes: Array<
    string | undefined | null | false
  >
): string {
  return classes.filter(Boolean).join(" ")};