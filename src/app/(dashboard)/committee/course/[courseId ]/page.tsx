'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BookOpen,
  Users,
  FileCheck,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

import { api } from '@/lib';

interface LevelItem {
  levelId: string;
  courseId: string;
  departmentId: string;
  levelNumber: number | string;
  description: string;
  totalMarks: number;
  studentCount: number;
}

interface CourseLevelsResponse {
  courseId: string;
  courseName: string;
  courseCode: string;
  levels: LevelItem[];
}

export default function CommitteeCourseLevelsPage() {
  const params = useParams<{ courseId?: string }>();
  const pathname = usePathname();

  /*
   * Primary source:
   *   /committee/course/[courseId]
   *
   * Fallback:
   *   pathname irraa courseId baasna.
   *
   * Kun /undefined/levels akka hin ergamne mirkaneessa.
   */

  const routeCourseId =
    typeof params?.courseId === 'string' &&
    params.courseId.trim() !== '' &&
    params.courseId !== 'undefined'
      ? params.courseId
      : pathname?.split('/').filter(Boolean).pop() || '';

  const courseId = routeCourseId.trim();

  console.log('====================================');
  console.log('COMMITTEE COURSE PAGE');
  console.log('params:', params);
  console.log('pathname:', pathname);
  console.log('courseId:', courseId);
  console.log('====================================');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<CourseLevelsResponse>({
    queryKey: ['committee-course-levels', courseId],

    queryFn: async () => {
      if (!courseId || courseId === 'undefined') {
        throw new Error('Course ID is missing from URL');
      }

      console.log(
        'GET:',
        `/committee/course/${courseId}/levels`
      );

      const response = await api.get(
        `/committee/course/${courseId}/levels`
      );

      console.log('COURSE LEVEL RESPONSE:', response.data);

      return response.data;
    },

    enabled:
      !!courseId &&
      courseId !== 'undefined' &&
      courseId !== 'null',
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <RefreshCw
            size={22}
            className="animate-spin text-blue-600"
          />
          <span className="font-medium">
            Loading course levels...
          </span>
        </div>
      </div>
    );
  }

  if (isError) {
    const message =
      (error as any)?.response?.data?.detail ||
      (error as Error)?.message ||
      'Failed to load course levels';

    return (
      <div className="max-w-5xl mx-auto p-6">
        <Link
          href="/committee"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-5"
        >
          <ArrowLeft size={17} />
          Back to Committee
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="text-xl font-bold text-red-700">
            Failed to Load Course Levels
          </h2>

          <p className="text-red-600 mt-2">
            {message}
          </p>

          <p className="text-xs text-gray-500 mt-3">
            Course ID: {courseId || 'MISSING'}
          </p>

          <button
            onClick={() => refetch()}
            className="mt-5 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const levels = data?.levels ?? [];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">

          <div>
            <Link
              href="/committee"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft size={17} />
              Back to Committee
            </Link>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <BookOpen size={26} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {data?.courseName || 'Course'}
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Code: {data?.courseCode || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            className="self-start flex items-center gap-2 border bg-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw
              size={17}
              className={
                isFetching
                  ? 'animate-spin text-blue-600'
                  : ''
              }
            />
            Refresh
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid md:grid-cols-3 gap-4">

        <div className="bg-white border rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">
                Course
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {data?.courseName || '-'}
              </p>
            </div>

            <BookOpen
              className="text-blue-600"
              size={28}
            />
          </div>
        </div>

        <div className="bg-white border rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">
                Available Levels
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-1">
                {levels.length}
              </p>
            </div>

            <Users
              className="text-indigo-600"
              size={28}
            />
          </div>
        </div>

        <div className="bg-white border rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">
                Pending Marks
              </p>

              <p className="text-3xl font-bold text-blue-600 mt-1">
                {levels.reduce(
                  (sum, level) =>
                    sum + (level.totalMarks || 0),
                  0
                )}
              </p>
            </div>

            <FileCheck
              className="text-amber-600"
              size={28}
            />
          </div>
        </div>

      </div>

      {/* LEVELS */}
      {levels.length === 0 ? (
        <div className="bg-white border rounded-xl shadow-sm p-12 text-center">
          <BookOpen
            size={48}
            className="mx-auto text-gray-300 mb-4"
          />

          <h2 className="text-lg font-bold text-gray-700">
            No Levels Found
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            There are no active levels assigned to this course.
          </p>
        </div>
      ) : (
        <div className="space-y-4">

          {levels.map((level) => (
            <Link
              key={level.levelId}
              href={`/committee/review/${level.levelId}`}
              className="block"
            >
              <div className="bg-white border rounded-xl shadow-sm p-6 hover:border-blue-400 hover:shadow-md transition">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                  {/* LEVEL INFO */}
                  <div className="flex items-center gap-4">

                    <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                      L{level.levelNumber}
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Level {level.levelNumber}
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        {level.description || 'Academic Level'}
                      </p>
                    </div>

                  </div>

                  {/* STATISTICS */}
                  <div className="flex flex-wrap items-center gap-4">

                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        Students
                      </p>

                      <p className="font-bold text-gray-900">
                        {level.studentCount}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        Pending Marks
                      </p>

                      <p className="font-bold text-blue-600">
                        {level.totalMarks}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-blue-600 font-semibold text-sm">
                      Review
                      <ChevronRight size={18} />
                    </div>

                  </div>

                </div>

              </div>
            </Link>
          ))}

        </div>
      )}

    </div>
  );
}