"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface DepartmentOption {
  id: string;
  name: string;
  code?: string;
}

const LEVELS = ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"];

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [fetchingDepts, setFetchingDepts] = useState(true);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    department_id: "",
    requested_level: "",
  });

  const [files, setFiles] = useState({
    passport_photo: null as File | null,
    id_document: null as File | null,
    certificate_document: null as File | null,
    receipt_document: null as File | null,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://college-management-backend-ysny.onrender.com";

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setFetchingDepts(true);
        const res = await axios.get(`${API_URL}/api/v1/students/departments/public`);
        setDepartments(res.data);
      } catch (err) {
        console.error("Department fetch error:", err);
      } finally {
        setFetchingDepts(false);
      }
    };

    fetchDepartments();
  }, [API_URL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = e.target;
    setFiles({ ...files, [name]: selectedFiles?.[0] || null });
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      if (!form.department_id) throw new Error("Maaloo Department/Koorsii filadhu.");
      if (!form.requested_level) throw new Error("Maaloo Level filadhu.");

      const formData = new FormData();
      formData.append("full_name", form.full_name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("phone", form.phone);
      formData.append("department_id", form.department_id); // MongoDB ObjectId
      formData.append("requested_level", form.requested_level);

      if (files.passport_photo) formData.append("passport_photo", files.passport_photo);
      if (files.id_document) formData.append("id_document", files.id_document);
      if (files.certificate_document) formData.append("certificate_document", files.certificate_document);
      if (files.receipt_document) formData.append("receipt_document", files.receipt_document);

      await axios.post(`${API_URL}/api/v1/students/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("✅ Galmeen milkaa'inaan ergameera!");
      setIsError(false);

      setForm({ full_name: "", email: "", password: "", phone: "", department_id: "", requested_level: "" });
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || "Dogoggora uumame.";
      setMessage(`❌ ${errorMsg}`);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-10">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">🧑‍🎓 Galmee Barataa</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-lg">
        <input name="full_name" type="text" placeholder="Maqaa Guutuu" required value={form.full_name} onChange={handleChange} className="w-full border p-2 rounded text-black" />
        <input name="email" type="email" placeholder="Email" required value={form.email} onChange={handleChange} className="w-full border p-2 rounded text-black" />
        <input name="password" type="password" placeholder="Password" required value={form.password} onChange={handleChange} className="w-full border p-2 rounded text-black" />
        <input name="phone" type="tel" placeholder="Lakkoofsa Bilbilaa" required value={form.phone} onChange={handleChange} className="w-full border p-2 rounded text-black" />

        {/* Dynamic Department Dropdown DB Irraa */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Department / Koorsii Filadhu</label>
          <select 
            name="department_id" 
            value={form.department_id} 
            onChange={handleChange} 
            required 
            disabled={fetchingDepts}
            className="w-full border p-2 rounded bg-white text-black disabled:bg-gray-100"
          >
            <option value="">
              {fetchingDepts ? "-- DB irraa fe'aa jira... --" : "-- Department Filadhu --"}
            </option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name} {dept.code ? `(${dept.code})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Level Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Level Filadhu</label>
          <select name="requested_level" value={form.requested_level} onChange={handleChange} required className="w-full border p-2 rounded bg-white text-black">
            <option value="">-- Level Filadhu --</option>
            {LEVELS.map((lvl, idx) => (
              <option key={idx} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>

        {/* Files Upload */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-gray-500"> Photo 4*3</label>
          <input type="file" name="passport_photo" required accept="image/*" onChange={handleFile} className="w-full border p-1 text-sm text-black" />
          <label className="block text-xs font-semibold text-gray-500">ID Document</label>
          <input type="file" name="id_document" required accept="image/*,.pdf" onChange={handleFile} className="w-full border p-1 text-sm text-black" />
          <label className="block text-xs font-semibold text-gray-500">Certificate</label>
          <input type="file" name="certificate_document" required accept="image/*,.pdf" onChange={handleFile} className="w-full border p-1 text-sm text-black" />
          <label className="block text-xs font-semibold text-gray-500">Receipt Bankii</label>
          <input type="file" name="receipt_document" required accept="image/*,.pdf" onChange={handleFile} className="w-full border p-1 text-sm text-black" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Galmeessaa jira..." : "Galmee Ergi"}
        </button>

        {message && (
          <div className={`p-3 text-center text-sm rounded ${isError ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}