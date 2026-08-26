"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores";
import { api } from "@/lib";
import { Save, Send, RefreshCw, ArrowLeft } from "lucide-react";

interface StudentScore {
  studentId: string;
  studentName: string;
  studentCode: string;
  institutional: number | "";
  industrial: number | "";
  totalScore?: number;
  status?: string;
  locked?: boolean;
}

interface ModuleData {
  id: string;
  name: string;
  code: string;
  creditHour: number;
}

interface ApiResponse {
  module: ModuleData;
  students: StudentScore[];
}

export default function GradingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { user, isAuthenticated } = useAuthStore();

  // Folder name [id] ta'uu waan danda'uuf params.id ykn params.moduleId mirkaneessina:
  const moduleId = (params?.moduleId || params?.id) as string;
  const pin = searchParams.get("pin") || "";

  const [students, setStudents] = useState<StudentScore[]>([]);
  const [moduleInfo, setModuleInfo] = useState<ModuleData | null>(null);
  const [saving, setSaving] = useState(false);

  const isTeacher = user?.role === "teacher" || user?.role === "instructor";

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["module-students", moduleId],
    queryFn: async () => {
      console.log("Fetching for moduleId:", moduleId); // Debugging
      const res = await api.get(`/marks/module/${moduleId}/students`);
      console.log("Fetched response:", res.data); // Debugging
      return res.data;
    },
    enabled: !!moduleId && isTeacher,
  });

  useEffect(() => {
    if (data) {
      if (data.students) {
        setStudents(data.students);
      }
      if (data.module) {
        setModuleInfo(data.module);
      }
    }
  }, [data]);

  // Console log error yoo jiraate ilaaluuf
  useEffect(() => {
    if (error) {
      console.error("API Error:", error);
    }
  }, [error]);

  const updateScore = (
    index: number,
    field: "institutional" | "industrial",
    value: string
  ) => {
    const updated = [...students];

    if (value === "") {
      updated[index][field] = "";
      setStudents(updated);
      return;
    }

    let numValue = Number(value);

    if (isNaN(numValue)) return;

    if (field === "institutional") {
      if (numValue > 70) numValue = 70;
      if (numValue < 0) numValue = 0;
    }

    if (field === "industrial") {
      if (numValue > 30) numValue = 30;
      if (numValue < 0) numValue = 0;
    }

    updated[index][field] = numValue;
    setStudents(updated);
  };

  const saveMarks = async (action: "draft" | "submit") => {
    try {
      setSaving(true);

      await api.post(`/marks/grading/${moduleId}/${action}`, {
        pin,
        marks: students.map((student) => ({
          studentId: student.studentId,
          institutional: Number(student.institutional) || 0,
          industrial: Number(student.industrial) || 0,
        })),
      });

      await queryClient.invalidateQueries({
        queryKey: ["module-students", moduleId],
      });

      if (action === "submit") {
        alert("Marks submitted successfully");
        router.push("/teacher");
      } else {
        alert("Draft saved successfully");
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Saving failed");
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || !isTeacher) {
    return (
      <div className="p-8 text-center text-red-600">
        Access Denied. Please log in as a teacher.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center gap-2 text-gray-600 min-h-[300px] justify-center">
        <RefreshCw className="animate-spin text-blue-600 h-5 w-5" />
        <span>Loading students...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white border rounded-xl p-6">
          <button
            onClick={() => router.push("/teacher")}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            {moduleInfo ? `${moduleInfo.name} (${moduleInfo.code})` : "Module Grading"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Institutional 70% + Industrial 30%
          </p>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 border-b text-gray-700 font-semibold">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4 text-center">Institutional (70)</th>
                <th className="p-4 text-center">Industrial (30)</th>
                <th className="p-4 text-center">Total</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                students.map((student, index) => (
                  <tr key={student.studentId} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">{student.studentName}</p>
                      <p className="text-xs text-gray-500 font-mono">{student.studentCode || student.studentId}</p>
                    </td>

                    <td className="p-4 text-center">
                      <input
                        type="number"
                        value={student.institutional}
                        disabled={student.locked}
                        onChange={(e) =>
                          updateScore(index, "institutional", e.target.value)
                        }
                        className="border rounded px-3 py-2 w-24 text-center outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </td>

                    <td className="p-4 text-center">
                      <input
                        type="number"
                        value={student.industrial}
                        disabled={student.locked}
                        onChange={(e) =>
                          updateScore(index, "industrial", e.target.value)
                        }
                        className="border rounded px-3 py-2 w-24 text-center outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </td>

                    <td className="p-4 font-bold text-center text-gray-900">
                      {(Number(student.institutional) || 0) +
                        (Number(student.industrial) || 0)}
                      /100
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3">
          <button
            disabled={saving || students.length === 0}
            onClick={() => saveMarks("draft")}
            className="flex gap-2 items-center border px-5 py-2.5 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>

          <button
            disabled={saving || students.length === 0}
            onClick={() => saveMarks("submit")}
            className="flex gap-2 items-center bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit Marks
          </button>
        </div>

      </div>
    </div>
  );
}