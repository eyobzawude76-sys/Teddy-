"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores";
import { api } from "@/lib";

import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  KeyRound,
  Users,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

type Department = {
  _id: string;
  name: string;
  description?: string;
};

type Course = {
  _id: string;
  name?: string;
  title?: string;
  code?: string;
  departmentId?: string;
};

type Level = {
  _id: string;
  departmentId: string;
  courseId?: string;
  levelNumber: number;
  description?: string;
};

type Module = {
  _id: string;
  departmentId?: string;
  levelId?: string;
  name: string;
  code: string;
  creditHour?: number;
  pin?: string;
  modulePin?: string;
  pinGeneratedAt?: string;
};

// ============================================================
// PAGE
// ============================================================

export default function DepartmentDashboardPage() {
  const { user } = useAuthStore();

  const [activeDepartmentId, setActiveDepartmentId] = useState<string>(
    (user as any)?.departmentId ||
    (user as any)?.department_id ||
    (user as any)?.department ||
    ""
  );

  // ============================================================
  // STATE
  // ============================================================

  const [department, setDepartment] = useState<Department | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [modules, setModules] = useState<Module[]>([]);

  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [moduleLoading, setModuleLoading] = useState(false);

  const [showLevelForm, setShowLevelForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);

  const [editingLevel, setEditingLevel] = useState<Level | null>(null);

  const [levelNumber, setLevelNumber] = useState("");
  const [levelDescription, setLevelDescription] = useState("");
  const [levelCourseId, setLevelCourseId] = useState("");

  const [moduleName, setModuleName] = useState("");
  const [moduleCode, setModuleCode] = useState("");
  const [creditHour, setCreditHour] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // CLEAR MESSAGE
  // ============================================================

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  // ============================================================
  // LOAD DEPARTMENT
  // ============================================================

  const loadDepartment = async (deptId: string) => {
    if (!deptId) return;

    try {
      const res = await api.get(`/departments/${deptId}`);
      const data = res.data?.data || res.data;
      setDepartment(data);
    } catch (err) {
      console.error("Department loading failed:", err);
    }
  };

  // ============================================================
  // LOAD COURSES
  // ============================================================

  const loadCourses = async () => {
    try {
      let parsedCourses: Course[] = [];
      
      try {
        const res = await api.get(`/departments/my-courses/me`);
        const data = res.data?.data || res.data;
        parsedCourses = Array.isArray(data) ? data : [];
      } catch (e) {
        if (activeDepartmentId) {
          const res = await api.get(`/departments/${activeDepartmentId}/courses`);
          const data = res.data?.data || res.data;
          parsedCourses = Array.isArray(data) ? data : [];
        }
      }

      setCourses(parsedCourses);

      if (parsedCourses.length > 0) {
        setSelectedCourse(parsedCourses[0]._id);
        
        const extractedDeptId = parsedCourses[0].departmentId;
        if (extractedDeptId && !activeDepartmentId) {
          setActiveDepartmentId(extractedDeptId);
          loadDepartment(extractedDeptId);
        }
      }
    } catch (err) {
      console.error("Courses loading failed:", err);
      setCourses([]);
    }
  };

  // ============================================================
  // LOAD LEVELS
  // ============================================================

  const loadLevels = async (deptId: string) => {
    if (!deptId) return;

    try {
      const res = await api.get(`/levels`, {
        params: { deptId, departmentId: deptId },
      });

      const data = res.data?.data || res.data;
      const parsedLevels = Array.isArray(data) ? data : [];

      parsedLevels.sort(
        (a: Level, b: Level) => a.levelNumber - b.levelNumber
      );

      setLevels(parsedLevels);

      const courseLevels = selectedCourse
        ? parsedLevels.filter(
            (level: Level) => level.courseId === selectedCourse
          )
        : parsedLevels;

      if (courseLevels.length > 0) {
        const currentStillExists = courseLevels.some(
          (level: Level) => level._id === selectedLevel
        );

        if (!selectedLevel || !currentStillExists) {
          setSelectedLevel(courseLevels[0]._id);
        }
      } else {
        setSelectedLevel("");
      }
    } catch (err) {
      console.error("Levels loading failed:", err);
      setLevels([]);
      setSelectedLevel("");
    }
  };

  // ============================================================
  // LOAD MODULES
  // ============================================================

  const loadModules = async (levelId: string) => {
    if (!levelId) {
      setModules([]);
      return;
    }

    setModuleLoading(true);

    try {
      const res = await api.get(`/modules`, {
        params: { levelId, deptId: activeDepartmentId, departmentId: activeDepartmentId },
      });

      const data = res.data?.data || res.data;
      setModules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Modules loading failed:", err);
      setModules([]);
    } finally {
      setModuleLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      clearMessages();

      await loadCourses();
      if (activeDepartmentId) {
        await Promise.all([loadDepartment(activeDepartmentId), loadLevels(activeDepartmentId)]);
      }

      setLoading(false);
    };

    load();
  }, [activeDepartmentId]);

  useEffect(() => {
    if (activeDepartmentId) {
      loadLevels(activeDepartmentId);
    }
  }, [activeDepartmentId]);

  // ============================================================
  // COURSE CHANGE
  // ============================================================

  useEffect(() => {
    const courseLevels = selectedCourse
      ? levels.filter((level) => level.courseId === selectedCourse)
      : levels;

    if (courseLevels.length === 0) {
      setSelectedLevel("");
      setModules([]);
      return;
    }

    const selectedLevelStillValid = courseLevels.some(
      (level) => level._id === selectedLevel
    );

    if (!selectedLevelStillValid) {
      setSelectedLevel(courseLevels[0]._id);
    }
  }, [selectedCourse, levels]);

  // ============================================================
  // LEVEL CHANGE
  // ============================================================

  useEffect(() => {
    if (selectedLevel) {
      loadModules(selectedLevel);
    } else {
      setModules([]);
    }
  }, [selectedLevel]);

  // ============================================================
  // CREATE LEVEL
  // ============================================================

  const createLevel = async () => {
    if (!activeDepartmentId) {
      setError("Department ID hin argamne.");
      return;
    }

    if (!levelCourseId) {
      setError("Dura Course filadhu.");
      return;
    }

    if (!levelNumber) {
      setError("Level number galchi.");
      return;
    }

    const number = Number(levelNumber);

    if (number < 1 || number > 5) {
      setError("Level 1 hanga Level 5 qofa hayyamama.");
      return;
    }

    try {
      clearMessages();

      await api.post("/levels", {
        departmentId: activeDepartmentId,
        courseId: levelCourseId,
        levelNumber: number,
        description: levelDescription || null,
      });

      setMessage("Level uumameera.");

      setLevelNumber("");
      setLevelDescription("");
      setLevelCourseId("");
      setShowLevelForm(false);

      await loadLevels(activeDepartmentId);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Level uumuu hin dandeenye."
      );
    }
  };

  // ============================================================
  // UPDATE LEVEL
  // ============================================================

  const updateLevel = async () => {
    if (!editingLevel) return;

    if (!levelCourseId) {
      setError("Course filadhu.");
      return;
    }

    const number = Number(levelNumber);

    if (number < 1 || number > 5) {
      setError("Level 1 hanga Level 5 qofa hayyamama.");
      return;
    }

    try {
      clearMessages();

      await api.put(`/levels/${editingLevel._id}`, {
        departmentId: activeDepartmentId,
        courseId: levelCourseId,
        levelNumber: number,
        description: levelDescription || null,
      });

      setMessage("Level sirreeffameera.");

      setEditingLevel(null);
      setLevelNumber("");
      setLevelDescription("");
      setLevelCourseId("");
      setShowLevelForm(false);

      await loadLevels(activeDepartmentId);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Level sirreessuu hin dandeenye."
      );
    }
  };

  // ============================================================
  // DELETE LEVEL
  // ============================================================

  const deleteLevel = async (levelId: string) => {
    const confirmed = window.confirm(
      "Level kana haquu akka barbaaddu mirkaneeffattaa?"
    );

    if (!confirmed) return;

    try {
      clearMessages();

      await api.delete(`/levels/${levelId}`);

      setMessage("Level haqameera.");

      if (selectedLevel === levelId) {
        setSelectedLevel("");
        setModules([]);
      }

      await loadLevels(activeDepartmentId);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Level haquu hin dandeenye."
      );
    }
  };

  // ============================================================
  // OPEN EDIT LEVEL
  // ============================================================

  const openEditLevel = (level: Level) => {
    setEditingLevel(level);
    setLevelNumber(String(level.levelNumber));
    setLevelDescription(level.description || "");
    setLevelCourseId(level.courseId || "");
    setShowLevelForm(true);
    clearMessages();
  };

  // ============================================================
  // CREATE MODULE
  // ============================================================

  const createModule = async () => {
    if (!activeDepartmentId) {
      setError("Department ID hin argamne.");
      return;
    }

    if (!selectedLevel) {
      setError("Dura Level filadhu.");
      return;
    }

    if (!moduleName.trim()) {
      setError("Module maqaa guuti.");
      return;
    }

    if (!moduleCode.trim()) {
      setError("Module code guuti.");
      return;
    }

    try {
      clearMessages();

      await api.post("/modules", {
        departmentId: String(activeDepartmentId),
        levelId: String(selectedLevel),
        name: moduleName.trim(),
        code: moduleCode.trim(),
        creditHour: creditHour ? Number(creditHour) : 3,
      });

      setMessage("Module uumamameera.");

      setModuleName("");
      setModuleCode("");
      setCreditHour("");
      setShowModuleForm(false);

      await loadModules(selectedLevel);
    } catch (err: any) {
      const errorDetail = err?.response?.data?.detail;

      if (Array.isArray(errorDetail)) {
        const msg = errorDetail
          .map((e: any) => `${e.loc[e.loc.length - 1]}: ${e.msg}`)
          .join(", ");
        setError(msg);
      } else if (typeof errorDetail === "string") {
        setError(errorDetail);
      } else {
        setError("Module uumuu hin dandeenye.");
      }
    }
  };

  // ============================================================
  // GENERATE MODULE PIN (ONE TIME ONLY)
  // ============================================================

  const handleGeneratePin = async (moduleId: string) => {
    try {
      clearMessages();
      const res = await api.post(`/modules/generate-pin/${moduleId}`);
      const newPin = res.data?.pin;
      
      setMessage(`PIN-ni haaraa uumameera: ${newPin}`);

      if (selectedLevel) {
        await loadModules(selectedLevel); 
      }
    } catch (err: any) {
      console.error("PIN generation error:", err);
      setError(err?.response?.data?.detail || "PIN uumuu hin dandeenye.");
    }
  };

  // ============================================================
  // DELETE MODULE
  // ============================================================

  const deleteModule = async (moduleId: string) => {
    const confirmed = window.confirm(
      "Module kana haquu akka barbaaddu mirkaneeffattaa?"
    );

    if (!confirmed) return;

    try {
      clearMessages();

      await api.delete(`/modules/${moduleId}`);

      setMessage("Module haqameera.");

      await loadModules(selectedLevel);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Module haquu hin dandeenye."
      );
    }
  };

  const courseLevels = selectedCourse
    ? levels.filter((level) => level.courseId === selectedCourse)
    : levels;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-600 font-medium">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          Loading Department Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Department Management
              </p>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">
                {department?.name || "My Department"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage Courses, Levels, Modules, PINs and Department curriculum.
              </p>
            </div>

            
          </div>
        </div>

        {/* MESSAGES */}
        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 shadow-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {/* COURSE SECTION */}
        <section className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Courses</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Department kee keessatti Course filadhu.
                </p>
              </div>

              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 min-w-[200px]"
              >
                <option value="">-- Select Course --</option>
                {courses.map((course) => {
                  const courseTitle = course.title || course.name || "Unnamed Course";
                  return (
                    <option key={course._id} value={course._id}>
                      {course.code ? `${course.code} - ${courseTitle}` : courseTitle}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {courses.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Course hin jiru.
              <div className="text-xs mt-2 text-gray-400">
                Dura Admin irraa Course uumuu qabda.
              </div>
            </div>
          )}
        </section>

        {/* LEVEL SECTION */}
        <section className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Levels</h2>
              <p className="text-sm text-gray-500 mt-1">
                Course filatame keessatti Level 1 hanga Level 5 qopheessi.
              </p>
            </div>

            <button
              disabled={!selectedCourse}
              onClick={() => {
                clearMessages();
                setEditingLevel(null);
                setLevelNumber("");
                setLevelDescription("");
                setLevelCourseId(selectedCourse);
                setShowLevelForm(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Level
            </button>
          </div>

          {/* LEVEL FORM */}
          {showLevelForm && (
            <div className="p-6 bg-gray-50 border-b">
              <div className="max-w-xl space-y-4">
                <h3 className="font-semibold text-gray-900">
                  {editingLevel ? "Edit Level" : "Create New Level"}
                </h3>

                <select
                  value={levelCourseId}
                  onChange={(e) => setLevelCourseId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Course --</option>
                  {courses.map((course) => {
                    const courseTitle = course.title || course.name || "Unnamed Course";
                    return (
                      <option key={course._id} value={course._id}>
                        {course.code ? `${course.code} - ${courseTitle}` : courseTitle}
                      </option>
                    );
                  })}
                </select>

                <input
                  type="number"
                  min="1"
                  max="5"
                  value={levelNumber}
                  onChange={(e) => setLevelNumber(e.target.value)}
                  placeholder="Level Number (1-5)"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                />

                <textarea
                  value={levelDescription}
                  onChange={(e) => setLevelDescription(e.target.value)}
                  placeholder="Level description"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />

                <div className="flex gap-2">
                  <button
                    onClick={editingLevel ? updateLevel : createLevel}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {editingLevel ? "Update Level" : "Create Level"}
                  </button>

                  <button
                    onClick={() => {
                      setShowLevelForm(false);
                      setEditingLevel(null);
                      setLevelCourseId("");
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LEVEL TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
                <tr>
                  <th className="p-4">Course</th>
                  <th className="p-4">Level</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {courseLevels.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      {selectedCourse
                        ? "Course kana keessatti Level hin uumamne."
                        : "Dura Course filadhu."}
                    </td>
                  </tr>
                ) : (
                  courseLevels.map((level) => {
                    const course = courses.find(
                      (c) => c._id === level.courseId
                    );
                    const courseTitle = course?.title || course?.name || "—";

                    return (
                      <tr
                        key={level._id}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedLevel === level._id ? "bg-blue-50/70" : ""
                        }`}
                        onClick={() => setSelectedLevel(level._id)}
                      >
                        <td className="p-4 text-gray-900">
                          {course?.code ? `${course.code} - ${courseTitle}` : courseTitle}
                        </td>

                        <td className="p-4 font-semibold text-gray-900">
                          Level {level.levelNumber}
                        </td>

                        <td className="p-4 text-gray-500">
                          {level.description || "—"}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditLevel(level);
                              }}
                              className="p-2 rounded-lg hover:bg-gray-200 text-gray-600"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteLevel(level._id);
                              }}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* MODULE SECTION */}
        <section className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Modules</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Level filatame keessatti modules Department kee jala jiran ilaali.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 min-w-[160px]"
                >
                  <option value="">-- Select Level --</option>
                  {courseLevels.map((level) => (
                    <option key={level._id} value={level._id}>
                      Level {level.levelNumber}
                    </option>
                  ))}
                </select>

                <button
                  disabled={!selectedLevel}
                  onClick={() => {
                    clearMessages();
                    setModuleName("");
                    setModuleCode("");
                    setCreditHour("");
                    setShowModuleForm(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Module
                </button>
              </div>
            </div>
          </div>

          {/* MODULE FORM */}
          {showModuleForm && (
            <div className="p-6 bg-gray-50 border-b">
              <div className="max-w-xl space-y-4">
                <h3 className="font-semibold text-gray-900">Create Module</h3>

                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
                  Course:{" "}
                  <strong>
                    {(() => {
                      const c = courses.find((course) => course._id === selectedCourse);
                      return c?.title || c?.name || "Selected Course";
                    })()}
                  </strong>
                  {" — "}
                  Level{" "}
                  {courseLevels.find((level) => level._id === selectedLevel)
                    ?.levelNumber || ""}
                </div>

                <input
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="Module Name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                />

                <input
                  value={moduleCode}
                  onChange={(e) => setModuleCode(e.target.value)}
                  placeholder="Module Code e.g. CS101"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="number"
                  min="1"
                  max="10"
                  value={creditHour}
                  onChange={(e) => setCreditHour(e.target.value)}
                  placeholder="Credit Hour"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex gap-2">
                  <button
                    onClick={createModule}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Create Module
                  </button>

                  <button
                    onClick={() => setShowModuleForm(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODULE TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
                <tr>
                  <th className="p-4">Module Code</th>
                  <th className="p-4">Module Name</th>
                  <th className="p-4">Credit</th>
                  <th className="p-4">PIN</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {moduleLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto text-blue-600" />
                    </td>
                  </tr>
                ) : modules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      {selectedLevel
                        ? "Module hin jiru."
                        : "Dura Level filadhu."}
                    </td>
                  </tr>
                ) : (
                  modules.map((module) => {
                    const currentPin = module.modulePin || module.pin;
                    return (
                      <tr key={module._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4 font-mono font-semibold text-gray-900">
                          {module.code}
                        </td>

                        <td className="p-4 font-medium text-gray-900">
                          {module.name}
                        </td>

                        <td className="p-4 text-gray-700">
                          {module.creditHour || "—"}
                        </td>

                        {/* PIN DISPLAY (TAKAA UUMAMNAAN LAMMATA REGENERATE HIN GOOFAMU) */}
                        <td className="p-4">
                          {currentPin ? (
                            <div className="inline-flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5">
                              <KeyRound className="h-4 w-4 text-green-600" />
                              <span className="font-mono font-bold tracking-wider text-green-700">
                                {currentPin}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleGeneratePin(module._id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                              Generate PIN
                            </button>
                          )}
                        </td>

                        {/* ACTIONS */}
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => deleteModule(module._id)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Module"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* DEPARTMENT RESPONSIBILITIES */}
        <section className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <BookOpen className="h-6 w-6 text-blue-600 mb-3" />
            <h3 className="font-bold text-gray-900">Courses, Levels & Modules</h3>
            <p className="text-sm text-gray-500 mt-1">
              Course filadhu → Level 1–5 qopheessi → Modulewwan Level sana keessatti uumi.
            </p>
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <KeyRound className="h-6 w-6 text-green-600 mb-3" />
            <h3 className="font-bold text-gray-900">Module PIN</h3>
            <p className="text-sm text-gray-500 mt-1">
              Module hundumaaf PIN takka qofa uumi. PIN uumame kana Teacher qofaaf kenni.
            </p>
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <Users className="h-6 w-6 text-purple-600 mb-3" />
            <h3 className="font-bold text-gray-900">Teacher & Review</h3>
            <p className="text-sm text-gray-500 mt-1">
              Teacher module irratti ramadi; inni PIN fayyadamuun module bana; qabxii erga galchee booda Department Head review godha.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
