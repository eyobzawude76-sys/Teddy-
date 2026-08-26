"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib";

import {
  Users,
  GraduationCap,
  RefreshCw,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

/* ===================================================== */
/* TYPES */
/* ===================================================== */

interface Course {
  courseId: string;
  name: string;
  code: string;
}

interface Level {
  levelId: string;
  courseId: string;
  departmentId: string;
  levelNumber: number;
  description: string;
}

interface Student {
  id: string;
  studentId: string;
  studentName: string;
  status: string;
}

/* ===================================================== */
/* PAGE */
/* ===================================================== */

export default function ReportsPage() {
  /* --------------------------------------------------- */
  /* COURSES */
  /* --------------------------------------------------- */

  const [courses, setCourses] = useState<Course[]>([]);

  /* --------------------------------------------------- */
  /* LEVELS */
  /* --------------------------------------------------- */

  const [levels, setLevels] = useState<Level[]>([]);

  /* --------------------------------------------------- */
  /* STUDENTS */
  /* --------------------------------------------------- */

  const [students, setStudents] = useState<Student[]>([]);

  /* --------------------------------------------------- */
  /* SELECTED COURSE */
  /* --------------------------------------------------- */

  const [selectedCourse, setSelectedCourse] = useState("");

  /* --------------------------------------------------- */
  /* SELECTED LEVEL */
  /* --------------------------------------------------- */

  const [selectedLevel, setSelectedLevel] = useState("");

  /* --------------------------------------------------- */
  /* LOADING */
  /* --------------------------------------------------- */

  const [loadingCourses, setLoadingCourses] = useState(false);

  const [loadingLevels, setLoadingLevels] = useState(false);

  const [loadingStudents, setLoadingStudents] = useState(false);

  /* --------------------------------------------------- */
  /* ERROR */
  /* --------------------------------------------------- */

  const [error, setError] = useState("");

  /* ===================================================== */
  /* INITIAL LOAD */
  /* ===================================================== */

  useEffect(() => {
    fetchCourses();
  }, []);

  /* ===================================================== */
  /* FETCH COURSES */
  /* ===================================================== */

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      setError("");

      const response = await api.get("/reports/courses");

      setCourses(response.data?.courses || []);
    } catch (err) {
      console.error("Failed loading courses:", err);

      setError(
        "Failed to load courses. Please make sure the Reports API is available."
      );
    } finally {
      setLoadingCourses(false);
    }
  };

  /* ===================================================== */
  /* COURSE CHANGE */
  /* ===================================================== */

  const handleCourseChange = async (courseId: string) => {
    setSelectedCourse(courseId);
    setSelectedLevel("");
    setStudents([]);
    setLevels([]);
    setError("");

    if (!courseId) {
      return;
    }

    try {
      setLoadingLevels(true);

      const response = await api.get(
        `/reports/courses/${courseId}/levels`
      );

      setLevels(response.data?.levels || []);
    } catch (err) {
      console.error("Failed loading levels:", err);

      setError("Failed to load levels.");
    } finally {
      setLoadingLevels(false);
    }
  };

  /* ===================================================== */
  /* LEVEL CHANGE */
  /* ===================================================== */

  const handleLevelChange = async (levelId: string) => {
    setSelectedLevel(levelId);
    setStudents([]);
    setError("");

    if (!levelId || !selectedCourse) {
      return;
    }

    try {
      setLoadingStudents(true);

      const response = await api.get(
        `/reports/courses/${selectedCourse}/levels/${levelId}/students`
      );

      setStudents(response.data?.students || []);
    } catch (err) {
      console.error("Failed loading students:", err);

      setError("Failed to load students.");
    } finally {
      setLoadingStudents(false);
    }
  };

  /* ===================================================== */
  /* REFRESH */
  /* ===================================================== */

  const refreshReport = async () => {
    setError("");

    await fetchCourses();

    if (!selectedCourse) {
      return;
    }

    try {
      setLoadingLevels(true);

      const levelResponse = await api.get(
        `/reports/courses/${selectedCourse}/levels`
      );

      const newLevels = levelResponse.data?.levels || [];

      setLevels(newLevels);

      if (!selectedLevel) {
        return;
      }

      const levelStillExists = newLevels.some(
        (level: Level) => level.levelId === selectedLevel
      );

      if (!levelStillExists) {
        setSelectedLevel("");
        setStudents([]);
        return;
      }

      setLoadingStudents(true);

      const studentResponse = await api.get(
        `/reports/courses/${selectedCourse}/levels/${selectedLevel}/students`
      );

      setStudents(studentResponse.data?.students || []);
    } catch (err) {
      console.error("Failed refreshing report:", err);

      setError("Failed to refresh report.");
    } finally {
      setLoadingLevels(false);
      setLoadingStudents(false);
    }
  };

  /* ===================================================== */
  /* SELECTED DATA */
  /* ===================================================== */

  const selectedCourseData = courses.find(
    (course) => course.courseId === selectedCourse
  );

  const selectedLevelData = levels.find(
    (level) => level.levelId === selectedLevel
  );

  /* ===================================================== */
  /* UI */
  /* ===================================================== */

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div
        className="
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-4
        "
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reports
          </h1>

          <p className="text-gray-500 mt-1">
            View students by course and level
          </p>
        </div>

        <button
          onClick={refreshReport}
          disabled={loadingCourses || loadingLevels || loadingStudents}
          className="
            flex
            items-center
            justify-center
            gap-2
            px-4
            py-2
            bg-blue-600
            text-white
            rounded-lg
            hover:bg-blue-700
            disabled:opacity-50
            disabled:cursor-not-allowed
            transition
          "
        >
          <RefreshCw
            size={18}
            className={
              loadingCourses || loadingLevels || loadingStudents
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* ================================================= */}
      {/* SELECTORS */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* COURSE */}

        <div className="bg-white border rounded-xl p-5 shadow-sm">

          <label
            className="
              block
              text-sm
              font-semibold
              text-gray-700
              mb-2
            "
          >
            Select Dept
          </label>

          <div className="relative">

            <select
              value={selectedCourse}
              onChange={(e) =>
                handleCourseChange(e.target.value)
              }
              disabled={loadingCourses}
              className="
                w-full
                appearance-none
                border
                border-gray-300
                rounded-lg
                px-4
                py-3
                pr-10
                bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                disabled:bg-gray-100
              "
            >

              <option value="">
                {loadingCourses
                  ? "Loading courses..."
                  : "Select Course"}
              </option>

              {courses.map((course) => (
                <option
                  key={course.courseId}
                  value={course.courseId}
                >
                  {course.name}
                  {course.code
                    ? ` (${course.code})`
                    : ""}
                </option>
              ))}

            </select>

            <ChevronDown
              size={18}
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-gray-400
                pointer-events-none
              "
            />

          </div>
        </div>

        {/* LEVEL */}

        <div className="bg-white border rounded-xl p-5 shadow-sm">

          <label
            className="
              block
              text-sm
              font-semibold
              text-gray-700
              mb-2
            "
          >
            Select Level
          </label>

          <div className="relative">

            <select
              value={selectedLevel}
              onChange={(e) =>
                handleLevelChange(e.target.value)
              }
              disabled={
                !selectedCourse ||
                loadingLevels
              }
              className="
                w-full
                appearance-none
                border
                border-gray-300
                rounded-lg
                px-4
                py-3
                pr-10
                bg-white
                disabled:bg-gray-100
                disabled:text-gray-400
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            >

              <option value="">
                {loadingLevels
                  ? "Loading levels..."
                  : !selectedCourse
                    ? "Select course first"
                    : "Select Level"}
              </option>

              {levels.map((level) => (
                <option
                  key={level.levelId}
                  value={level.levelId}
                >
                  Level {level.levelNumber}
                </option>
              ))}

            </select>

            <ChevronDown
              size={18}
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-gray-400
                pointer-events-none
              "
            />

          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div
          className="
            flex
            items-center
            gap-3
            bg-red-50
            border
            border-red-200
            text-red-600
            p-4
            rounded-lg
          "
        >
          <AlertCircle size={20} />

          <span>{error}</span>
        </div>
      )}

      {/* ================================================= */}
      {/* SUMMARY */}
      {/* ================================================= */}

      {selectedCourse && selectedLevel && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* COURSE */}

          <div className="bg-white border rounded-xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <span className="text-gray-500 text-sm">
                Course
              </span>

              <GraduationCap size={22} />

            </div>

            <h2 className="text-xl font-bold mt-3">
              {selectedCourseData?.name || "-"}
            </h2>

          </div>

          {/* LEVEL */}

          <div className="bg-white border rounded-xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <span className="text-gray-500 text-sm">
                Level
              </span>

              <GraduationCap size={22} />

            </div>

            <h2 className="text-3xl font-bold mt-3">
              Level {selectedLevelData?.levelNumber || "-"}
            </h2>

          </div>

          {/* STUDENTS */}

          <div className="bg-white border rounded-xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <span className="text-gray-500 text-sm">
                Students
              </span>

              <Users size={22} />

            </div>

            <h2 className="text-3xl font-bold mt-3">
              {students.length}
            </h2>

          </div>

        </div>
      )}

      {/* ================================================= */}
      {/* STUDENT TABLE */}
      {/* ================================================= */}

      {selectedCourse && selectedLevel && (
        <div
          className="
            bg-white
            border
            rounded-xl
            shadow-sm
            overflow-hidden
          "
        >

          <div className="p-5 border-b bg-gray-50">

            <h2 className="text-xl font-bold text-gray-900">
              {selectedCourseData?.name}
            </h2>

            <p className="text-gray-500 mt-1">
              Level {selectedLevelData?.levelNumber}
            </p>

          </div>

          {loadingStudents ? (

            <div className="p-10 text-center text-gray-500">

              <RefreshCw
                size={22}
                className="animate-spin mx-auto mb-3"
              />

              Loading students...

            </div>

          ) : students.length === 0 ? (

            <div className="p-10 text-center text-gray-500">

              <Users
                size={40}
                className="mx-auto mb-3 text-gray-300"
              />

              No students found for this course and level.

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-gray-50 border-b">

                  <tr>

                    <th className="p-4 text-left font-semibold">
                      #
                    </th>

                    <th className="p-4 text-left font-semibold">
                      Student ID
                    </th>

                    <th className="p-4 text-left font-semibold">
                      Student Name
                    </th>

                    <th className="p-4 text-left font-semibold">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y">

                  {students.map((student, index) => (

                    <tr
                      key={student.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="p-4 text-gray-500">
                        {index + 1}
                      </td>

                      <td className="p-4 font-medium">
                        {student.studentId}
                      </td>

                      <td className="p-4 font-medium text-gray-900">
                        {student.studentName}
                      </td>

                      <td className="p-4">

                        <span
                          className="
                            inline-flex
                            items-center
                            px-3
                            py-1
                            rounded-full
                            text-xs
                            font-semibold
                            bg-green-50
                            text-green-700
                          "
                        >
                          {student.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>
      )}

      {/* ================================================= */}
      {/* NOTHING SELECTED */}
      {/* ================================================= */}

      {!selectedCourse && (

        <div
          className="
            bg-white
            border
            rounded-xl
            p-12
            text-center
            shadow-sm
          "
        >

          <GraduationCap
            size={50}
            className="mx-auto mb-4 text-gray-300"
          />

          <h2 className="text-xl font-semibold text-gray-700">
            Select a Course
          </h2>

          <p className="text-gray-500 mt-2">
            Select a course above to view its levels and students.
          </p>

        </div>

      )}

    </div>
  );
}