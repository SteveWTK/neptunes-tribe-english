"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  GraduationCap,
  Plus,
  Users,
  Building2,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Copy,
  ExternalLink,
  MapPin,
  Calendar,
  BookOpen,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function SchoolsAdminPage() {
  const { data: session, status } = useSession();
  const [schools, setSchools] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedSchool, setExpandedSchool] = useState(null);
  const [schoolDetails, setSchoolDetails] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create form state
  const [formName, setFormName] = useState("");
  const [formGroupName, setFormGroupName] = useState("");
  const [formBranchName, setFormBranchName] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formState, setFormState] = useState("");
  const [formCountry, setFormCountry] = useState("Brazil");
  const [formContactName, setFormContactName] = useState("");
  const [formContactEmail, setFormContactEmail] = useState("");
  const [formTier, setFormTier] = useState("pilot");
  const [formAutoPremium, setFormAutoPremium] = useState(true);
  const [formPremiumDays, setFormPremiumDays] = useState(365);
  const [formWelcome, setFormWelcome] = useState("");
  const [formWelcomePt, setFormWelcomePt] = useState("");
  const [formWelcomeTh, setFormWelcomeTh] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetchSchools();
    }
  }, [status]);

  const fetchSchools = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/schools");
      const data = await res.json();
      if (res.ok) {
        setSchools(data.schools || []);
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.error("Error fetching schools:", err);
      toast.error("Failed to load schools");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const res = await fetch("/api/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          group_name: formGroupName || null,
          branch_name: formBranchName || null,
          city: formCity || null,
          state: formState || null,
          country: formCountry,
          contact_name: formContactName || null,
          contact_email: formContactEmail || null,
          partnership_tier: formTier,
          auto_premium: formAutoPremium,
          premium_duration_days: Number(formPremiumDays),
          welcome_message: formWelcome || null,
          welcome_message_pt: formWelcomePt || null,
          welcome_message_th: formWelcomeTh || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to create school");
        return;
      }

      toast.success(`School created: ${data.school.name}`);
      setShowCreateForm(false);
      resetForm();
      fetchSchools();
    } catch (err) {
      console.error("Error creating school:", err);
      toast.error("Failed to create school");
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormGroupName("");
    setFormBranchName("");
    setFormCity("");
    setFormState("");
    setFormCountry("Brazil");
    setFormContactName("");
    setFormContactEmail("");
    setFormTier("pilot");
    setFormAutoPremium(true);
    setFormPremiumDays(365);
    setFormWelcome("");
    setFormWelcomePt("");
    setFormWelcomeTh("");
  };

  const toggleActive = async (schoolId, currentActive) => {
    try {
      const res = await fetch(`/api/schools/${schoolId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentActive }),
      });

      if (res.ok) {
        toast.success(`School ${!currentActive ? "activated" : "deactivated"}`);
        fetchSchools();
      }
    } catch (err) {
      toast.error("Failed to update school");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const loadSchoolDetail = async (schoolId) => {
    if (expandedSchool === schoolId) {
      setExpandedSchool(null);
      return;
    }

    try {
      const res = await fetch(`/api/schools/${schoolId}`);
      const data = await res.json();
      if (res.ok) {
        setSchoolDetails((prev) => ({
          ...prev,
          [schoolId]: data,
        }));
      }
    } catch (err) {
      console.error("Error loading school detail:", err);
    }
    setExpandedSchool(schoolId);
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
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            You need platform admin access to view this page.
          </p>
        </div>
      </div>
    );
  }

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://habitatenglish.com";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-teal-600" />
            Partner Schools
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage B2B school partnerships, levels, and student enrollments
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New School
        </button>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Schools"
            value={summary.total_schools}
            icon={<Building2 className="w-5 h-5" />}
          />
          <StatCard
            label="Active Schools"
            value={summary.active_schools}
            icon={<CheckCircle className="w-5 h-5 text-green-500" />}
          />
          <StatCard
            label="Total Students"
            value={summary.total_students}
            icon={<Users className="w-5 h-5 text-blue-500" />}
          />
          <StatCard
            label="Pilot Programs"
            value={summary.by_tier?.pilot || 0}
            icon={<GraduationCap className="w-5 h-5 text-purple-500" />}
          />
        </div>
      )}

      {/* Create form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Create New School
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name (required) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  School Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Cultura Inglesa Teresina"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Group name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Organization/Group
                </label>
                <input
                  type="text"
                  value={formGroupName}
                  onChange={(e) => setFormGroupName(e.target.value)}
                  placeholder="e.g., Cultura Inglesa"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={formBranchName}
                  onChange={(e) => setFormBranchName(e.target.value)}
                  placeholder="e.g., Teresina"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  placeholder="e.g., Teresina"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  value={formState}
                  onChange={(e) => setFormState(e.target.value)}
                  placeholder="e.g., Piauí"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formCountry}
                  onChange={(e) => setFormCountry(e.target.value)}
                  placeholder="Brazil"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Contact name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={formContactName}
                  onChange={(e) => setFormContactName(e.target.value)}
                  placeholder="e.g., Director/Coordinator name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Contact email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formContactEmail}
                  onChange={(e) => setFormContactEmail(e.target.value)}
                  placeholder="e.g., coordinator@escola.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Partnership tier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Partnership Tier
                </label>
                <select
                  value={formTier}
                  onChange={(e) => setFormTier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="pilot">Pilot (Free Trial)</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              {/* Premium duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Premium Duration (days)
                </label>
                <input
                  type="number"
                  value={formPremiumDays}
                  onChange={(e) => setFormPremiumDays(e.target.value)}
                  min={1}
                  max={3650}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Auto-premium option */}
              <div className="md:col-span-2 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="autoPremium"
                    checked={formAutoPremium}
                    onChange={(e) => setFormAutoPremium(e.target.checked)}
                    className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="autoPremium"
                      className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                    >
                      Auto-grant Premium to Students
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Students who sign up with this school&apos;s code will
                      automatically receive premium access for the specified
                      duration.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Welcome messages */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Welcome Messages (optional, shown on signup)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    English
                  </label>
                  <textarea
                    value={formWelcome}
                    onChange={(e) => setFormWelcome(e.target.value)}
                    rows={2}
                    placeholder="Welcome to Habitat English!"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Portuguese
                  </label>
                  <textarea
                    value={formWelcomePt}
                    onChange={(e) => setFormWelcomePt(e.target.value)}
                    rows={2}
                    placeholder="Bem-vindo ao Habitat English!"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Thai
                  </label>
                  <textarea
                    value={formWelcomeTh}
                    onChange={(e) => setFormWelcomeTh(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !formName}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4" />
                    Create School
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schools list */}
      <div className="space-y-4">
        {schools.length === 0 && !isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No schools yet. Create your first partner school above.
            </p>
          </div>
        )}

        {schools.map((school) => {
          const signupUrl = `${baseUrl}/school/${school.slug}`;
          const isExpanded = expandedSchool === school.id;
          const details = schoolDetails[school.id];

          return (
            <div
              key={school.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* School header */}
              <div className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {school.name}
                      </h3>
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
                      {school.auto_premium && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
                          Auto-Premium
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {school.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {school.city}, {school.state || school.country}
                        </span>
                      )}
                      {school.group_name && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {school.group_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {school.student_count || 0} students
                      </span>
                    </div>

                    {/* Code + URL */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Code:</span>
                        <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-teal-700 dark:text-teal-300">
                          {school.code}
                        </code>
                        <button
                          onClick={() => copyToClipboard(school.code)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy code"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Signup:</span>
                        <button
                          onClick={() => copyToClipboard(signupUrl)}
                          className="flex items-center gap-1 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          /school/{school.slug}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          toggleActive(school.id, school.is_active)
                        }
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title={school.is_active ? "Deactivate" : "Activate"}
                      >
                        {school.is_active ? (
                          <ToggleRight className="w-6 h-6 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6" />
                        )}
                      </button>
                      <Link
                        href={`/admin/schools/${school.id}`}
                        className="px-3 py-1.5 text-sm bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/30 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded-lg font-medium transition-colors"
                      >
                        Manage
                      </Link>
                      <button
                        onClick={() => loadSchoolDetail(school.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && details && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Levels */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Levels ({details.levels?.length || 0})
                      </h4>
                      {details.levels?.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No levels configured yet.
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {details.levels?.map((level) => (
                            <div
                              key={level.id}
                              className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                            >
                              <span className="text-gray-700 dark:text-gray-300">
                                {level.name}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                  {level.habitat_level}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {level.student_count || 0} students
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Teachers */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Teachers ({details.teachers?.length || 0})
                      </h4>
                      {details.teachers?.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No teachers added yet.
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {details.teachers?.map((teacher) => (
                            <div
                              key={teacher.id}
                              className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                            >
                              <span className="text-gray-700 dark:text-gray-300">
                                {teacher.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {teacher.student_count || 0} students
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent students */}
                  {details.students?.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Recent Students ({details.stats?.total_students ||
                          0}{" "}
                        total)
                      </h4>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {details.students?.slice(0, 10).map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                          >
                            <div>
                              <span className="text-gray-700 dark:text-gray-300">
                                {student.full_name || student.email}
                              </span>
                              {student.full_name && (
                                <span className="text-xs text-gray-500 ml-2">
                                  {student.email}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {student.enrolled_at
                                ? new Date(
                                    student.enrolled_at
                                  ).toLocaleDateString()
                                : "Not enrolled"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
