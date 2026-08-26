'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Lock, ShieldCheck } from 'lucide-react';
import { api } from '@/lib';

interface ModuleItem {
  moduleId: string;
  moduleName: string;
  institutionalScore?: number;
  industrialScore?: number;
  totalScore?: number;
  grade?: string;
  status?: string;
}

interface StudentReview {
  studentId: string;
  studentNumber: string;
  fullName: string;
  gpa: number;
  isPromoted: boolean;
  status: string;
  isFinalized: boolean;
  readyForFinalize: boolean;
  modules: ModuleItem[];
}

export default function LevelStudentsPage() {
  const params = useParams();
  const levelId = params?.levelId as string;
  const queryClient = useQueryClient();

  const { data: students = [], isLoading, isError, refetch, isFetching } = useQuery<StudentReview[]>({
    queryKey: ['committee-level-students', levelId],
    queryFn: async () => {
      const res = await api.get(`/committee/level/${levelId}/students`);
      return res.data;
    },
    enabled: !!levelId,
  });

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/committee/finalize-level/${levelId}`);
      return res.data;
    },
    onSuccess: (data) => {
      alert(data.message || 'Level successfully finalized and locked.');
      queryClient.invalidateQueries({ queryKey: ['committee-level-students', levelId] });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.detail || 'Failed to finalize level');
    },
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-600 font-medium flex items-center justify-center gap-2">
        <RefreshCw className="animate-spin text-blue-600" size={20} />
        Loading student evaluations...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 font-medium text-center">
        Error loading evaluations. Please verify backend connection.
      </div>
    );
  }

  const allFinalized = students.length > 0 && students.every((s) => s.isFinalized);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Student Evaluation Summary</h1>
            {allFinalized && (
              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-bold border border-green-300">
                <Lock size={12} /> All Locked
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Review calculated scores directly from Grading Engine and lock records for Record Office.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 border bg-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition shadow-sm"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin text-blue-600' : ''} />
            Refresh
          </button>

          <button
            onClick={() => finalizeMutation.mutate()}
            disabled={finalizeMutation.isPending || students.length === 0 || allFinalized}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-5 py-2 rounded-lg font-bold text-sm shadow transition"
          >
            {finalizeMutation.isPending ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <ShieldCheck size={18} />
            )}
            {allFinalized ? 'Level Finalized & Locked' : 'Finalize & Send to Record Office'}
          </button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="p-12 text-center bg-white border rounded-xl text-gray-500 shadow-sm">
          No student evaluations found for this level.
        </div>
      ) : (
        <div className="space-y-6">
          {students.map((student) => (
            <div
              key={student.studentId}
              className={`bg-white border rounded-xl p-6 shadow-sm space-y-4 ${
                student.isFinalized ? 'border-green-200 bg-green-50/10' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center border-b pb-4 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">{student.fullName}</h3>
                    {student.isFinalized && (
                      <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">
                        <Lock size={12} /> Locked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-mono">ID: {student.studentNumber}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm font-bold border border-indigo-200">
                    GPA: {student.gpa.toFixed(2)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-md text-xs font-bold uppercase ${
                      student.isPromoted
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    {student.isPromoted ? 'COMPETENT (PROMOTED)' : 'RETAINED'}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                    <tr>
                      <th className="p-3">Module Name</th>
                      <th className="p-3 text-center">Inst (70)</th>
                      <th className="p-3 text-center">Ind (30)</th>
                      <th className="p-3 text-center">Total (100)</th>
                      <th className="p-3 text-center">Grade</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {student.modules.map((m, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="p-3 font-medium text-gray-900">{m.moduleName}</td>
                        <td className="p-3 text-center text-gray-600">{m.institutionalScore ?? 0}</td>
                        <td className="p-3 text-center text-gray-600">{m.industrialScore ?? 0}</td>
                        <td className="p-3 text-center font-bold text-gray-900">{m.totalScore ?? 0}</td>
                        <td className="p-3 text-center font-bold text-indigo-600">{m.grade || '-'}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`text-xs px-2.5 py-1 rounded font-bold ${
                              m.status === 'PASS'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {m.status || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
