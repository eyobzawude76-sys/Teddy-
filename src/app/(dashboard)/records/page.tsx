"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib";
import {
  FileText,
  Search,
  RefreshCw,
} from "lucide-react";

interface Student {
  _id: string;

  studentId: string;
  studentNumber?: string | null;

  fullName: string;
  email?: string | null;

  departmentId?: string | null;
  departmentName?: string | null;

  courseId?: string | null;
  courseName?: string | null;

  levelId?: string | null;
  levelName?: string | null;

  gpa?: number | null;

  committeeStatus: string;

  overallStatus?: string | null;

  reviewId: string;

  committeeFinalized?: boolean;
  committeeFinalizedAt?: string | null;
}

export default function RecordStudentsPage() {

  const [search, setSearch] = useState("");

  const {
    data: students,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<Student[]>({

    queryKey: [
      "record-students",
    ],

    queryFn: async () => {

      const response = await api.get(
        "/record-office/directory"
      );

      return response.data;

    },

  });

  /*
   * Search
   */

  const filteredStudents = useMemo(() => {

    if (!students) {
      return [];
    }

    const searchValue =
      search.trim().toLowerCase();

    if (!searchValue) {
      return students;
    }

    return students.filter(
      (student) => {

        return (

          student.fullName
            ?.toLowerCase()
            .includes(searchValue)

          ||

          student.studentId
            ?.toLowerCase()
            .includes(searchValue)

          ||

          student.studentNumber
            ?.toLowerCase()
            .includes(searchValue)

          ||

          student.email
            ?.toLowerCase()
            .includes(searchValue)

          ||

          student.departmentName
            ?.toLowerCase()
            .includes(searchValue)

          ||

          student.courseName
            ?.toLowerCase()
            .includes(searchValue)

        );

      }
    );

  }, [students, search]);

  /*
   * Loading
   */

  if (isLoading) {

    return (

      <div className="min-h-screen p-6 flex items-center justify-center">

        <div className="text-gray-500 text-sm">

          Loading finalized students...

        </div>

      </div>

    );

  }

  /*
   * Error
   */

  if (isError) {

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

            Failed to load Record Office
            students.

          </p>

          <button

            onClick={() => refetch()}

            className="
              mt-4
              inline-flex
              items-center
              gap-2
              bg-blue-600
              text-white
              px-4
              py-2
              rounded-lg
              hover:bg-blue-700
            "

          >

            <RefreshCw size={16} />

            Try Again

          </button>

        </div>

      </div>

    );

  }

  return (

    <div className="
      p-6
      space-y-6
    ">

      {/* ================================
          HEADER
      ================================= */}

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

            Record Office

          </h1>

          <p className="
            mt-1
            text-gray-500
          ">

            Finalized Student Academic Records

          </p>

        </div>

        <button

          onClick={() => refetch()}

          disabled={isFetching}

          className="
            inline-flex
            items-center
            justify-center
            gap-2
            border
            bg-white
            px-4
            py-2
            rounded-lg
            text-sm
            font-medium
            hover:bg-gray-50
            disabled:opacity-50
          "

        >

          <RefreshCw
            size={16}
            className={
              isFetching
                ? "animate-spin"
                : ""
            }
          />

          Refresh

        </button>

      </div>

      {/* ================================
          FINALIZED INFORMATION
      ================================= */}

      <div className="
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
            w-2
            h-2
            rounded-full
            bg-green-600
          " />

          <p className="
            text-sm
            text-green-800
            font-medium
          ">

            Only Committee FINALIZED records
            are displayed in the Record Office.

          </p>

        </div>

      </div>

      {/* ================================
          SEARCH
      ================================= */}

      <div className="
        bg-white
        border
        rounded-xl
        p-4
      ">

        <div className="relative">

          <Search
            size={18}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-gray-400
            "
          />

          <input

            type="text"

            value={search}

            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }

            placeholder="
              Search by student number,
              name, department or course...
            "

            className="
              w-full
              border
              rounded-lg
              pl-10
              pr-4
              py-3
              text-sm
              outline-none
              focus:ring-2
              focus:ring-blue-500
            "

          />

        </div>

      </div>

      {/* ================================
          STUDENT TABLE
      ================================= */}

      <div className="
        bg-white
        border
        rounded-xl
        overflow-hidden
      ">

        <div className="
          px-5
          py-4
          border-b
          flex
          items-center
          justify-between
        ">

          <div>

            <h2 className="
              font-semibold
              text-gray-900
            ">

              Students A–Z

            </h2>

            <p className="
              text-xs
              text-gray-500
              mt-1
            ">

              Committee finalized students

            </p>

          </div>

          <span className="
            text-sm
            text-gray-500
          ">

            {filteredStudents.length}
            {" "}
            student(s)

          </span>

        </div>

        <div className="overflow-x-auto">

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
                  font-semibold
                ">

                  Student Number

                </th>

                <th className="
                  p-4
                  text-left
                  font-semibold
                ">

                  Name

                </th>

                <th className="
                  p-4
                  text-left
                  font-semibold
                ">

                  Department

                </th>

                <th className="
                  p-4
                  text-left
                  font-semibold
                ">

                  Course

                </th>

                <th className="
                  p-4
                  text-left
                  font-semibold
                ">

                  Level

                </th>

                <th className="
                  p-4
                  text-left
                  font-semibold
                ">

                  GPA

                </th>

                <th className="
                  p-4
                  text-left
                  font-semibold
                ">

                  Status

                </th>

                <th className="
                  p-4
                  text-left
                  font-semibold
                ">

                  Action

                </th>

              </tr>

            </thead>

            <tbody className="divide-y">

              {filteredStudents.length === 0 ? (

                <tr>

                  <td
                    colSpan={8}
                    className="
                      p-10
                      text-center
                      text-gray-500
                    "
                  >

                    No FINALIZED student
                    records found.

                  </td>

                </tr>

              ) : (

                filteredStudents.map(
                  (student) => (

                    <tr
                      key={
                        student.reviewId ||
                        student._id
                      }

                      className="
                        hover:bg-gray-50
                        transition
                      "
                    >

                      {/* Student Number */}

                      <td className="
                        p-4
                        font-semibold
                        text-gray-900
                      ">

                        {student.studentNumber ||
                          student.studentId}

                      </td>

                      {/* Name */}

                      <td className="p-4">

                        <div className="
                          font-medium
                          text-gray-900
                        ">

                          {student.fullName}

                        </div>

                        {student.email && (

                          <div className="
                            text-xs
                            text-gray-500
                            mt-1
                          ">

                            {student.email}

                          </div>

                        )}

                      </td>

                      {/* Department */}

                      <td className="p-4">

                        {student.departmentName ||
                          "-"}

                      </td>

                      {/* Course */}

                      <td className="p-4">

                        {student.courseName ||
                          "-"}

                      </td>

                      {/* Level */}

                      <td className="p-4">

                        {student.levelName ||
                          "-"}

                      </td>

                      {/* GPA */}

                      <td className="
                        p-4
                        font-semibold
                      ">

                        {
                          student.gpa !==
                            null &&
                          student.gpa !==
                            undefined

                            ? Number(
                                student.gpa
                              ).toFixed(2)

                            : "-"
                        }

                      </td>

                      {/* Status */}

                      <td className="p-4">

                        <span className="
                          inline-flex
                          items-center
                          px-3
                          py-1
                          rounded-full
                          bg-green-100
                          text-green-700
                          text-xs
                          font-semibold
                        ">

                          FINALIZED

                        </span>

                      </td>

                      {/* Detail */}

                      <td className="p-4">

                        <Link

                          href={
                            `/records/transcript/${student._id}`
                          }

                          className="
                            inline-flex
                            items-center
                            gap-2
                            bg-blue-600
                            text-white
                            px-3
                            py-2
                            rounded-lg
                            text-xs
                            font-medium
                            hover:bg-blue-700
                          "

                        >

                          <FileText
                            size={15}
                          />

                          Detail

                        </Link>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}