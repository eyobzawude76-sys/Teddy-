"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib";
import {
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

interface ModuleResult {

  moduleId: string;

  moduleName: string;

  creditHour: number;

  institutional?: number;

  industrial?: number;

  totalScore?: number;

  grade?: string;

  gradePoint?: number;

  qualityPoint?: number;

  status?: string;

  markAvailable?: boolean;

}

interface StudentInformation {

  studentId: string;

  studentNumber: string;

  fullName: string;

  email?: string | null;

  departmentId?: string | null;

  departmentName?: string | null;

  courseId?: string | null;

  courseName?: string | null;

  levelId?: string | null;

  levelName?: string | null;

}

interface CommitteeInformation {

  status: string;

  committeeFinalized: boolean;

  committeeFinalizedAt?: string | null;

  committeeFinalizedBy?: string | null;

  overallStatus?: string | null;

  committeeRecommendation?: {

    status?: string;

    action?: string;

    reason?: string;

  } | null;

}

interface AcademicSummary {

  gpa: number;

  totalCredits: number;

  totalModules: number;

  passedModules: number;

  failedModules: number;

  totalQualityPoints: number;

  overallStatus?: string | null;

}

interface StudentDetail {

  studentInformation:
    StudentInformation;

  committee:
    CommitteeInformation;

  academicSummary:
    AcademicSummary;

  modules:
    ModuleResult[];

  reviewId: string;

}

export default function StudentTranscriptPage() {

  const params = useParams();

  const studentId =
    String(
      params.student_id
    );

  const {

    data,

    isLoading,

    isError,

  } = useQuery<StudentDetail>({

    queryKey: [
      "record-student-detail",
      studentId,
    ],

    queryFn: async () => {

      const response =
        await api.get(
          `/record-office/students/${studentId}`
        );

      return response.data;

    },

    enabled:
      Boolean(studentId),

  });

  /*
   * Loading
   */

  if (isLoading) {

    return (

      <div className="
        p-6
        flex
        items-center
        justify-center
      ">

        <p className="
          text-gray-500
        ">

          Loading student record...

        </p>

      </div>

    );

  }

  /*
   * Error
   */

  if (isError || !data) {

    return (

      <div className="p-6">

        <div className="
          max-w-xl
          mx-auto
          bg-red-50
          border
          border-red-200
          rounded-xl
          p-6
          text-center
        ">

          <p className="
            text-red-700
            font-medium
          ">

            Failed to load student
            academic record.

          </p>

          <Link

            href="/records/students"

            className="
              inline-flex
              mt-4
              px-4
              py-2
              bg-blue-600
              text-white
              rounded-lg
            "

          >

            Back to Students

          </Link>

        </div>

      </div>

    );

  }

  const student =
    data.studentInformation;

  const summary =
    data.academicSummary;

  const committee =
    data.committee;

  return (

    <div className="
      p-6
      space-y-6
      max-w-7xl
      mx-auto
    ">

      {/* =================================
          BACK
      ================================== */}

      <Link

        href="/records/students"

        className="
          inline-flex
          items-center
          gap-2
          text-gray-600
          hover:text-blue-600
          text-sm
          font-medium
        "

      >

        <ArrowLeft
          size={18}
        />

        Back to Students

      </Link>

      {/* =================================
          HEADER
      ================================== */}

      <div className="
        flex
        flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-4
      ">

        <div>

          <h1 className="
            text-3xl
            font-bold
            text-gray-900
          ">

            Student Academic Record

          </h1>

          <p className="
            text-gray-500
            mt-1
          ">

            Official Committee Finalized
            Record

          </p>

        </div>

        <div className="
          inline-flex
          items-center
          gap-2
          bg-green-100
          text-green-700
          px-4
          py-2
          rounded-full
          text-sm
          font-semibold
        ">

          <CheckCircle2
            size={18}
          />

          FINALIZED

        </div>

      </div>

      {/* =================================
          STUDENT INFORMATION
      ================================== */}

      <div className="
        bg-white
        border
        rounded-xl
        p-6
        space-y-6
      ">

        <h2 className="
          text-xl
          font-bold
          text-gray-900
        ">

          Student Information

        </h2>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-6
        ">

          <InfoItem

            label="Student Number"

            value={
              student.studentNumber ||
              student.studentId
            }

          />

          <InfoItem

            label="Name"

            value={
              student.fullName
            }

          />

          <InfoItem

            label="Email"

            value={
              student.email ||
              "-"
            }

          />

          <InfoItem

            label="Department"

            value={
              student.departmentName ||
              "-"
            }

          />

          <InfoItem

            label="Course"

            value={
              student.courseName ||
              "-"
            }

          />

          <InfoItem

            label="Level"

            value={
              student.levelName ||
              "-"
            }

          />

        </div>

      </div>

      {/* =================================
          COMMITTEE
      ================================== */}

      <div className="
        bg-white
        border
        rounded-xl
        p-6
        space-y-6
      ">

        <h2 className="
          text-xl
          font-bold
        ">

          Committee Verification

        </h2>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-6
        ">

          <InfoItem

            label="Committee Status"

            value={
              committee.status
            }

          />

          <InfoItem

            label="Overall Status"

            value={
              committee.overallStatus ||
              "-"
            }

          />

          <InfoItem

            label="Finalized At"

            value={

              committee.committeeFinalizedAt

                ? new Date(
                    committee
                      .committeeFinalizedAt
                  ).toLocaleString()

                : "-"

            }

          />

        </div>

        {committee
          .committeeRecommendation && (

          <div className="
            bg-gray-50
            border
            rounded-lg
            p-4
          ">

            <h3 className="
              font-semibold
              mb-3
            ">

              Committee Recommendation

            </h3>

            <p className="
              text-sm
              text-gray-700
            ">

              <strong>
                Status:
              </strong>{" "}

              {
                committee
                  .committeeRecommendation
                  .status ||
                "-"
              }

            </p>

            <p className="
              text-sm
              text-gray-700
              mt-1
            ">

              <strong>
                Action:
              </strong>{" "}

              {
                committee
                  .committeeRecommendation
                  .action ||
                "-"
              }

            </p>

            <p className="
              text-sm
              text-gray-700
              mt-1
            ">

              <strong>
                Reason:
              </strong>{" "}

              {
                committee
                  .committeeRecommendation
                  .reason ||
                "-"
              }

            </p>

          </div>

        )}

      </div>

      {/* =================================
          MODULE RESULTS
      ================================== */}

      <div className="
        bg-white
        border
        rounded-xl
        overflow-hidden
      ">

        <div className="
          p-6
          border-b
        ">

          <h2 className="
            text-xl
            font-bold
          ">

            Academic Results

          </h2>

          <p className="
            text-sm
            text-gray-500
            mt-1
          ">

            Committee finalized module results

          </p>

        </div>

        <div className="
          overflow-x-auto
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

                  Mark

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

              {data.modules.length ===
                0 ? (

                <tr>

                  <td
                    colSpan={6}
                    className="
                      p-10
                      text-center
                      text-gray-500
                    "
                  >

                    No module results found.

                  </td>

                </tr>

              ) : (

                data.modules.map(
                  (module) => (

                    <tr
                      key={
                        module.moduleId
                      }

                      className="
                        hover:bg-gray-50
                      "
                    >

                      <td className="
                        p-4
                        font-medium
                      ">

                        {
                          module.moduleName
                        }

                      </td>

                      <td className="
                        p-4
                        text-center
                      ">

                        {
                          module.creditHour
                        }

                      </td>

                      <td className="
                        p-4
                        text-center
                        font-semibold
                      ">

                        {
                          module.totalScore ??
                          "-"
                        }

                      </td>

                      <td className="
                        p-4
                        text-center
                        font-bold
                      ">

                        {
                          module.grade ||
                          "-"
                        }

                      </td>

                      <td className="
                        p-4
                        text-center
                      ">

                        {
                          module.gradePoint ??
                          "-"
                        }

                      </td>

                      <td className="
                        p-4
                        text-center
                      ">

                        <span
                          className={`
                            inline-flex
                            px-3
                            py-1
                            rounded-full
                            text-xs
                            font-semibold
                            ${
                              module.status ===
                              "PASS"

                                ? `
                                  bg-green-100
                                  text-green-700
                                `

                                : `
                                  bg-red-100
                                  text-red-700
                                `
                            }
                          `}
                        >

                          {
                            module.status ||
                            "-"
                          }

                        </span>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================
          SUMMARY
      ================================== */}

      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        gap-4
      ">

        <SummaryCard

          label="GPA"

          value={
            Number(
              summary.gpa
            ).toFixed(2)
          }

        />

        <SummaryCard

          label="Total Credits"

          value={
            summary.totalCredits
          }

        />

        <SummaryCard

          label="Passed Modules"

          value={
            summary.passedModules
          }

        />

        <SummaryCard

          label="Failed Modules"

          value={
            summary.failedModules
          }

        />

      </div>

      {/* =================================
          FINAL STATUS
      ================================== */}

      <div className="
        bg-green-50
        border
        border-green-200
        rounded-xl
        p-6
      ">

        <div className="
          flex
          items-start
          gap-3
        ">

          <CheckCircle2
            size={25}
            className="
              text-green-600
              mt-0.5
            "
          />

          <div>

            <h2 className="
              font-bold
              text-green-800
            ">

              Official Finalized Record

            </h2>

            <p className="
              text-sm
              text-green-700
              mt-1
            ">

              This academic record has been
              finalized by the Committee and
              is now available in the Record
              Office.

            </p>

          </div>

        </div>

      </div>

    </div>

  );

}

/* ==========================================
   INFORMATION COMPONENT
========================================== */

function InfoItem({

  label,

  value,

}: {

  label: string;

  value: string | number;

}) {

  return (

    <div>

      <p className="
        text-xs
        text-gray-500
        mb-1
      ">

        {label}

      </p>

      <p className="
        font-semibold
        text-gray-900
      ">

        {value}

      </p>

    </div>

  );

}

/* ==========================================
   SUMMARY COMPONENT
========================================== */

function SummaryCard({

  label,

  value,

}: {

  label: string;

  value: string | number;

}) {

  return (

    <div className="
      bg-white
      border
      rounded-xl
      p-5
    ">

      <p className="
        text-sm
        text-gray-500
      ">

        {label}

      </p>

      <p className="
        text-2xl
        font-bold
        text-gray-900
        mt-1
      ">

        {value}

      </p>

    </div>

  );

}