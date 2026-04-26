"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  ArrowLeft,
  Plus,
  Loader2,
  XCircle,
  Save,
  Trash2,
  BookOpen,
  UserCheck,
  Users,
  Copy,
  ExternalLink,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function SchoolDetailPage({ params }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [school, setSchool] = useState(null);
  const [levels, setLevels] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Edit mode for school info
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Add level form
  const [showLevelForm, setShowLevelForm] = useState(false);
  const [levelName, setLevelName] = useState("");
  const [levelHabitat, setLevelHabitat] = useState("Level 1");
  const [levelOrder, setLevelOrder] = useState(0);
  const [isAddingLevel, setIsAddingLevel] = useState(false);

  // Add teacher form
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && id) {
      fetchSchool();
    }
  }, [status, id]);

  const fetchSchool = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/schools/${id}`);
      const data = await res.json();

      if (res.ok) {
        setSchool(data.school);
        setLevels(data.levels || []);
        setTeachers(data.teachers || []);
        setStudents(data.students || []);
        setEditForm(data.school);
      } else {
        toast.error(data.error || "School not found");
        router.push("/admin/schools");
      }
    } catch (err) {
      console.error("Error fetching school:", err);
      toast.error("Failed to load school");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSchool = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/schools/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const data = await res.json();
        setSchool(data.school);
        setIsEditing(false);
        toast.success("School updated");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update school");
      }
    } catch (err) {
      toast.error("Failed to update school");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLevel = async (e) => {
    e.preventDefault();
    setIsAddingLevel(true);

    try {
      const res = await fetch(`/api/schools/${id}/levels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: levelName,
          habitat_level: levelHabitat,
          display_order: Number(levelOrder),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setLevels([...levels, data.level]);
        setShowLevelForm(false);
        setLevelName("");
        setLevelHabitat("Level 1");
        setLevelOrder(0);
        toast.success("Level added");
      } else {
        toast.error(data.error || "Failed to add level");
      }
    } catch (err) {
      toast.error("Failed to add level");
    } finally {
      setIsAddingLevel(false);
    }
  };

  const handleDeleteLevel = async (levelId) => {
    if (!confirm("Are you sure you want to remove this level?")) return;

    try {
      const res = await fetch(`/api/schools/${id}/levels/${levelId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setLevels(levels.filter((l) => l.id !== levelId));
        toast.success("Level removed");
      }
    } catch (err) {
      toast.error("Failed to remove level");
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setIsAddingTeacher(true);

    try {
      const res = await fetch(`/api/schools/${id}/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teacherName,
          email: teacherEmail || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setTeachers([...teachers, data.teacher]);
        setShowTeacherForm(false);
        setTeacherName("");
        setTeacherEmail("");
        toast.success("Teacher added");
      } else {
        toast.error(data.error || "Failed to add teacher");
      }
    } catch (err) {
      toast.error("Failed to add teacher");
    } finally {
      setIsAddingTeacher(false);
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (!confirm("Are you sure you want to remove this teacher?")) return;

    try {
      const res = await fetch(`/api/schools/${id}/teachers/${teacherId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTeachers(teachers.filter((t) => t.id !== teacherId));
        toast.success("Teacher removed");
      }
    } catch (err) {
      toast.error("Failed to remove teacher");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Loading
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // Admin guard
  if (!session?.user || session.user.role !== "platform_admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Admin Access Required
          </h1>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            School not found
          </h1>
        </div>
      </div>
    );
  }

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://habitatenglish.com";
  const signupUrl = `${baseUrl}/school/${school.slug}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/schools"
          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Schools
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-teal-600" />
              {school.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  school.is_active
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {school.is_active ? "Active" : "Inactive"}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-medium capitalize">
                {school.partnership_tier}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            {isEditing ? "Cancel Edit" : "Edit School"}
          </button>
        </div>
      </div>

      {/* School Info / Edit Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          School Information
        </h2>

        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={editForm.name || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                value={editForm.contact_name || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, contact_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={editForm.contact_email || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, contact_email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Partnership Tier
              </label>
              <select
                value={editForm.partnership_tier || "pilot"}
                onChange={(e) =>
                  setEditForm({ ...editForm, partnership_tier: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="pilot">Pilot</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editAutoPremium"
                checked={editForm.auto_premium ?? true}
                onChange={(e) =>
                  setEditForm({ ...editForm, auto_premium: e.target.checked })
                }
                className="w-4 h-4 text-teal-600 border-gray-300 rounded"
              />
              <label
                htmlFor="editAutoPremium"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Auto-grant Premium to students
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Premium Duration (days)
              </label>
              <input
                type="number"
                value={editForm.premium_duration_days || 365}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    premium_duration_days: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditForm(school);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchool}
                disabled={isSaving}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  School Code
                </span>
                <div className="flex items-center gap-2">
                  <code className="text-lg font-mono text-teal-700 dark:text-teal-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {school.code}
                  </code>
                  <button
                    onClick={() => copyToClipboard(school.code)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Signup URL
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={signupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center gap-1"
                  >
                    {signupUrl}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => copyToClipboard(signupUrl)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            {school.contact_name && (
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Contact
                </span>
                <p className="text-gray-900 dark:text-white">
                  {school.contact_name}
                  {school.contact_email && (
                    <span className="text-gray-500 ml-2">
                      ({school.contact_email})
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Two column layout for levels and teachers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Levels */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Course Levels ({levels.length})
            </h2>
            <button
              onClick={() => setShowLevelForm(!showLevelForm)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Level
            </button>
          </div>

          {showLevelForm && (
            <form
              onSubmit={handleAddLevel}
              className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
            >
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  value={levelName}
                  onChange={(e) => setLevelName(e.target.value)}
                  placeholder="Level name (e.g., Portal 1, Headway Beginner)"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <div className="flex gap-2">
                  <select
                    value={levelHabitat}
                    onChange={(e) => setLevelHabitat(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="Level 1">Level 1 (Beginner)</option>
                    <option value="Level 2">Level 2 (Intermediate)</option>
                    <option value="Level 3">Level 3 (Advanced)</option>
                  </select>
                  <input
                    type="number"
                    value={levelOrder}
                    onChange={(e) => setLevelOrder(e.target.value)}
                    placeholder="Order"
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLevelForm(false)}
                    className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingLevel || !levelName}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                  >
                    {isAddingLevel ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    Add
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {levels.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No levels added yet. Add the school&apos;s course levels above.
              </p>
            ) : (
              levels
                .sort((a, b) => a.display_order - b.display_order)
                .map((level) => (
                  <div
                    key={level.id}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-lg px-3 py-2"
                  >
                    <div>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {level.name}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ml-2">
                        {level.habitat_level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {level.student_count || 0} students
                      </span>
                      <button
                        onClick={() => handleDeleteLevel(level.id)}
                        className="text-red-400 hover:text-red-600"
                        title="Remove level"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Teachers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-500" />
              Teachers ({teachers.length})
            </h2>
            <button
              onClick={() => setShowTeacherForm(!showTeacherForm)}
              className="px-3 py-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Teacher
            </button>
          </div>

          {showTeacherForm && (
            <form
              onSubmit={handleAddTeacher}
              className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
            >
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Teacher name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTeacherForm(false)}
                    className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingTeacher || !teacherName}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                  >
                    {isAddingTeacher ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    Add
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {teachers.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No teachers added yet. Add teachers above.
              </p>
            ) : (
              teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-lg px-3 py-2"
                >
                  <div>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {teacher.name}
                    </span>
                    {teacher.email && (
                      <span className="text-xs text-gray-500 ml-2">
                        {teacher.email}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {teacher.student_count || 0} students
                    </span>
                    <button
                      onClick={() => handleDeleteTeacher(teacher.id)}
                      className="text-red-400 hover:text-red-600"
                      title="Remove teacher"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Students list */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-purple-500" />
          Enrolled Students ({students.length})
        </h2>

        {students.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            No students enrolled yet. Share the signup URL with students to
            begin enrollment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                    Name
                  </th>
                  <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                    Email
                  </th>
                  <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                    Level
                  </th>
                  <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                    Enrolled
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const level = levels.find(
                    (l) => l.id === student.school_level_id
                  );
                  return (
                    <tr
                      key={student.id}
                      className="border-b border-gray-100 dark:border-gray-700/50"
                    >
                      <td className="py-2 px-2 text-gray-900 dark:text-white">
                        {student.full_name || "-"}
                      </td>
                      <td className="py-2 px-2 text-gray-600 dark:text-gray-400">
                        {student.email}
                      </td>
                      <td className="py-2 px-2">
                        {level ? (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {level.name}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-gray-500 text-xs">
                        {student.enrolled_at
                          ? new Date(student.enrolled_at).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
