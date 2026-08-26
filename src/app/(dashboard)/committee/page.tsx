'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, BookOpen, FileCheck } from 'lucide-react';
import { api } from '@/lib';

interface CommitteeCourse {
  _id?: string;
  courseId?: string;
  id?: string;
  courseName: string;
  courseCode: string;
  departmentId: string;
  pendingMarks: number;
}

function CourseCard({ course }: { course: CommitteeCourse }) {
  const validId = course.courseId || course._id || course.id;

  return (
    <Link href={`/committee/course/${validId}`} className="block">
      <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-400 transition cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-lg bg-blue-50 text-blue-600 p-3">
            <BookOpen size={24} />
          </div>

          {course.pendingMarks > 0 && (
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
              Pending
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-900 mt-5">
          {course.courseName}
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Code: {course.courseCode || 'N/A'}
        </p>

        <div className="border-t mt-5 pt-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileCheck size={17} />
            <span>Pending Marks</span>
          </div>

          <strong className="text-blue-600">{course.pendingMarks}</strong>
        </div>

        <div className="mt-5 text-blue-600 font-semibold text-sm flex items-center gap-1">
          <span>View Levels</span>
          <span>→</span>
        </div>
      </div>
    </Link>
  );
}

export default function CommitteeDashboardPage() {
  const {
    data: courses = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<CommitteeCourse[]>({
    queryKey: ['committee-courses'],
    queryFn: async () => {
      const res = await api.get('/committee/courses');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-600 font-medium gap-2">
        <RefreshCw className="animate-spin text-blue-600" size={20} />
        Loading committee courses...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 font-medium text-center">
        Failed to load committee courses. Please check your network connection.
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Committee Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Select a course to review its academic levels, student results, and finalize records.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 border bg-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition shadow-sm"
        >
          <RefreshCw size={18} className={isFetching ? 'animate-spin text-blue-600' : ''} />
          Refresh Data
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Available Courses</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{courses.length}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <BookOpen size={28} />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Pending Marks</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {courses.reduce((sum, course) => sum + (course.pendingMarks || 0), 0)}
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <FileCheck size={28} />
          </div>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center text-gray-500 shadow-sm">
          <BookOpen size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-lg">No Courses Available</p>
          <p className="text-sm text-gray-400 mt-1">
            There are currently no active courses assigned for committee review.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, idx) => (
            <CourseCard key={course.courseId || course._id || course.id || idx} course={course} />
          ))}
        </div>
      )}
    </div>
  )}