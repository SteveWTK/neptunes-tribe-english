"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  MessageSquare,
  Star,
  User,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Archive,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

/**
 * Admin Feedback Dashboard
 * View, filter, and analyze user feedback
 */
export default function AdminFeedbackPage() {
  const { data: session, status } = useSession();
  const [feedback, setFeedback] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterUserRole, setFilterUserRole] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    if (session?.user) {
      fetchFeedback();
    }
  }, [session, filterStatus, filterUserRole, filterType]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterUserRole !== "all") params.append("userRole", filterUserRole);
      if (filterType !== "all") params.append("feedbackType", filterType);

      const response = await fetch(`/api/feedback/admin?${params.toString()}`);

      if (response.status === 403) {
        toast.error("Admin access required");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch feedback");
      }

      const data = await response.json();
      setFeedback(data.feedback || []);
      setAnalytics(data.analytics || []);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const updateFeedbackStatus = async (feedbackId, newStatus, notes = null) => {
    try {
      const response = await fetch("/api/feedback/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackId,
          status: newStatus,
          adminNotes: notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update feedback");
      }

      toast.success("Feedback updated successfully");
      fetchFeedback();
    } catch (error) {
      console.error("Error updating feedback:", error);
      toast.error("Failed to update feedback");
    }
  };

  const exportToCSV = () => {
    const filteredFeedback = getFilteredFeedback();

    const headers = [
      "Date",
      "Type",
      "User Role",
      "Beta Tester",
      "Overall Rating",
      "Content Rating",
      "Ease of Use",
      "Learning",
      "Technical",
      "Quick Comment",
      "Enjoyed",
      "Improvements",
      "Features",
      "General",
      "Status",
      "Page",
    ];

    const rows = filteredFeedback.map((f) => [
      new Date(f.created_at).toLocaleDateString(),
      f.feedback_type,
      f.user_role,
      f.is_beta_tester ? "Yes" : "No",
      f.overall_rating || "",
      f.content_quality_rating || "",
      f.ease_of_use_rating || "",
      f.learning_effectiveness_rating || "",
      f.technical_performance_rating || "",
      f.quick_comment || "",
      f.what_enjoyed || "",
      f.what_improved || "",
      f.feature_requests || "",
      f.general_comments || "",
      f.status,
      f.current_page || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Feedback exported to CSV");
  };

  const getFilteredFeedback = () => {
    return feedback.filter((f) => {
      const matchesSearch =
        searchTerm === "" ||
        f.quick_comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.what_enjoyed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.what_improved?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.feature_requests?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.general_comments?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  };

  const calculateAverages = () => {
    const filteredFeedback = getFilteredFeedback();
    if (filteredFeedback.length === 0) return null;

    const ratings = {
      overall: [],
      content: [],
      easeOfUse: [],
      learning: [],
      technical: [],
    };

    filteredFeedback.forEach((f) => {
      if (f.overall_rating) ratings.overall.push(f.overall_rating);
      if (f.content_quality_rating)
        ratings.content.push(f.content_quality_rating);
      if (f.ease_of_use_rating) ratings.easeOfUse.push(f.ease_of_use_rating);
      if (f.learning_effectiveness_rating)
        ratings.learning.push(f.learning_effectiveness_rating);
      if (f.technical_performance_rating)
        ratings.technical.push(f.technical_performance_rating);
    });

    const avg = (arr) =>
      arr.length > 0
        ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)
        : "-";

    return {
      overall: avg(ratings.overall),
      content: avg(ratings.content),
      easeOfUse: avg(ratings.easeOfUse),
      learning: avg(ratings.learning),
      technical: avg(ratings.technical),
    };
  };

  const averages = calculateAverages();
  const filteredFeedback = getFilteredFeedback();

  const StatusBadge = ({ status }) => {
    const colors = {
      new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      reviewed:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      addressed:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      archived:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}
      >
        {status}
      </span>
    );
  };

  const UserRoleBadge = ({ role, isBetaTester }) => {
    if (isBetaTester) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
          Beta Tester
        </span>
      );
    }

    const colors = {
      premium:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      user: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          colors[role] || colors.user
        }`}
      >
        {role === "premium" ? "Premium" : "Free User"}
      </span>
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading feedback...
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please sign in to access the admin dashboard
          </p>
          <Link
            href="/api/auth/signin"
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Feedback Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and analyze user feedback to improve Habitat English
          </p>
        </div>

        {/* Analytics Cards */}
        {averages && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Overall
                </span>
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {averages.overall}
              </div>
              <div className="text-xs text-gray-500 mt-1">Average Rating</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Content
                </span>
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {averages.content}
              </div>
              <div className="text-xs text-gray-500 mt-1">Quality Rating</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Ease of Use
                </span>
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {averages.easeOfUse}
              </div>
              <div className="text-xs text-gray-500 mt-1">UX Rating</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Learning
                </span>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {averages.learning}
              </div>
              <div className="text-xs text-gray-500 mt-1">Effectiveness</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Technical
                </span>
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {averages.technical}
              </div>
              <div className="text-xs text-gray-500 mt-1">Performance</div>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search feedback..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="addressed">Addressed</option>
              <option value="archived">Archived</option>
            </select>

            {/* User Role Filter */}
            <select
              value={filterUserRole}
              onChange={(e) => setFilterUserRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Users</option>
              <option value="beta_tester">Beta Testers</option>
              <option value="premium">Premium Users</option>
              <option value="user">Free Users</option>
            </select>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredFeedback.length} of {feedback.length} feedback
              entries
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedback.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No feedback found matching your filters
              </p>
            </div>
          ) : (
            filteredFeedback.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <UserRoleBadge
                          role={item.user_role}
                          isBetaTester={item.is_beta_tester}
                        />
                        <StatusBadge status={item.status} />
                        <span className="text-xs text-gray-500">
                          {item.feedback_type === "quick"
                            ? "Quick"
                            : "Detailed"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                        {item.current_page && (
                          <span className="text-xs">
                            📍 {item.current_page}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ratings */}
                    <div className="flex flex-col items-end gap-1">
                      {item.overall_rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Overall:
                          </span>
                          <div className="flex">
                            {[...Array(item.overall_rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {item.content_quality_rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">
                            Content:
                          </span>
                          <div className="flex">
                            {[...Array(item.content_quality_rating)].map(
                              (_, i) => (
                                <Star
                                  key={i}
                                  className="w-3 h-3 fill-purple-400 text-purple-400"
                                />
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    {item.quick_comment && (
                      <div>
                        <p className="text-gray-800 dark:text-gray-200">
                          {item.quick_comment}
                        </p>
                      </div>
                    )}

                    {item.what_enjoyed && (
                      <div>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          Enjoyed:
                        </span>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">
                          {item.what_enjoyed}
                        </p>
                      </div>
                    )}

                    {item.what_improved && (
                      <div>
                        <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                          Improvements:
                        </span>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">
                          {item.what_improved}
                        </p>
                      </div>
                    )}

                    {item.feature_requests && (
                      <div>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          Feature Requests:
                        </span>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">
                          {item.feature_requests}
                        </p>
                      </div>
                    )}

                    {item.general_comments && (
                      <div>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          General:
                        </span>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">
                          {item.general_comments}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {item.status === "new" && (
                      <button
                        onClick={() =>
                          updateFeedbackStatus(item.id, "reviewed")
                        }
                        className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400 rounded text-sm font-medium transition-colors"
                      >
                        Mark Reviewed
                      </button>
                    )}
                    {item.status === "reviewed" && (
                      <button
                        onClick={() =>
                          updateFeedbackStatus(item.id, "addressed")
                        }
                        className="px-3 py-1 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-800 dark:text-green-400 rounded text-sm font-medium transition-colors"
                      >
                        Mark Addressed
                      </button>
                    )}
                    {item.status !== "archived" && (
                      <button
                        onClick={() =>
                          updateFeedbackStatus(item.id, "archived")
                        }
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm font-medium transition-colors"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
