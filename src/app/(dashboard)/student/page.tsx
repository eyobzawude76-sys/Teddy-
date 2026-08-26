"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib";
import { useAuthStore } from "@/stores";

import {
  User,
  Mail,
  Building,
  Layers,
  ShieldCheck,
  FileText,
  Lock,
  AlertCircle,
  RefreshCw,
  GraduationCap,
} from "lucide-react";

// ============================================================
// SKELETON
// ============================================================

const Skeleton = ({
  className = "",
}: {
  className?: string;
}) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
  />
);

// ============================================================
// TYPES
// ============================================================

interface StudentProfile {
  _id: string;
  studentId: string;
  status: string;

  fullName: string;
  email: string;

  departmentId?: string;
  department?: string;

  levelId?: string;
  currentLevel?: number | string;
  levelName?: string;
}

// ============================================================
// FINALIZED MODULE
// ============================================================

interface FinalizedModule {
  moduleId: string;
  moduleName: string;

  creditHour: number;

  institutional: number;
  industrial: number;

  totalScore: number;

  grade: string;
  gradePoint: number;
  qualityPoint: number;

  status: string;

  markAvailable: boolean;
}

// ============================================================
// FINALIZED RESULT
// ============================================================

interface FinalizedResult {
  id: string;

  studentId: string;
  studentNumber: string;
  fullName: string;

  departmentId?: string;
  levelId?: string;

  gpa: number;

  status: string;

  committeeFinalized: boolean;
  committeeFinalizedAt?: string;

  modules: FinalizedModule[];

  totalModules: number;
  passedModules: number;

  totalCredits: number;
  totalQualityPoints: number;

  overallStatus?: string;
}

// ============================================================
// RESULT API RESPONSE
// ============================================================

interface StudentResultResponse {
  student: {
    studentId: string;
    fullName: string;
    email: string;
  };

  results: FinalizedResult[];

  count: number;
}

// ============================================================
// STUDENT PAGE
// ============================================================

export default function StudentPage() {
  const router = useRouter();

  const {
    user,
    isAuthenticated,
  } = useAuthStore();

  // ==========================================================
  // ROLE CHECK
  // ==========================================================

  const isStudent =
    user?.role === "student";

  // ==========================================================
  // STUDENT PROFILE
  // ==========================================================

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery<StudentProfile>({
    queryKey: ["student-profile"],

    queryFn: async () => {
      const res = await api.get(
        "/students/me"
      );

      return res.data;
    },

    enabled:
      isAuthenticated &&
      isStudent,
  });

  // ==========================================================
  // FINALIZED RESULT
  //
  // IMPORTANT:
  // Student result is NOT requested using another student's ID.
  //
  // Backend identifies the logged-in student automatically.
  //
  // Only:
  // status = FINALIZED
  // committeeFinalized = true
  //
  // ==========================================================

  const {
    data: resultData,
    isLoading: resultLoading,
    isError: resultError,
    refetch: refetchResults,
  } = useQuery<StudentResultResponse>({
    queryKey: [
      "student-finalized-results",
    ],

    queryFn: async () => {
      const res = await api.get(
        "/students/my-finalized-results"
      );

      return res.data;
    },

    enabled:
      isAuthenticated &&
      isStudent,
  });

  // ==========================================================
  // RESULTS
  // ==========================================================

  const results =
    resultData?.results ?? [];

  // ==========================================================
  // LOGIN / ROLE REDIRECT
  // ==========================================================

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (
      user?.role &&
      user.role !== "student"
    ) {
      router.push("/");
    }
  }, [
    isAuthenticated,
    user,
    router,
  ]);

  // ==========================================================
  // ACCESS DENIED
  // ==========================================================

  if (
    !isAuthenticated ||
    !isStudent
  ) {
    return null;
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="
          bg-white
          border
          rounded-2xl
          shadow-sm
          p-6
        ">

          <div className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
          ">

            <div>

              <div className="
                flex
                items-center
                gap-3
              ">

                <div className="
                  p-3
                  bg-blue-50
                  text-blue-600
                  rounded-xl
                ">

                  <GraduationCap
                    size={28}
                  />

                </div>

                <div>

                  <h1 className="
                    text-3xl
                    font-bold
                    text-gray-900
                  ">
                    Student Portal
                  </h1>

                  <p className="
                    text-sm
                    text-gray-500
                    mt-1
                  ">
                    Official Academic Result
                  </p>

                </div>

              </div>

            </div>

            {/* REFRESH */}

            <button
              onClick={() =>
                refetchResults()
              }
              disabled={resultLoading}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-4
                py-2.5
                border
                rounded-lg
                bg-white
                hover:bg-gray-50
                text-sm
                font-medium
                disabled:opacity-50
              "
            >

              <RefreshCw
                size={16}
                className={
                  resultLoading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh Result

            </button>

          </div>

        </div>

        {/* ==================================================
            PROFILE ERROR
        ================================================== */}

        {profileError && (

          <div className="
            bg-red-50
            border
            border-red-200
            text-red-700
            p-4
            rounded-xl
            flex
            items-center
            gap-3
          ">

            <AlertCircle
              size={20}
            />

            <div>

              <p className="font-semibold">
                Failed to load profile
              </p>

              <p className="text-sm">
                Please refresh the page.
              </p>

            </div>

          </div>

        )}

        {/* ==================================================
            PROFILE SUMMARY
        ================================================== */}

        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-4
        ">

          {/* STUDENT ID */}

          <div className="
            bg-white
            border
            rounded-xl
            p-5
            shadow-sm
          ">

            <div className="
              flex
              justify-between
              items-center
            ">

              <p className="
                text-sm
                text-gray-500
              ">
                Student ID
              </p>

              <ShieldCheck
                className="text-blue-600"
                size={20}
              />

            </div>

            <div className="
              mt-3
              font-bold
              font-mono
              text-lg
            ">

              {profileLoading ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                profile?.studentId ||
                "N/A"
              )}

            </div>

          </div>

          {/* LEVEL */}

          <div className="
            bg-white
            border
            rounded-xl
            p-5
            shadow-sm
          ">

            <div className="
              flex
              justify-between
              items-center
            ">

              <p className="
                text-sm
                text-gray-500
              ">
                Level
              </p>

              <Layers
                className="text-purple-600"
                size={20}
              />

            </div>

            <div className="
              mt-3
              font-bold
              text-lg
            ">

              {profileLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                profile?.levelName ||
                (
                  profile?.currentLevel
                    ? `Level ${profile.currentLevel}`
                    : "N/A"
                )
              )}

            </div>

          </div>

          {/* DEPARTMENT */}

          <div className="
            bg-white
            border
            rounded-xl
            p-5
            shadow-sm
          ">

            <div className="
              flex
              justify-between
              items-center
            ">

              <p className="
                text-sm
                text-gray-500
              ">
                Department
              </p>

              <Building
                className="text-green-600"
                size={20}
              />

            </div>

            <div className="
              mt-3
              font-bold
              text-lg
            ">

              {profileLoading ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                profile?.department ||
                "Not Assigned"
              )}

            </div>

          </div>

          {/* ACCOUNT */}

          <div className="
            bg-white
            border
            rounded-xl
            p-5
            shadow-sm
          ">

            <div className="
              flex
              justify-between
              items-center
            ">

              <p className="
                text-sm
                text-gray-500
              ">
                Account
              </p>

              <User
                className="text-orange-600"
                size={20}
              />

            </div>

            <div className="
              mt-3
              font-bold
              uppercase
              text-lg
            ">

              {profile?.status ||
                "Pending"}

            </div>

          </div>

        </div>

        {/* ==================================================
            PERSONAL INFORMATION
        ================================================== */}

        <div className="
          bg-white
          border
          rounded-xl
          shadow-sm
          p-6
        ">

          <h2 className="
            text-lg
            font-bold
            flex
            items-center
            gap-2
            mb-5
          ">

            <User
              size={20}
              className="text-blue-600"
            />

            Personal Information

          </h2>

          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-4
            text-sm
          ">

            {/* NAME */}

            <div className="
              bg-gray-50
              rounded-lg
              p-4
            ">

              <p className="
                text-xs
                text-gray-500
                mb-1
              ">
                Full Name
              </p>

              <p className="font-semibold">
                {profile?.fullName ||
                  "N/A"}
              </p>

            </div>

            {/* EMAIL */}

            <div className="
              bg-gray-50
              rounded-lg
              p-4
            ">

              <p className="
                text-xs
                text-gray-500
                mb-1
              ">
                Email
              </p>

              <p className="font-semibold break-all">
                {profile?.email ||
                  "N/A"}
              </p>

            </div>

            {/* DEPARTMENT */}

            <div className="
              bg-gray-50
              rounded-lg
              p-4
            ">

              <p className="
                text-xs
                text-gray-500
                mb-1
              ">
                Department
              </p>

              <p className="font-semibold">
                {profile?.department ||
                  "Not Assigned"}
              </p>

            </div>

            {/* STUDENT NUMBER */}

            <div className="
              bg-gray-50
              rounded-lg
              p-4
            ">

              <p className="
                text-xs
                text-gray-500
                mb-1
              ">
                Student Number
              </p>

              <p className="
                font-semibold
                font-mono
              ">
                {profile?.studentId ||
                  "N/A"}
              </p>

            </div>

          </div>

        </div>

        {/* ==================================================
            OFFICIAL FINALIZED RESULTS
        ================================================== */}

        <div className="
          bg-white
          border
          rounded-2xl
          shadow-sm
          p-6
        ">

          {/* TITLE */}

          <div className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
            mb-6
          ">

            <div>

              <h2 className="
                text-2xl
                font-bold
                flex
                items-center
                gap-2
              ">

                <FileText
                  className="text-blue-600"
                  size={24}
                />

                My Academic Results

              </h2>

              <p className="
                text-sm
                text-gray-500
                mt-1
              ">
                Only Committee-finalized results
                are displayed here.
              </p>

            </div>

            {results.length > 0 && (

              <div className="
                inline-flex
                items-center
                gap-2
                bg-green-50
                border
                border-green-200
                text-green-700
                px-4
                py-2
                rounded-lg
                text-sm
                font-semibold
              ">

                <ShieldCheck size={17} />

                Official Result

              </div>

            )}

          </div>

          {/* ==================================================
              LOADING
          ================================================== */}

          {resultLoading && (

            <div className="
              space-y-4
            ">

              <Skeleton className="h-24 w-full" />

              <Skeleton className="h-24 w-full" />

              <Skeleton className="h-40 w-full" />

            </div>

          )}

          {/* ==================================================
              ERROR
          ================================================== */}

          {!resultLoading &&
            resultError && (

              <div className="
                bg-red-50
                border
                border-red-200
                text-red-700
                p-5
                rounded-xl
                flex
                gap-3
                items-start
              ">

                <AlertCircle
                  size={20}
                  className="mt-0.5"
                />

                <div>

                  <p className="font-semibold">
                    Failed to load your result.
                  </p>

                  <p className="text-sm mt-1">
                    Please try again.
                  </p>

                </div>

              </div>

            )}

          {/* ==================================================
              NO FINALIZED RESULT
          ================================================== */}

          {!resultLoading &&
            !resultError &&
            results.length === 0 && (

              <div className="
                border-2
                border-dashed
                rounded-xl
                p-10
                text-center
              ">

                <div className="
                  mx-auto
                  w-14
                  h-14
                  rounded-full
                  bg-gray-100
                  flex
                  items-center
                  justify-center
                  mb-4
                ">

                  <FileText
                    size={28}
                    className="text-gray-400"
                  />

                </div>

                <h3 className="
                  font-bold
                  text-gray-800
                ">
                  Result Not Available Yet
                </h3>

                <p className="
                  text-sm
                  text-gray-500
                  mt-2
                  max-w-md
                  mx-auto
                ">
                  Your result will appear here
                  after the Committee has finalized
                  it and the Record Office has archived it.
                </p>

                <div className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  bg-yellow-50
                  border
                  border-yellow-200
                  text-yellow-700
                  px-4
                  py-2
                  rounded-lg
                  text-xs
                  font-medium
                ">

                  <Lock size={14} />

                  Waiting for FINALIZED result

                </div>

              </div>

            )}

          {/* ==================================================
              RESULTS
          ================================================== */}

          {!resultLoading &&
            !resultError &&
            results.length > 0 && (

              <div className="space-y-8">

                {results.map((record) => (

                  <div
                    key={record.id}
                    className="
                      border
                      rounded-2xl
                      overflow-hidden
                    "
                  >

                    {/* ======================================
                        RESULT HEADER
                    ====================================== */}

                    <div className="
                      bg-gray-50
                      border-b
                      p-5
                    ">

                      <div className="
                        flex
                        flex-col
                        md:flex-row
                        md:items-center
                        md:justify-between
                        gap-4
                      ">

                        <div>

                          <h3 className="
                            text-xl
                            font-bold
                            text-gray-900
                          ">

                            Academic Result

                          </h3>

                          <div className="
                            mt-1
                            text-sm
                            text-gray-500
                            space-y-1
                          ">

                            <p>
                              Student Number:{" "}
                              <span className="
                                font-semibold
                                font-mono
                                text-gray-800
                              ">
                                {record.studentNumber}
                              </span>
                            </p>

                            <p>
                              Student:{" "}
                              <span className="
                                font-semibold
                                text-gray-800
                              ">
                                {record.fullName}
                              </span>
                            </p>

                          </div>

                        </div>

                        {/* FINALIZED BADGE */}

                        <div className="
                          inline-flex
                          items-center
                          gap-2
                          bg-green-100
                          text-green-700
                          border
                          border-green-200
                          px-4
                          py-2.5
                          rounded-xl
                          text-sm
                          font-bold
                        ">

                          <Lock size={17} />

                          FINALIZED

                        </div>

                      </div>

                    </div>

                    {/* ======================================
                        SUMMARY CARDS
                    ====================================== */}

                    <div className="p-5">

                      <div className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-5
                        gap-4
                      ">

                        {/* GPA */}

                        <div className="
                          bg-blue-50
                          rounded-xl
                          p-4
                        ">

                          <p className="
                            text-xs
                            text-blue-600
                            font-medium
                          ">
                            GPA
                          </p>

                          <p className="
                            text-3xl
                            font-bold
                            text-blue-900
                            mt-1
                          ">

                            {Number(
                              record.gpa || 0
                            ).toFixed(2)}

                          </p>

                        </div>

                        {/* TOTAL MODULES */}

                        <div className="
                          bg-gray-50
                          rounded-xl
                          p-4
                        ">

                          <p className="
                            text-xs
                            text-gray-500
                          ">
                            Total Modules
                          </p>

                          <p className="
                            text-3xl
                            font-bold
                            mt-1
                          ">

                            {record.totalModules}

                          </p>

                        </div>

                        {/* PASSED */}

                        <div className="
                          bg-green-50
                          rounded-xl
                          p-4
                        ">

                          <p className="
                            text-xs
                            text-green-600
                          ">
                            Passed
                          </p>

                          <p className="
                            text-3xl
                            font-bold
                            text-green-700
                            mt-1
                          ">

                            {record.passedModules}

                          </p>

                        </div>

                        {/* CREDITS */}

                        <div className="
                          bg-purple-50
                          rounded-xl
                          p-4
                        ">

                          <p className="
                            text-xs
                            text-purple-600
                          ">
                            Total Credits
                          </p>

                          <p className="
                            text-3xl
                            font-bold
                            text-purple-800
                            mt-1
                          ">

                            {record.totalCredits}

                          </p>

                        </div>

                        {/* STATUS */}

                        <div className="
                          bg-green-50
                          rounded-xl
                          p-4
                        ">

                          <p className="
                            text-xs
                            text-green-600
                          ">
                            Status
                          </p>

                          <p className="
                            text-xl
                            font-bold
                            text-green-700
                            mt-2
                          ">

                            {record.overallStatus ||
                              "FINALIZED"}

                          </p>

                        </div>

                      </div>

                      {/* ==================================
                          MODULE TABLE
                      ================================== */}

                      <div className="
                        mt-6
                        overflow-x-auto
                        border
                        rounded-xl
                      ">

                        <table className="
                          w-full
                          text-sm
                        ">

                          <thead className="
                            bg-gray-50
                            border-b
                          ">

                            <tr>

                              <th className="
                                p-4
                                text-left
                              ">
                                Module
                              </th>

                              <th className="
                                p-4
                                text-center
                              ">
                                Credit
                              </th>

                              <th className="
                                p-4
                                text-center
                              ">
                                Institutional
                              </th>

                              <th className="
                                p-4
                                text-center
                              ">
                                Industrial
                              </th>

                              <th className="
                                p-4
                                text-center
                              ">
                                Total
                              </th>

                              <th className="
                                p-4
                                text-center
                              ">
                                Grade
                              </th>

                              <th className="
                                p-4
                                text-center
                              ">
                                Point
                              </th>

                              <th className="
                                p-4
                                text-center
                              ">
                                Status
                              </th>

                            </tr>

                          </thead>

                          <tbody className="
                            divide-y
                          ">

                            {record.modules.map(
                              (module) => (

                                <tr
                                  key={
                                    module.moduleId
                                  }
                                  className="
                                    hover:bg-gray-50
                                  "
                                >

                                  {/* MODULE */}

                                  <td className="p-4">

                                    <p className="
                                      font-semibold
                                      text-gray-900
                                    ">
                                      {
                                        module.moduleName
                                      }
                                    </p>

                                  </td>

                                  {/* CREDIT */}

                                  <td className="
                                    p-4
                                    text-center
                                  ">

                                    {
                                      module.creditHour
                                    }

                                  </td>

                                  {/* INSTITUTIONAL */}

                                  <td className="
                                    p-4
                                    text-center
                                  ">

                                    {
                                      module.institutional
                                    }

                                  </td>

                                  {/* INDUSTRIAL */}

                                  <td className="
                                    p-4
                                    text-center
                                  ">

                                    {
                                      module.industrial
                                    }

                                  </td>

                                  {/* TOTAL */}

                                  <td className="
                                    p-4
                                    text-center
                                    font-bold
                                  ">

                                    {
                                      module.totalScore
                                    }

                                  </td>

                                  {/* GRADE */}

                                  <td className="
                                    p-4
                                    text-center
                                  ">

                                    <span className="
                                      inline-flex
                                      items-center
                                      justify-center
                                      min-w-[42px]
                                      px-2
                                      py-1
                                      rounded-lg
                                      bg-blue-50
                                      text-blue-700
                                      font-bold
                                    ">

                                      {
                                        module.grade
                                      }

                                    </span>

                                  </td>

                                  {/* POINT */}

                                  <td className="
                                    p-4
                                    text-center
                                  ">

                                    {
                                      module.gradePoint
                                    }

                                  </td>

                                  {/* STATUS */}

                                  <td className="
                                    p-4
                                    text-center
                                  ">

                                    <span className="
                                      inline-flex
                                      px-2.5
                                      py-1
                                      rounded-full
                                      bg-green-100
                                      text-green-700
                                      text-xs
                                      font-semibold
                                    ">

                                      {
                                        module.status
                                      }

                                    </span>

                                  </td>

                                </tr>

                              )
                            )}

                          </tbody>

                        </table>

                      </div>

                      {/* ==================================
                          FINALIZATION INFORMATION
                      ================================== */}

                      <div className="
                        mt-5
                        flex
                        flex-col
                        md:flex-row
                        md:items-center
                        md:justify-between
                        gap-3
                        bg-green-50
                        border
                        border-green-200
                        rounded-xl
                        p-4
                      ">

                        <div className="
                          flex
                          items-center
                          gap-3
                        ">

                          <div className="
                            p-2
                            bg-green-100
                            rounded-lg
                          ">

                            <ShieldCheck
                              size={20}
                              className="
                                text-green-700
                              "
                            />

                          </div>

                          <div>

                            <p className="
                              font-semibold
                              text-green-800
                            ">
                              Committee Finalized
                            </p>

                            <p className="
                              text-xs
                              text-green-700
                            ">

                              This result is
                              officially finalized.

                            </p>

                          </div>

                        </div>

                        {record.committeeFinalizedAt && (

                          <p className="
                            text-xs
                            text-green-700
                          ">

                            Finalized:{" "}

                            {new Date(
                              record.committeeFinalizedAt
                            ).toLocaleString()}

                          </p>

                        )}

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}

        </div>

        {/* ==================================================
            FOOTER INFORMATION
        ================================================== */}

        <div className="
          bg-blue-50
          border
          border-blue-100
          rounded-xl
          p-5
          flex
          gap-3
          items-start
        ">

          <ShieldCheck
            className="
              text-blue-600
              mt-0.5
              shrink-0
            "
            size={20}
          />

          <div>

            <p className="
              font-semibold
              text-blue-900
            ">
              Official Academic Record
            </p>

            <p className="
              text-sm
              text-blue-700
              mt-1
            ">

              The result displayed on this page
              is retrieved from the Record Office
              only after Committee finalization.

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}