"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib";
import {
  BookOpen,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { useEffect } from "react";

export interface TeacherModule {
  _id: string;
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  creditHour?: number;
  assignedAt?: string;
}

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  // Checks both "teacher" and "instructor" roles safely
  const isTeacher = user?.role === "teacher" || user?.role === "instructor";

  const {
    data: modules,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["teacher-modules"],
    queryFn: async () => {
      // Direct call to module-assignments router
      const res = await api.get("/module-assignments/teacher");
      return res.data as TeacherModule[];
    },
    enabled: !!isAuthenticated && isTeacher,
  });
// 1. Logic redirect gochuu useEffect keessatti caasaa:
useEffect(() => {
  if (!isAuthenticated) {
    router.push("/login");
  } else if (!isTeacher) {
    router.push("/");
  }
}, [isAuthenticated, isTeacher, router]);

// 2. Component-ni osoo redirect hin ta'in dura akka waan tokko hin agarsiisneef:
if (!isAuthenticated || !isTeacher) {
  return null;
}

  // DIRECT ACCESS: PIN malee kallattiidhaan fuula grading'tti geessa
  const handleOpenModule = (module: TeacherModule) => {
    const targetId = module.moduleId || module._id;
    router.push(`/teacher/grading/${targetId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">
                Module kee filachuun kallattiidhaan qabxii (marks) galchuu dandeessa.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active Session
            </span>
          </div>
        </div>

        {/* MODULE LIST */}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-bold text-lg text-gray-900">My Assigned Modules</h2>
              <p className="text-xs text-gray-500">Module-aloota siif ramadaman kanneen gadii irraa banaa</p>
            </div>
            <button
              onClick={() => refetch()}
              className="p-2 border rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-xs text-gray-600"
              title="Refresh Modules"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500 space-y-3">
              <RefreshCw className="animate-spin text-blue-600 h-8 w-8" />
              <p className="text-sm">Module'n kee fe'amaa jira...</p>
            </div>
          ) : modules?.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium">Module'n tokkollee siif hin ramadamne.</p>
              <p className="text-gray-400 text-xs mt-1">Mallaqqi ykn Department Head kee qunnami.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {modules?.map((module) => (
                <div
                  key={module._id}
                  className="border rounded-xl p-5 bg-white hover:border-blue-500 hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4"
                >
                  <div className="flex gap-3 items-start">
                    <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                        {module.moduleCode || "NO CODE"}
                      </span>
                      <h3 className="font-bold text-gray-900 text-lg mt-1">{module.moduleName}</h3>
                      {module.creditHour && (
                        <p className="text-xs text-gray-500 mt-0.5">Credit Hours: {module.creditHour}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenModule(module)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition duration-150 shadow-sm"
                  >
                    <span>Open Module</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}