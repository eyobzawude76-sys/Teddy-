"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { api } from "@/lib";
import { useAuthStore } from "@/stores";
import { Eye, EyeOff, LockKeyhole, Mail, Loader2 } from "lucide-react";

// =========================================================
// LOGIN VALIDATION
// =========================================================

const loginSchema = z.object({
  email: z.string().min(1, "Email or Username is required"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// =========================================================
// LOGIN PAGE
// =========================================================

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const setAuth = useAuthStore(
    (state) => state.setAuth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // =======================================================
  // LOGIN
  // =======================================================

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post(
        "/auth/login",
        data
      );

      const {
        access_token,
        refresh_token,
        user,
      } = response.data;

      if (
        !access_token ||
        !refresh_token ||
        !user
      ) {
        throw new Error(
          "Invalid response from server"
        );
      }

      setAuth(
        user,
        access_token,
        refresh_token
      );

      localStorage.setItem(
        "access_token",
        access_token
      );

      localStorage.setItem(
        "refresh_token",
        refresh_token
      );

      const role = String(user.role)
        .toLowerCase()
        .trim();

      // =====================================================
      // ROLE REDIRECT
      // =====================================================

      switch (role) {
        case "admin":
          router.push("/admin");
          break;

        case "department":
        case "department_head":
        case "departmenthead":
          router.push("/department");
          break;

        case "teacher":
        case "instructor":
          router.push("/teacher");
          break;

        case "committee":
          router.push("/committee");
          break;

        case "record_office":
        case "record_officer":
          router.push("/records");
          break;

        case "student":
          router.push("/student");
          break;

        default:
          setError(
            `Unknown user role: ${user.role}`
          );
          break;
      }
    } catch (err: any) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // UI
  // =======================================================

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-blue-100 blur-3xl opacity-60" />

        <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-indigo-100 blur-3xl opacity-60" />
      </div>

      {/* Login container */}
      <section className="relative w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

          {/* Header */}
          <div className="px-6 sm:px-8 pt-8 pb-6 text-center">

            {/* Logo */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
              <span className="text-2xl font-bold text-white">
                C
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm sm:text-base text-slate-500">
            Kolleejjii Polii
        
                Teeknikaa Arjoo
            </p>

            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Sign in to continue to your account
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 sm:px-8 pb-8 space-y-5"
          >

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3"
              >
                <p className="text-sm font-medium text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Email / Username */}
            <div className="space-y-2">

              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700"
              >
                Email or Username
              </label>

              <div className="relative">

                <Mail
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  {...register("email")}
                  type="text"
                  placeholder="Enter your email or username"
                  autoComplete="username"
                  disabled={loading}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    bg-slate-50
                    py-3
                    pl-11
                    pr-4
                    text-sm
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-blue-500
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-100
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                />

              </div>

              {errors.email && (
                <p className="text-xs font-medium text-red-500">
                  {errors.email.message}
                </p>
              )}

            </div>

            {/* Password */}
            <div className="space-y-2">

              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  {...register("password")}
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    bg-slate-50
                    py-3
                    pl-11
                    pr-12
                    text-sm
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-blue-500
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-100
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    rounded-lg
                    p-1.5
                    text-slate-400
                    transition
                    hover:bg-slate-100
                    hover:text-slate-600
                  "
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

              {errors.password && (
                <p className="text-xs font-medium text-red-500">
                  {errors.password.message}
                </p>
              )}

            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-blue-600
                px-4
                py-3
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-blue-200
                transition-all
                duration-200
                hover:bg-blue-700
                hover:shadow-xl
                focus:outline-none
                focus:ring-4
                focus:ring-blue-200
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:bg-blue-400
                disabled:shadow-none
              "
            >

              {loading ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />

                  <span>
                    Logging in...
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Login
                  </span>
                </>
              )}

            </button>

            {/* Footer text */}
            <div className="pt-2 text-center">
              <p className="text-xs text-slate-400">
                Secure access to your college account
              </p>
            </div>

          </form>
        </div>

        {/* Copyright */}
        <p className="mt-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()}  Kolleejjii Polii
        
                Teeknikaa Arjoo
        </p>

      </section>
    </main>
  );
}