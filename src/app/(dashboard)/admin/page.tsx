"use client";

import React, { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { api } from "@/lib";

/* =========================================================
   TYPES & CONSTANTS
========================================================= */
type Department = {
  _id: string;
  name: string;
};

type DashboardStats = {
  pendingStudents: number;
  approvedStudents: number;
  departments: number;
  courses: number;
};

type StudentDocument = {
  passport_photo?: string;
  id_document?: string;
  grade12_result?: string;
  bank_receipt?: string;
};

type PendingStudent = {
  _id: string;
  id?: string;
  fullName?: string;
  full_name?: string;
  name?: string;
  email: string;
  phone?: string;
  department?: string | { name?: string };
  departmentId?: string;
  dept_id?: string;
  level?: string | number | { levelNumber?: number };
  levelId?: string;
  requestedLevelNumber?: number | string;
  currentLevelId?: string;
  photo_url?: string;
  photo?: string;
  documents?: StudentDocument;
};

type ApprovedStudent = {
  _id: string;
  studentId: string;
  fullName: string;
  email: string;
  department?: string;
  departmentName?: string;
  level?: string;
  levelNumber?: string | number;
  approvedAt?: string;
};

type AuditLog = {
  _id: string;
  action: string;
  entityType: string;
  entityId?: string;
  timestamp: string;
};

type Message = {
  type: "" | "success" | "error";
  text: string;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "deptHead" | "history">("dashboard");
  const [stats, setStats] = useState<DashboardStats>({
    pendingStudents: 0,
    approvedStudents: 0,
    departments: 0,
    courses: 0,
  });

  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<PendingStudent | null>(null);
  const [approvedStudents, setApprovedStudents] = useState<ApprovedStudent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [deptHeadForm, setDeptHeadForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    courseId: "",
  });

  const [message, setMessage] = useState<Message>({ type: "", text: "" });

  /* =========================================================
     API CALLS
  ========================================================= */
  const fetchDepartments = async () => {
    try {
      const res = await api.get<Department[]>("/admin/departments");
      setDepartmentsList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Departments fetch error:", err);
      setDepartmentsList([]);
    }
  };

  const fetchPendingStudents = async () => {
    try {
      const res = await api.get("/admin/students/pending");
      const data = Array.isArray(res.data) ? res.data : res.data?.students || [];
      setPendingStudents(data);
    } catch (err) {
      console.error("Pending students fetch error:", err);
      setPendingStudents([]);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get<DashboardStats>("/admin/dashboard");
      setStats({
        pendingStudents: res.data.pendingStudents ?? 0,
        approvedStudents: res.data.approvedStudents ?? 0,
        departments: res.data.departments ?? 0,
        courses: res.data.courses ?? 0,
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
    }
  };

  const fetchApprovedStudents = async () => {
    try {
      const res = await api.get("/admin/students/approved");
      const data = Array.isArray(res.data) ? res.data : res.data?.students || [];
      setApprovedStudents(data);
    } catch (error) {
      console.error("Fetch error:", error);
      setApprovedStudents([]);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get<AuditLog[]>("/admin/history");
      const rawData = Array.isArray(res.data) ? res.data : [];
      setAuditLogs(rawData);
    } catch (error) {
      console.error("Audit logs error:", error);
      setAuditLogs([]);
    }
  };

  useEffect(() => {
    fetchPendingStudents();
    fetchDashboardStats();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      fetchApprovedStudents();
      fetchAuditLogs();
    }
  }, [activeTab]);

  /* =========================================================
     SAFE FIELD EXTRACTORS
  ========================================================= */
  const getStudentName = (student: PendingStudent) => {
    return student.fullName || student.full_name || student.name || "N/A";
  };

  const getDepartmentName = (student: PendingStudent) => {
    if (typeof student.department === "string" && student.department !== "N/A" && student.department.trim() !== "") {
      return student.department;
    }
    if (typeof student.department === "object" && student.department?.name) {
      return student.department.name;
    }
    const dId = student.departmentId || student.dept_id;
    if (dId) {
      const found = departmentsList.find((d) => d._id === dId);
      if (found) return found.name;
    }
    return "Not Assigned";
  };

  const getLevelName = (student: PendingStudent) => {
    if (typeof student.level === "string" && student.level !== "N/A" && student.level.trim() !== "") {
      return student.level;
    }
    if (typeof student.level === "number") {
      return `Level ${student.level}`;
    }
    if (typeof student.level === "object" && student.level?.levelNumber) {
      return `Level ${student.level.levelNumber}`;
    }
    if (student.requestedLevelNumber) {
      return `Level ${student.requestedLevelNumber}`;
    }
    return "Not Assigned";
  };
  

  const getPhotoUrl = (student: PendingStudent) => {
    return student.photo_url || student.photo || student.documents?.passport_photo || "";
  };

  /* =========================================================
     HANDLERS
  ========================================================= */
  const handleStatusUpdate = async (student: PendingStudent, action: "approve" | "reject") => {
    try {
      const studentId = student._id || student.id;
      const payload = {
        departmentId: student.departmentId || student.dept_id || (departmentsList[0]?._id ?? "650000000000000000000001"),
        levelId: student.levelId || student.currentLevelId || "65000000000000000000000a",
        action: action,
        rejectionReason: action === "reject" ? "Rejected by Admin" : null,
      };

      await api.patch(`/admin/students/${studentId}`, payload);
      setPendingStudents((prev) => prev.filter((s) => (s._id || s.id) !== studentId));
      if (selectedStudent?._id === studentId || selectedStudent?.id === studentId) {
        setSelectedStudent(null);
      }
      fetchDashboardStats();
      setMessage({ type: "success", text: `Student ${action}d successfully!` });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Status update process failed!" });
    }
  };

  const handleCreateDeptHead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/admin/department-heads", deptHeadForm);
      setMessage({
        type: "success",
        text: response.data?.message || "Department Head account created successfully.",
      });
      setDeptHeadForm({ fullName: "", email: "", username: "", password: "", courseId: "" });
      fetchDashboardStats();
    } catch (err) {
      const error = err as AxiosError<{ detail?: string; message?: string }>;
      setMessage({
        type: "error",
        text: error.response?.data?.detail || error.response?.data?.message || "Error creating Department Head.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">College Academic Management System</p>
        </div>

        {message.text && (
          <div
            className={`p-3 rounded mb-4 text-sm font-semibold ${
              message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* PENDING STUDENTS TABLE */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Pending Student Approvals</h2>
          <div className="bg-white rounded-lg border overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b text-xs text-gray-600 uppercase">
                  <th className="p-3">Photo</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Level</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Docs</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y">
                {pendingStudents.length > 0 ? (
                  pendingStudents.map((student) => (
                    <tr key={student._id || student.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        {getPhotoUrl(student) ? (
                          <img
                            src={getPhotoUrl(student)}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 text-xs flex items-center justify-center text-gray-500">
                            No Photo
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-semibold">{getStudentName(student)}</td>
                      <td className="p-3 text-gray-600">{student.email}</td>
                      <td className="p-3 font-medium text-blue-700">{getLevelName(student)}</td>
                      <td className="p-3 font-medium text-purple-700">{getDepartmentName(student)}</td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="text-blue-600 hover:underline font-semibold text-xs"
                        >
                          View Docs
                        </button>
                      </td>
                      <td className="p-3 space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(student, "approve")}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(student, "reject")}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-500">
                      No pending approvals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABS HEADER */}
        <div className="flex flex-wrap border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`py-3 px-6 font-semibold border-b-2 ${
              activeTab === "dashboard"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("deptHead")}
            className={`py-3 px-6 font-semibold border-b-2 ${
              activeTab === "deptHead"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Department Head
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 px-6 font-semibold border-b-2 ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            History
          </button>
        </div>

        {/* TAB 1: DASHBOARD STATS */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">Pending Students</p>
              <p className="text-2xl font-bold text-blue-900">{stats.pendingStudents}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-medium">Approved Students</p>
              <p className="text-2xl font-bold text-green-900">{stats.approvedStudents}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-600 font-medium">Departments</p>
              <p className="text-2xl font-bold text-purple-900">{stats.departments}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-600 font-medium">Courses</p>
              <p className="text-2xl font-bold text-orange-900">{stats.courses}</p>
            </div>
          </div>
        )}

        {/* TAB 2: DEPARTMENT HEAD FORM */}
        {activeTab === "deptHead" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-xl">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Create Department Head Account</h2>
            <form onSubmit={handleCreateDeptHead} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Assign Course / Department</label>
                <select
                  value={deptHeadForm.courseId}
                  onChange={(e) => setDeptHeadForm({ ...deptHeadForm, courseId: e.target.value })}
                  required
                  className="w-full border p-2 rounded-md bg-gray-50 focus:bg-white text-black"
                >
                  <option value="">-- Select Course / Department --</option>
                  {departmentsList.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Alemu Abebe"
                  value={deptHeadForm.fullName}
                  onChange={(e) => setDeptHeadForm({ ...deptHeadForm, fullName: e.target.value })}
                  required
                  className="w-full border p-2 rounded-md text-black"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="alemu@college.edu.et"
                  value={deptHeadForm.email}
                  onChange={(e) => setDeptHeadForm({ ...deptHeadForm, email: e.target.value })}
                  required
                  className="w-full border p-2 rounded-md text-black"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  placeholder="alemu123"
                  value={deptHeadForm.username}
                  onChange={(e) => setDeptHeadForm({ ...deptHeadForm, username: e.target.value })}
                  required
                  className="w-full border p-2 rounded-md text-black"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={deptHeadForm.password}
                  onChange={(e) => setDeptHeadForm({ ...deptHeadForm, password: e.target.value })}
                  required
                  className="w-full border p-2 rounded-md text-black"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
              >
                Create Account
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold mb-3">Approved Students</h2>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-100 uppercase font-medium">
                    <tr>
                      <th className="p-3">Generated ID</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Level</th>
                      <th className="p-3">Approved At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {approvedStudents.length > 0 ? (
                      approvedStudents.map((student) => (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="p-3 font-mono font-bold text-blue-600">{student.studentId}</td>
                          <td className="p-3 font-semibold text-gray-800">{student.fullName}</td>
                          <td className="p-3">{student.email}</td>
                          <td className="p-3">{student.department || student.departmentName || "N/A"}</td>
                          <td className="p-3">{student.level || student.levelNumber || "N/A"}</td>
                          <td className="p-3">
                            {student.approvedAt && student.approvedAt !== "N/A"
                              ? new Date(student.approvedAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-gray-500">
                          No approved students found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-3">System Audit Logs</h2>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-100 uppercase font-medium">
                    <tr>
                      <th className="p-3">Action</th>
                      <th className="p-3">Entity Type</th>
                      <th className="p-3">Entity ID</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {auditLogs.length > 0 ? (
                      auditLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-gray-50">
                          <td className="p-3 font-semibold text-gray-800">{log.action}</td>
                          <td className="p-3 uppercase text-xs font-bold text-blue-600">{log.entityType}</td>
                          <td className="p-3 text-xs font-mono">{log.entityId || "N/A"}</td>
                          <td className="p-3">{log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-gray-500">
                          No history logs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL POPUP FOR VIEW DOCUMENTS */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl font-bold"
              >
                ✕
              </button>
              <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-800">
                Uploaded Documents: {getStudentName(selectedStudent)}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                <div className="border p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Passport Photo</p>
                  {selectedStudent.documents?.passport_photo ? (
                    <a
                      href={selectedStudent.documents.passport_photo}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline text-xs font-bold block"
                    >
                      📄 View / 4* 3 Photo
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">Not Uploaded</span>
                  )}
                </div>

                <div className="border p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 mb-1">ID Document</p>
                  {selectedStudent.documents?.id_document ? (
                    <a
                      href={selectedStudent.documents.id_document}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline text-xs font-bold block"
                    >
                      📄 View / Open ID Document
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">Not Uploaded</span>
                  )}
                </div>

                <div className="border p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Grade 12 Result / Certificate</p>
                  {selectedStudent.documents?.grade12_result ? (
                    <a
                      href={selectedStudent.documents.grade12_result}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline text-xs font-bold block"
                    >
                      📄 View / Open Certificate
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">Not Uploaded</span>
                  )}
                </div>

                <div className="border p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Bank Receipt</p>
                  {selectedStudent.documents?.bank_receipt ? (
                    <a
                      href={selectedStudent.documents.bank_receipt}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline text-xs font-bold block"
                    >
                      📄 View / Open Bank Receipt
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">Not Uploaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}