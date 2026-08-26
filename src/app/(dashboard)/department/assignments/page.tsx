'use client';
import { useQuery } from "@tanstack/react-query";// Sarara 82-88:
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib";
import { useAuthStore } from "@/stores";
import {
  Users,
  BookOpen,
  RefreshCw,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Plus,
  X
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

type Module = {
  _id: string;
  name: string;
  code: string;
  creditHour?: number;
  departmentId?: string;
  levelId?: string;
};

type Teacher = {
  _id: string;
  fullName: string;
  username?: string;
  level?: string;
  email?: string;
  departmentId?: string;
};

type Assignment = {
  _id: string;
  moduleId: string;
  teacherId: string;
  moduleName?: string;
  moduleCode?: string;
  teacherName?: string;
  status?: string;
  isActive?: boolean;
};

// ============================================================
// PAGE
// ============================================================

export default function DepartmentAssignmentsPage() {
  const { user } = useAuthStore();

  const [modules, setModules] = useState<Module[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [selectedModule, setSelectedModule] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal & Form States for Creating Teacher
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingTeacher, setCreatingTeacher] = useState(false);
  const [newTeacherData, setNewTeacherData] = useState({
    fullName: "",
    username: "",
    password: "",
    level: "Level 1"
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
// Sarara 82-88: 'modulesData' jedhii jijjiiri

const { data: modulesData } = useQuery({
  queryKey: ["department-modules"],
  queryFn: async () => {
    const res = await api.get("/modules");
    return res.data as Module[];
  },
});

// Sarara 90-96:
const { data: teachersData } = useQuery({
  queryKey: ["department-teachers"],
  queryFn: async () => {
    const res = await api.get("/teachers");
    return res.data as Teacher[];
  },
});

  // Safe Extraction for Department Head / Admin users
  const departmentId =
    (user as any)?.departmentId ||
    (user as any)?.department_id ||
    (user as any)?.departmentHead?.departmentId ||
    (user as any)?.departmentHead?.department_id ||
    (user as any)?.departmentHead ||
    (user as any)?.deptId ||
    (user as any)?.department?._id ||
    (user as any)?.department ||
    (typeof window !== "undefined" ? localStorage.getItem("departmentId") || "" : "");

  console.log("CURRENT USER OBJECT:", user);
  console.log("EXTRACTED DEPT ID:", departmentId);

  // ==========================================================
  // LOAD MODULES
  // ==========================================================
  const loadModules = useCallback(async () => {
    if (!departmentId) return;
    try {
      const res = await api.get("/modules", {
        params: { deptId: departmentId, departmentId },
      });
      const data = res.data?.data || res.data;
      setModules(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Modules loading failed:", err);
      setModules([]);
    }
  }, [departmentId]);

  // ==========================================================
  // LOAD TEACHERS
  // ==========================================================
  const loadTeachers = useCallback(async () => {
    if (!departmentId) return;
    try {
      const res = await api.get("/teachers", {
        params: { departmentId, deptId: departmentId },
      });
      const data = res.data?.data || res.data;
      setTeachers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Teachers loading failed:", err);
      setTeachers([]);
    }
  }, [departmentId]);

  // ==========================================================
  // LOAD ASSIGNMENTS (WITH DEPARTMENT ID)
  // ==========================================================
  const loadAssignments = useCallback(async () => {
    if (!departmentId) return;
    try {
      const res = await api.get("/module-assignments", {
        params: { departmentId, deptId: departmentId },
      });
      const data = res.data?.data || res.data;
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Assignment loading failed:", err);
      setAssignments([]);
    }
  }, [departmentId]);

  // ==========================================================
  // INITIAL DATA FETCH
  // ==========================================================
  useEffect(() => {
    const loadAll = async () => {
      if (!departmentId) {
        setLoading(false);
        setError("Department ID hin argamne. Mee irra deebi'ii log in godhi.");
        return;
      }

      setLoading(true);
      setError("");

      await Promise.all([loadModules(), loadTeachers(), loadAssignments()]);
      setLoading(false);
    };

    loadAll();
  }, [departmentId, loadModules, loadTeachers, loadAssignments]);
useEffect(() => {
  const syncUserData = async () => {
    try {
      const res = await api.get("/auth/me");
      const backendDeptId = res.data?.departmentId;
      if (backendDeptId) {
        localStorage.setItem("departmentId", backendDeptId);
      }
    } catch (err) {
      console.error("Auth sync error:", err);
    }
  };

  syncUserData();
}, []);
useEffect(() => {
  if (modulesData) setModules(modulesData);
  if (teachersData) setTeachers(teachersData);
}, [modulesData, teachersData]);
  // ==========================================================
  // CREATE TEACHER
  // ==========================================================
 const handleCreateTeacher = async (e: React.FormEvent) => {
  e.preventDefault();
  setMessage("");
  setError("");

  if (!newTeacherData.fullName || !newTeacherData.username || !newTeacherData.password) {
    setError("Mee odeeffannoo guutuu guuti.");
    return;
  }

  try {
    setCreatingTeacher(true);
    
    // Payload qopheessuu (departmentId yoo jiraate qofa erga, dhabamnaan backend login user irraa fudhata)
    const payload: any = {
      fullName: newTeacherData.fullName,
      username: newTeacherData.username,
      password: newTeacherData.password,
      level: newTeacherData.level,
    };

    if (departmentId) {
      payload.departmentId = departmentId;
    }

    await api.post("/teachers/", payload);

    setMessage("Teacher haaraan milkaa'inaan uumameera!");
    setShowCreateModal(false);
    setNewTeacherData({ fullName: "", username: "", password: "", level: "Level 1" });
    await loadTeachers();
  } catch (err: any) {
    console.error("Teacher creation failed:", err);
    setError(err?.response?.data?.detail || "Teacher uumuun hin milkoofne.");
  } finally {
    setCreatingTeacher(false);
  }
};

    
  // ==========================================================
  // ASSIGN TEACHER
  // ==========================================================
 
        const assignTeacher = async () => {
    setMessage("");
    setError("");

    if (!selectedModule) {
      setError("Mee Module filadhu.");
      return;
    }

    if (!selectedTeacher) {
      setError("Mee Teacher filadhu.");
      return;
    }

    const exists = assignments.some(
      (assignment) =>
        assignment.moduleId === selectedModule &&
        assignment.teacherId === selectedTeacher &&
        (assignment.isActive === undefined || assignment.isActive === true)
    );

    if (exists) {
      setError("Teacher kun duraan module kana irratti ramadameera.");
      return;
    }

    try {
      setAssigning(true);

      // Endpoint Endpoint backend wajjin wal-simsiifame (/module-assignments/)
      await api.post("/module-assignments", {
        moduleId: selectedModule,
        teacherId: selectedTeacher
      });

      setMessage("Teacher module irratti milkaa'inaan ramadameera.");
      setSelectedModule("");
      setSelectedTeacher("");

      await loadAssignments();
    } catch (err: any) {
      console.error("Teacher assignment failed:", err);
      setError(
        err?.response?.data?.detail || "Teacher assignment hin milkoofne."
      );
    } finally {   
      setAssigning(false);
    }
  };

  // ==========================================================
  // UNASSIGN / DELETE ASSIGNMENT
  // ==========================================================
  const handleUnassign = async (assignmentId: string) => {
    const confirmed = window.confirm(
      "Teacher kana module irraa kaasuu akka barbaaddu mirkaneeffattaa?"
    );
    if (!confirmed) return;

    try {
      setMessage("");
      setError("");
      setDeletingId(assignmentId);

      await api.delete(`/module-assignments/${assignmentId}`);

      setMessage("Assignment haqameera.");
      await loadAssignments();
    } catch (err: any) {
      console.error("Delete assignment error:", err);
      setError(
        err?.response?.data?.detail || "Assignment haquu hin dandeenye."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center gap-3 text-gray-600 min-h-[400px]">
        <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
        <span className="font-medium">Loading department assignments...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER & CREATE BUTTON */}
        <div className="bg-white rounded-xl border shadow-sm p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserPlus className="h-7 w-7 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Module Assignment & Teachers
              </h1>
              <p className="text-sm text-gray-500">
                Teacher haaraa uumi ykn teacher module irratti ramadi.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white font-medium rounded-lg px-4 py-2 hover:bg-green-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Teacher
          </button>
        </div>

        {/* NOTIFICATIONS */}
        {message && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ASSIGN FORM SECTION */}
        <section className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-800">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Assign Teacher
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {/* MODULE SELECT */}
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setMessage("");
                setError("");
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={assigning}
            >
              <option value="">Select Module</option>
              {modules.map((module) => (
                <option key={module._id} value={module._id}>
                  {module.code} - {module.name}
                </option>
              ))}
            </select>

            {/* TEACHER SELECT */}
            <select
              value={selectedTeacher}
              onChange={(e) => {
                setSelectedTeacher(e.target.value);
                setMessage("");
                setError("");
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={assigning}
            >
              <option value="">Select Teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.fullName} {teacher.username ? `(${teacher.username})` : ""} {teacher.level ? `- ${teacher.level}` : ""}
                </option>
              ))}
            </select>

            {/* ACTION BUTTON */}
            <button
              onClick={assignTeacher}
              disabled={assigning || !selectedModule || !selectedTeacher}
              className="bg-blue-600 text-white font-medium rounded-lg px-5 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {assigning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Assign
                </>
              )}
            </button>
          </div>

          {modules.length === 0 && (
            <p className="mt-4 text-sm text-amber-600">
              Department kana keessatti module hin argamne.
            </p>
          )}

          {teachers.length === 0 && (
            <p className="mt-2 text-sm text-amber-600">
              Department kana keessatti Teacher hin argamne. Teacher haaraa uumuuf button "Create Teacher" fayyadami.
            </p>
          )}
        </section>

        {/* ASSIGNMENT LIST TABLE */}
        <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
              <Users className="h-5 w-5 text-green-600" />
              Current Assignments
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Teacher module irratti ramadaman department kanaa.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
                <tr>
                  <th className="p-4">Module</th>
                  <th className="p-4">Teacher</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      No teacher assignment found.
                    </td>
                  </tr>
                ) : (
                  assignments.map((assignment) => {
                    const matchedModule = modules.find((m) => m._id === assignment.moduleId);
                    const matchedTeacher = teachers.find((t) => t._id === assignment.teacherId);

                    const moduleName = assignment.moduleName || matchedModule?.name || assignment.moduleId;
                    const moduleCode = assignment.moduleCode || matchedModule?.code || "";
                    const teacherName = assignment.teacherName || matchedTeacher?.fullName || assignment.teacherId;

                    return (
                      <tr key={assignment._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            {moduleName}
                          </div>
                          {moduleCode && (
                            <div className="text-xs font-mono text-gray-500 mt-0.5">
                              {moduleCode}
                            </div>
                          )}
                        </td>

                        <td className="p-4 font-medium text-gray-800">
                          {teacherName}
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                            {assignment.status || "Active"}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleUnassign(assignment._id)}
                            disabled={deletingId === assignment._id}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                            title="Unassign Teacher"
                          >
                            {deletingId === assignment._id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* CREATE TEACHER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Create New Teacher</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abebe Bikila"
                  value={newTeacherData.fullName}
                  onChange={(e) => setNewTeacherData({ ...newTeacherData, fullName: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. abebe123"
                  value={newTeacherData.username}
                  onChange={(e) => setNewTeacherData({ ...newTeacherData, username: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="******"
                  value={newTeacherData.password}
                  onChange={(e) => setNewTeacherData({ ...newTeacherData, password: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  value={newTeacherData.level}
                  onChange={(e) => setNewTeacherData({ ...newTeacherData, level: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Level 1">Level 1</option>
                  <option value="Level 2">Level 2</option>
                  <option value="Level 3">Level 3</option>
                  <option value="Level 4">Level 4</option>
                  <option value="Level 5">Level 5</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTeacher}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {creatingTeacher ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}