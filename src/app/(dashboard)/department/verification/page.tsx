"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib";
import { useAuthStore } from "@/stores";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  ClipboardCheck,
  Zap,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

type Level = {
  _id: string;
  departmentId?: string | null;
  department_id?: string | null;
  courseId?: string | null;
  course_id?: string | null;
  levelNumber?: number;
  level_number?: number;
  name?: string;
  description?: string | null;
};

type Module = {
  _id: string;
  departmentId?: string;
  department_id?: string;
  levelId?: string;
  level_id?: string;
  name: string;
  code: string;
  creditHour: number;
  departmentPin?: string | null;
  pin?: string | null;
  modulePin?: string | null;
  pinGeneratedAt?: string | null;
};

type SubmittedMark = {
  _id?: string;
  reviewId?: string;
  markId?: string;

  studentId: string;
  studentCode: string;

  studentName?: string;
  student_name?: string;
  fullName?: string;

  moduleId: string;
  moduleCode: string;
  moduleName: string;

  institutionalScore: number;
  industrialScore: number;
  totalScore: number;

  letterGrade?: string | null;
  gradePoint?: number | null;

  status?: string;

  updatedAt?: string | null;
  submittedAt?: string | null;
};

type ReviewResponse = {
  success?: boolean;
  count?: number;
  records?: SubmittedMark[];
};

// ============================================================
// HELPERS
// ============================================================

/**
 * MongoDB ObjectId fi string wal bira qabuuf.
 *
 * Fakkeenya:
 * 650000000000000000000001
 * fi
 * ObjectId("650000000000000000000001")
 *
 * lamaan isaanii string tokkootti jijjiiramu.
 */
const normalizeId = (value: unknown): string => {
  if (value === null || value === undefined) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "object") {
    const obj = value as any;

    if (obj.$oid) {
      return String(obj.$oid).trim();
    }

    if (obj.toString) {
      return String(obj.toString()).trim();
    }
  }

  return String(value).trim();
};

/**
 * Department ID user irraa baasuu.
 */
const getDepartmentIdFromUser = (user: any): string => {
  return normalizeId(
    user?.departmentId ||
      user?.department_id ||
      user?.department
  );
};

/**
 * Level department sana keessa jiraachuu mirkaneessa.
 */
const isLevelBelongsToDepartment = (
  level: Level,
  departmentId: string
): boolean => {
  const levelDepartmentId = normalizeId(
    level.departmentId || level.department_id
  );

  if (!departmentId || !levelDepartmentId) {
    return false;
  }

  return levelDepartmentId === departmentId;
};

/**
 * Module level filatame keessa jiraachuu mirkaneessa.
 */
const isModuleBelongsToLevel = (
  module: Module,
  levelId: string
): boolean => {
  const moduleLevelId = normalizeId(
    module.levelId || module.level_id
  );

  return moduleLevelId === normalizeId(levelId);
};

// ============================================================
// UI BUTTON
// ============================================================

const Button = ({
  children,
  className = "",
  variant = "default",
  onClick,
  disabled = false,
  type = "button",
  ...props
}: any) => {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 shadow-sm";

  const variants: any = {
    default:
      "bg-blue-600 text-white hover:bg-blue-700",

    outline:
      "border border-gray-300 bg-white hover:bg-gray-100 text-gray-700",

    danger:
      "bg-red-600 text-white hover:bg-red-700",

    success:
      "bg-green-600 text-white hover:bg-green-700",

    purple:
      "bg-indigo-600 text-white hover:bg-indigo-700",
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// ============================================================
// DIALOG
// ============================================================

const Dialog = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

// ============================================================
// MAIN PAGE
// ============================================================

export default function DepartmentVerificationPage() {
  const { user } = useAuthStore();

  // ==========================================================
  // DEPARTMENT HEAD DEPARTMENT ID
  // ==========================================================

  const deptId = getDepartmentIdFromUser(user);

  // ==========================================================
  // STATES
  // ==========================================================

  const [currLevel, setCurrLevel] = useState("");

  const [showRejectModal, setShowRejectModal] =
    useState(false);

  const [rejectReason, setRejectReason] =
    useState("");

  const [targetReviewId, setTargetReviewId] =
    useState<string | null>(null);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [isLevelApproving, setIsLevelApproving] =
    useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD LEVELS
  // ==========================================================

  const {
    data: allLevels = [],
    isLoading: levelsLoading,
    isError: levelsError,
    refetch: refetchLevels,
  } = useQuery<Level[]>({
    queryKey: ["department-levels", deptId],

    queryFn: async () => {
      if (!deptId) {
        return [];
      }

      const res = await api.get("/levels", {
        params: {
          deptId: deptId,
          departmentId: deptId,
        },
      });

      const data =
        res.data?.data ??
        res.data;

      if (!Array.isArray(data)) {
        return [];
      }

      return data;
    },

    enabled: !!deptId,
  });

  // ==========================================================
  // IMPORTANT:
  // DEPARTMENT HEAD'S DEPARTMENT LEVELS ONLY
  // ==========================================================

  const levels = useMemo(() => {
    if (!deptId) {
      return [];
    }

    const filtered = allLevels.filter((level) =>
      isLevelBelongsToDepartment(
        level,
        deptId
      )
    );

    // ========================================================
    // DUPLICATE LEVEL REMOVE
    // ========================================================

    const unique = new Map<string, Level>();

    filtered.forEach((level) => {
      const levelId = normalizeId(level._id);

      if (levelId && !unique.has(levelId)) {
        unique.set(levelId, level);
      }
    });

    return Array.from(unique.values()).sort(
      (a, b) =>
        Number(
          a.levelNumber ??
            a.level_number ??
            999
        ) -
        Number(
          b.levelNumber ??
            b.level_number ??
            999
        )
    );
  }, [allLevels, deptId]);

  // ==========================================================
  // DEFAULT LEVEL
  // ==========================================================

  useEffect(() => {
    if (levels.length === 0) {
      setCurrLevel("");
      return;
    }

    const currentStillExists = levels.some(
      (level) =>
        normalizeId(level._id) ===
        normalizeId(currLevel)
    );

    if (!currentStillExists) {
      setCurrLevel(
        normalizeId(levels[0]._id)
      );
    }
  }, [levels, currLevel]);

  // ==========================================================
  // LOAD MODULES
  // ==========================================================

  const {
    data: allModules = [],
    isLoading: modulesLoading,
    refetch: refetchModules,
  } = useQuery<Module[]>({
    queryKey: [
      "department-modules",
      deptId,
      currLevel,
    ],

    queryFn: async () => {
      if (!deptId || !currLevel) {
        return [];
      }

      const res = await api.get("/modules", {
        params: {
          levelId: currLevel,
          deptId: deptId,
          departmentId: deptId,
        },
      });

      const data =
        res.data?.data ??
        res.data;

      if (!Array.isArray(data)) {
        return [];
      }

      return data;
    },

    enabled:
      !!deptId &&
      !!currLevel,
  });

  // ==========================================================
  // ONLY SELECTED LEVEL MODULES
  // ==========================================================

  const modules = useMemo(() => {
    if (!currLevel) {
      return [];
    }

    return allModules.filter((module) =>
      isModuleBelongsToLevel(
        module,
        currLevel
      )
    );
  }, [allModules, currLevel]);

  // ==========================================================
  // LOAD DEPARTMENT REVIEW QUEUE
  // SELECTED LEVEL ONLY
  // ==========================================================

  const {
    data: submittedMarks = [],
    isLoading: submittedLoading,
    isError: submittedError,
    refetch: refetchSubmitted,
  } = useQuery<SubmittedMark[]>({
    queryKey: [
      "department-review-pending",
      deptId,
      currLevel,
    ],

    queryFn: async () => {
      if (!deptId || !currLevel) {
        return [];
      }

      const res = await api.get(
        "/department-review/pending",
        {
          params: {
            level_id: currLevel,
            departmentId: deptId,
          },
        }
      );

      const response: ReviewResponse =
        res.data;

      const records =
        Array.isArray(
          response?.records
        )
          ? response.records
          : Array.isArray(res.data)
          ? res.data
          : [];

      return records;
    },

    enabled:
      !!deptId &&
      !!currLevel,
  });

  // ==========================================================
  // REFRESH ALL
  // ==========================================================

  const refreshAll = async () => {
    setMessage("");
    setError("");

    await Promise.all([
      refetchLevels(),
      refetchModules(),
      refetchSubmitted(),
    ]);
  };

  // ==========================================================
  // APPROVE SINGLE MARK
  // ==========================================================

  const handleApprove = async (
    mark: SubmittedMark
  ) => {
    const targetId =
      mark.reviewId ||
      mark.markId ||
      mark._id;

    if (!targetId) {
      setError(
        "Review/Mark ID hin argamne."
      );
      return;
    }

    try {
      setMessage("");
      setError("");

      setActionLoading(targetId);

      await api.post(
        `/department-review/${targetId}/approve`,
        {
          comment:
            "Approved by Department Head",
        }
      );

      setMessage(
        `${
          mark.studentName ||
          mark.student_name ||
          mark.studentCode ||
          "Student"
        } - ${
          mark.moduleName ||
          "Module"
        } approved successfully.`
      );

      await refetchSubmitted();
    } catch (err: any) {
      console.error(
        "Approval failed:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Mark approval failed."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================================
  // APPROVE ENTIRE LEVEL
  // ==========================================================

  const handleApproveEntireLevel =
    async () => {
      if (!currLevel) {
        setError(
          "Meeqoo Level filadhu."
        );
        return;
      }

      try {
        setMessage("");
        setError("");

        setIsLevelApproving(true);

        const res =
          await api.post(
            "/department-review/approve-level",
            {
              levelId: currLevel,
              comment:
                "Level fully approved by Department Head and Grade Engine executed.",
            }
          );

        setMessage(
          res.data?.message ||
            "Level guutuun approve ta'eera, Grade Engine automatic-iin hojjeteera!"
        );

        await refreshAll();
      } catch (err: any) {
        console.error(
          "Level Approval failed:",
          err
        );

        setError(
          err?.response?.data?.detail ||
            "Level approval failed."
        );
      } finally {
        setIsLevelApproving(false);
      }
    };

  // ==========================================================
  // REJECT
  // ==========================================================

  const openRejectModal = (
    id: string
  ) => {
    setTargetReviewId(id);
    setRejectReason("");
    setMessage("");
    setError("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!targetReviewId) {
      setError(
        "Review ID hin argamne."
      );
      return;
    }

    if (!rejectReason.trim()) {
      setError(
        "Sababa reject goote galchi."
      );
      return;
    }

    try {
      setMessage("");
      setError("");

      setActionLoading(
        targetReviewId
      );

      await api.post(
        `/department-review/${targetReviewId}/reject`,
        {
          comment:
            rejectReason.trim(),
        }
      );

      setMessage(
        "Mark gara Teacher'tti deebifameera."
      );

      setShowRejectModal(false);
      setRejectReason("");
      setTargetReviewId(null);

      await refetchSubmitted();
    } catch (err: any) {
      console.error(
        "Reject failed:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Reject operation failed."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================================
  // PAGE LOADING
  // ==========================================================

  if (levelsLoading) {
    return (
      <div className="p-10 flex items-center justify-center gap-3 text-gray-600 min-h-[400px]">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />

        <span className="font-medium">
          Loading Department Verification...
        </span>
      </div>
    );
  }

  // ==========================================================
  // NO DEPARTMENT
  // ==========================================================

  if (!deptId) {
    return (
      <div className="p-10 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          <div className="flex gap-3 items-start">
            <AlertCircle className="h-6 w-6 shrink-0" />

            <div>
              <h2 className="font-bold">
                Department hin ramadamne
              </h2>

              <p className="text-sm mt-1">
                Department Head account kee
                keessatti departmentId hin
                argamne.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">

        <div>
          <div className="flex items-center gap-2">

            <ClipboardCheck className="h-7 w-7 text-blue-600" />

            <h1 className="text-2xl font-bold text-gray-900">
              Verification & Curriculum
            </h1>

          </div>

          <p className="text-sm text-gray-500 mt-1">
            Review curriculum and verify
            teacher-submitted student scores.
          </p>

          <p className="text-xs text-gray-400 mt-1 font-mono">
            Department: {deptId}
          </p>
        </div>

        <div className="flex gap-2">

          <Button
            variant="outline"
            onClick={refreshAll}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Link href="/department">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back Dashboard
            </Button>
          </Link>

        </div>

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {(error ||
        levelsError ||
        submittedError) && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">

          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />

          <div>
            <p className="font-medium">
              Error
            </p>

            <p className="text-sm">
              {error ||
                "Data loading failed."}
            </p>
          </div>

        </div>
      )}

      {/* ======================================================
          SUCCESS
      ====================================================== */}

      {message && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">

          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />

          <span className="font-medium">
            {message}
          </span>

        </div>
      )}

      {/* ======================================================
          CURRICULUM
      ====================================================== */}

      <section className="space-y-4">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

          <div>

            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">

              <BookOpen className="h-5 w-5 text-blue-600" />

              Curriculum Modules

            </h2>

            <p className="text-sm text-gray-500">
              Department Head kee keessatti
              level department kee qofa
              argita.
            </p>

          </div>

          {/* ==================================================
              LEVEL SELECT
          ================================================== */}

          <div className="flex items-center gap-3">

            <label className="text-sm font-semibold text-gray-700">
              Filter Level:
            </label>

            <select
              value={currLevel}
              onChange={(e) => {
                setCurrLevel(
                  e.target.value
                );

                setMessage("");
                setError("");
              }}
              className="border border-gray-300 rounded-md p-2 bg-white min-w-[180px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >

              <option value="">
                Select Level
              </option>

              {levels.map(
                (level) => {

                  const levelNumber =
                    level.levelNumber ??
                    level.level_number;

                  return (
                    <option
                      key={level._id}
                      value={normalizeId(
                        level._id
                      )}
                    >
                      {level.name ||
                        `Level ${
                          levelNumber ??
                          ""
                        }`}
                    </option>
                  );
                }
              )}

            </select>

          </div>

        </div>

        {/* ====================================================
            MODULE TABLE
        ==================================================== */}

        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full text-sm text-left">

              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">

                <tr>

                  <th className="p-4">
                    Code
                  </th>

                  <th className="p-4">
                    Name
                  </th>

                  <th className="p-4">
                    Credit
                  </th>

                  <th className="p-4">
                    PIN Status
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {modulesLoading ? (

                  <tr>

                    <td
                      colSpan={4}
                      className="p-6 text-center text-gray-500"
                    >

                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-600" />

                      Loading modules...

                    </td>

                  </tr>

                ) : modules.length === 0 ? (

                  <tr>

                    <td
                      colSpan={4}
                      className="p-6 text-center text-gray-400"
                    >

                      {currLevel
                        ? "No modules found for this level."
                        : "Select a level first."}

                    </td>

                  </tr>

                ) : (

                  modules.map(
                    (module) => {

                      const hasPin =
                        Boolean(
                          module.departmentPin ||
                            module.pin ||
                            module.modulePin
                        );

                      return (

                        <tr
                          key={module._id}
                          className="hover:bg-gray-50/80 transition-colors"
                        >

                          <td className="p-4 font-mono font-medium text-gray-900">
                            {module.code}
                          </td>

                          <td className="p-4 font-medium text-gray-900">
                            {module.name}
                          </td>

                          <td className="p-4 text-gray-700">
                            {module.creditHour ||
                              "-"}
                          </td>

                          <td className="p-4">

                            {hasPin ? (

                              <span className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                                PIN Generated
                              </span>

                            ) : (

                              <span className="inline-flex items-center bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                                PIN Not Required
                              </span>

                            )}

                          </td>

                        </tr>

                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </section>

      {/* ======================================================
          SCORE VERIFICATION
      ====================================================== */}

      <section className="space-y-4">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

          <div>

            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">

              <ClipboardCheck className="h-5 w-5 text-green-600" />

              Score Verification & Level Batch Approval

            </h2>

            <p className="text-sm text-gray-500 mt-1">

              Level filatame keessatti
              Teacher submit godhe ilaali,
              approve ykn reject godhi.

            </p>

          </div>

          {/* ==================================================
              BATCH APPROVAL
          ================================================== */}

          {submittedMarks.length > 0 && (

            <Button
              variant="purple"
              disabled={
                isLevelApproving
              }
              onClick={
                handleApproveEntireLevel
              }
              className="py-2.5 px-5 font-semibold"
            >

              {isLevelApproving ? (

                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />

                  Running Grade Engine...
                </>

              ) : (

                <>
                  <Zap className="h-4 w-4 mr-2" />

                  Approve Entire Level &
                  Trigger Grade Engine
                </>

              )}

            </Button>

          )}

        </div>

        {/* ====================================================
            MARK TABLE
        ==================================================== */}

        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full text-sm text-left">

              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">

                <tr>

                  <th className="p-4">
                    Student Name
                  </th>

                  <th className="p-4">
                    Student ID
                  </th>

                  <th className="p-4">
                    Module
                  </th>

                  <th className="p-4">
                    Institutional
                  </th>

                  <th className="p-4">
                    Industrial
                  </th>

                  <th className="p-4">
                    Total
                  </th>

                  <th className="p-4">
                    Status
                  </th>

                  <th className="p-4 text-right">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {submittedLoading ? (

                  <tr>

                    <td
                      colSpan={8}
                      className="p-8 text-center text-gray-500"
                    >

                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-600" />

                      Loading submitted marks...

                    </td>

                  </tr>

                ) : submittedMarks.length === 0 ? (

                  <tr>

                    <td
                      colSpan={8}
                      className="p-8 text-center text-gray-400"
                    >

                      {!currLevel
                        ? "Select a level first."
                        : "No submitted marks waiting for verification in this Level."}

                    </td>

                  </tr>

                ) : (

                  submittedMarks.map(
                    (mark) => {

                      const reviewKey =
                        mark.reviewId ||
                        mark.markId ||
                        mark._id ||
                        "";

                      const isProcessing =
                        actionLoading ===
                        reviewKey;

                      /*
                       * Student maqaa:
                       *
                       * Backend irraa:
                       * studentName
                       * ykn
                       * student_name
                       * ykn
                       * fullName
                       */

                      const displayStudentName =
                        mark.studentName ||
                        mark.student_name ||
                        mark.fullName ||
                        "Student";

                      return (

                        <tr
                          key={reviewKey}
                          className="hover:bg-gray-50/80 transition-colors"
                        >

                          {/* STUDENT NAME */}

                          <td className="p-4 font-semibold text-gray-900">

                            {displayStudentName}

                          </td>

                          {/* STUDENT ID */}

                          <td className="p-4">

                            <span className="font-mono text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded border">

                              {mark.studentCode ||
                                mark.studentId ||
                                "—"}

                            </span>

                          </td>

                          {/* MODULE */}

                          <td className="p-4">

                            <div className="font-medium text-gray-900">

                              {mark.moduleName ||
                                "—"}

                            </div>

                            <div className="text-xs font-mono text-gray-500">

                              {mark.moduleCode ||
                                ""}

                            </div>

                          </td>

                          {/* INSTITUTIONAL */}

                          <td className="p-4 text-gray-700">

                            {
                              mark.institutionalScore
                            }
                            /70

                          </td>

                          {/* INDUSTRIAL */}

                          <td className="p-4 text-gray-700">

                            {
                              mark.industrialScore
                            }
                            /30

                          </td>

                          {/* TOTAL */}

                          <td className="p-4 font-bold text-blue-700">

                            {mark.totalScore}
                            /100

                          </td>

                          {/* STATUS */}

                          <td className="p-4">

                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full uppercase font-medium border border-yellow-200">

                              {mark.status ||
                                "submitted"}

                            </span>

                          </td>

                          {/* ACTION */}

                          <td className="p-4 text-right">

                            <div className="flex justify-end gap-2">

                              <Button
                                variant="success"
                                className="text-xs px-3 py-1.5"
                                disabled={
                                  isProcessing ||
                                  isLevelApproving
                                }
                                onClick={() =>
                                  handleApprove(
                                    mark
                                  )
                                }
                              >

                                {isProcessing ? (

                                  <RefreshCw className="h-3 w-3 animate-spin" />

                                ) : (

                                  <CheckCircle2 className="h-3 w-3 mr-1" />

                                )}

                                Approve

                              </Button>

                              <Button
                                variant="danger"
                                className="text-xs px-3 py-1.5"
                                disabled={
                                  isProcessing ||
                                  isLevelApproving
                                }
                                onClick={() =>
                                  openRejectModal(
                                    reviewKey
                                  )
                                }
                              >

                                <XCircle className="h-3 w-3 mr-1" />

                                Reject

                              </Button>

                            </div>

                          </td>

                        </tr>

                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </section>

      {/* ======================================================
          REJECT MODAL
      ====================================================== */}

      <Dialog
        open={
          showRejectModal
        }
        onOpenChange={
          setShowRejectModal
        }
      >

        <h2 className="text-lg font-bold mb-2 text-gray-900">

          Reject Submitted Mark

        </h2>

        <p className="text-sm text-gray-500 mb-4">

          Maalif sababniif mark kana
          Teacher'tti deebisaa?

        </p>

        <textarea
          value={rejectReason}
          onChange={(e) => {
            setRejectReason(
              e.target.value
            );
            setError("");
          }}
          placeholder="Reason for rejection..."
          className="w-full border border-gray-300 rounded-md p-3 mb-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-sm"
        />

        <div className="flex justify-end gap-2">

          <Button
            variant="outline"
            onClick={() => {
              setShowRejectModal(
                false
              );

              setRejectReason("");

              setTargetReviewId(
                null
              );
            }}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            disabled={
              !rejectReason.trim() ||
              !!actionLoading
            }
            onClick={
              handleReject
            }
          >

            {actionLoading ? (

              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />

                Rejecting...
              </>

            ) : (

              <>
                <XCircle className="h-4 w-4 mr-2" />

                Reject
              </>

            )}

          </Button>

        </div>

      </Dialog>

    </div>
  )}