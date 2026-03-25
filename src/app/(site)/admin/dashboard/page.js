"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { subDays } from "date-fns";
import {
  Users,
  BookOpen,
  Crown,
  TrendingUp,
  UserPlus,
  Smartphone,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import ProtectedRoute from "@/components/ProtectedRoute";
import MetricCard from "./components/MetricCard";
import DateRangePicker from "./components/DateRangePicker";
import FilterBar from "./components/FilterBar";
import DataTable from "./components/DataTable";
import ExportButton from "./components/ExportButton";

// Chart colors
const COLORS = {
  primary: "#3B82F6",
  secondary: "#10B981",
  tertiary: "#F59E0B",
  quaternary: "#EF4444",
  gray: "#6B7280",
};

const PIE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

function DashboardContent() {
  const router = useRouter();

  // Date range state
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [compareMode, setCompareMode] = useState("previous_period");
  const [customCompareRange, setCustomCompareRange] = useState({
    start: subDays(new Date(), 60),
    end: subDays(new Date(), 31),
  });

  // Filter state
  const [filters, setFilters] = useState({
    userType: null,
    worldId: null,
    adventureId: null,
    campaignId: null,
    deviceType: null,
    conversionStatus: null,
    upgradeSource: null,
  });

  // Data state
  const [metrics, setMetrics] = useState(null);
  const [usersData, setUsersData] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [guestsData, setGuestsData] = useState(null);
  const [premiumData, setPremiumData] = useState(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString(),
      compareMode,
    });

    // Add custom comparison dates if using custom compare mode
    if (compareMode === "custom" && customCompareRange.start && customCompareRange.end) {
      params.append("compareStartDate", customCompareRange.start.toISOString());
      params.append("compareEndDate", customCompareRange.end.toISOString());
    }

    // Add filters to params
    if (filters.userType) params.append("userType", filters.userType);
    if (filters.worldId) params.append("worldId", filters.worldId);
    if (filters.adventureId) params.append("adventureId", filters.adventureId);
    if (filters.campaignId) params.append("campaignId", filters.campaignId);
    if (filters.deviceType) params.append("deviceType", filters.deviceType);
    if (filters.conversionStatus) params.append("conversionStatus", filters.conversionStatus);
    if (filters.upgradeSource) params.append("source", filters.upgradeSource);

    try {
      const [metricsRes, usersRes, contentRes, guestsRes, premiumRes] = await Promise.all([
        fetch(`/api/admin/dashboard/metrics?${params}`),
        fetch(`/api/admin/dashboard/users?${params}`),
        fetch(`/api/admin/dashboard/content?${params}`),
        fetch(`/api/admin/dashboard/guests?${params}`),
        fetch(`/api/admin/dashboard/premium?${params}`),
      ]);

      if (!metricsRes.ok || !usersRes.ok || !contentRes.ok || !guestsRes.ok) {
        const errorRes = !metricsRes.ok ? metricsRes : !usersRes.ok ? usersRes : !contentRes.ok ? contentRes : guestsRes;
        if (errorRes.status === 403) {
          router.push("/");
          return;
        }
        throw new Error("Failed to fetch dashboard data");
      }

      const [metricsJson, usersJson, contentJson, guestsJson, premiumJson] = await Promise.all([
        metricsRes.json(),
        usersRes.json(),
        contentRes.json(),
        guestsRes.json(),
        premiumRes.ok ? premiumRes.json() : null,
      ]);

      setMetrics(metricsJson);
      setUsersData(usersJson);
      setContentData(contentJson);
      setGuestsData(guestsJson);
      setPremiumData(premiumJson);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dateRange, compareMode, customCompareRange, filters, router]);

  // Initial fetch and polling
  useEffect(() => {
    fetchData();

    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Reset filters
  const resetFilters = () => {
    setFilters({
      userType: null,
      worldId: null,
      adventureId: null,
      campaignId: null,
      deviceType: null,
      conversionStatus: null,
      upgradeSource: null,
    });
  };

  // Build filter options
  const filterOptions = {
    userTypes: [
      { value: "guest", label: "Guests" },
      { value: "registered", label: "Registered" },
      { value: "premium", label: "Premium" },
    ],
    worlds: contentData?.filterOptions?.worlds || [],
    adventures: contentData?.filterOptions?.adventures || [],
    campaigns: guestsData?.filterOptions?.campaigns || [],
    devices: guestsData?.filterOptions?.devices || [],
    conversionStatus: guestsData?.filterOptions?.conversionStatus || [],
    upgradeSources: premiumData?.filterOptions?.sources || [],
  };

  // User table columns
  const userColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "type", label: "Type" },
    { key: "lessonsCompleted", label: "Lessons" },
    { key: "createdAt", label: "Joined", type: "date" },
  ];

  // Guest session columns
  const guestColumns = [
    { key: "campaign", label: "Campaign" },
    { key: "location", label: "Location" },
    { key: "device", label: "Device" },
    { key: "browser", label: "Browser" },
    { key: "converted", label: "Converted", format: (v) => (v ? "Yes" : "No") },
    { key: "startedAt", label: "Started", type: "date" },
  ];

  // Lesson table columns
  const lessonColumns = [
    { key: "title", label: "Lesson" },
    { key: "world", label: "World" },
    { key: "adventure", label: "Adventure" },
    { key: "completions", label: "Completions" },
    { key: "isPremium", label: "Premium", format: (v) => (v ? "Yes" : "No") },
  ];

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary-600" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track user engagement, content performance, and conversions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DateRangePicker
              dateRange={dateRange}
              onChange={setDateRange}
              compareMode={compareMode}
              onCompareModeChange={setCompareMode}
              customCompareRange={customCompareRange}
              onCustomCompareRangeChange={setCustomCompareRange}
            />
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Last updated */}
        {lastUpdated && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {["overview", "users", "content", "guests", "premium"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary-600 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && metrics && (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard
                label={metrics.metrics.totalUsers.label}
                value={metrics.metrics.totalUsers.value}
                icon={Users}
                color="blue"
              />
              <MetricCard
                label={metrics.metrics.newUsers.label}
                value={metrics.metrics.newUsers.value}
                change={metrics.metrics.newUsers.change}
                icon={UserPlus}
                color="green"
              />
              <MetricCard
                label={metrics.metrics.premiumUsers.label}
                value={metrics.metrics.premiumUsers.value}
                icon={Crown}
                color="amber"
              />
              <MetricCard
                label={metrics.metrics.lessonCompletions.label}
                value={metrics.metrics.lessonCompletions.value}
                change={metrics.metrics.lessonCompletions.change}
                icon={BookOpen}
                color="purple"
              />
            </div>

            {/* Second row of metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard
                label={metrics.metrics.guestSessions.label}
                value={metrics.metrics.guestSessions.value}
                change={metrics.metrics.guestSessions.change}
                icon={Smartphone}
                color="cyan"
              />
              <MetricCard
                label={metrics.metrics.guestConversions.label}
                value={metrics.metrics.guestConversions.value}
                change={metrics.metrics.guestConversions.change}
                icon={TrendingUp}
                color="emerald"
              />
              <MetricCard
                label={metrics.metrics.conversionRate.label}
                value={metrics.metrics.conversionRate.value}
                change={metrics.metrics.conversionRate.change}
                suffix={metrics.metrics.conversionRate.suffix}
                icon={TrendingUp}
                color="orange"
              />
              <MetricCard
                label={metrics.metrics.activeJourneys.label}
                value={metrics.metrics.activeJourneys.value}
                icon={Users}
                color="violet"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* User Growth Chart */}
              {usersData?.dailySignups && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    User Growth
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={usersData.dailySignups}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "#9CA3AF", fontSize: 12 }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#9CA3AF", fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "none",
                          borderRadius: "8px",
                          color: "#F9FAFB",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke={COLORS.primary}
                        strokeWidth={2}
                        dot={false}
                        name="New Users"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* User Type Distribution */}
              {usersData?.breakdown && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    User Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Guest", value: usersData.breakdown.guest },
                          { name: "Registered", value: usersData.breakdown.registered },
                          { name: "Premium", value: usersData.breakdown.premium },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {[0, 1, 2].map((index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Top Lessons */}
            {contentData?.topLessons && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Lessons by Completions
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={contentData.topLessons.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="title"
                      width={200}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                        color: "#F9FAFB",
                      }}
                    />
                    <Bar dataKey="completions" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* Users Tab */}
        {activeTab === "users" && usersData && (
          <>
            <FilterBar
              filters={filters}
              onChange={setFilters}
              options={{ userTypes: filterOptions.userTypes }}
              onReset={resetFilters}
            />

            <div className="mt-6 flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Users ({usersData.totalInPeriod} in period)
              </h3>
              <ExportButton
                data={usersData.users}
                columns={userColumns}
                filename="users_export"
              />
            </div>

            <DataTable
              columns={userColumns}
              data={usersData.users}
              pageSize={15}
            />
          </>
        )}

        {/* Content Tab */}
        {activeTab === "content" && contentData && (
          <>
            <FilterBar
              filters={filters}
              onChange={setFilters}
              options={{
                worlds: filterOptions.worlds,
                adventures: filterOptions.adventures,
              }}
              onReset={resetFilters}
            />

            {/* Content Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-8">
              <MetricCard
                label="Total Lessons"
                value={contentData.overview.totalLessons}
                icon={BookOpen}
              />
              <MetricCard
                label="Active Lessons"
                value={contentData.overview.activeLessons}
                icon={BookOpen}
              />
              <MetricCard
                label="Completions"
                value={contentData.overview.completionsInPeriod}
                icon={TrendingUp}
              />
              <MetricCard
                label="Total XP Earned"
                value={contentData.overview.totalXPEarned}
                icon={Crown}
              />
            </div>

            {/* Daily Completions Chart */}
            {contentData.dailyCompletions && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Daily Lesson Completions
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={contentData.dailyCompletions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                        color: "#F9FAFB",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="completions"
                      stroke={COLORS.secondary}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Lesson Performance
              </h3>
              <ExportButton
                data={contentData.topLessons}
                columns={lessonColumns}
                filename="lessons_export"
              />
            </div>

            <DataTable
              columns={lessonColumns}
              data={contentData.topLessons}
              pageSize={15}
            />
          </>
        )}

        {/* Guests Tab */}
        {activeTab === "guests" && guestsData && (
          <>
            <FilterBar
              filters={filters}
              onChange={setFilters}
              options={{
                campaigns: filterOptions.campaigns,
                devices: filterOptions.devices,
                conversionStatus: filterOptions.conversionStatus,
              }}
              onReset={resetFilters}
            />

            {/* Guest Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-8">
              <MetricCard
                label="Total Sessions"
                value={guestsData.overview.totalSessions}
                icon={Smartphone}
              />
              <MetricCard
                label="Conversions"
                value={guestsData.overview.convertedSessions}
                icon={TrendingUp}
              />
              <MetricCard
                label="Conversion Rate"
                value={guestsData.overview.conversionRate}
                suffix="%"
                icon={TrendingUp}
              />
              <MetricCard
                label="Avg. Time to Convert"
                value={guestsData.overview.avgTimeToConvert || "N/A"}
                icon={Users}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Campaign Performance */}
              {guestsData.guestsByCampaign && guestsData.guestsByCampaign.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Guests by Campaign
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={guestsData.guestsByCampaign.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#9CA3AF", fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "none",
                          borderRadius: "8px",
                          color: "#F9FAFB",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="totalGuests" fill={COLORS.primary} name="Total Guests" />
                      <Bar dataKey="conversions" fill={COLORS.secondary} name="Conversions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Device Breakdown */}
              {guestsData.deviceBreakdown && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Device Breakdown
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={guestsData.deviceBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="device"
                        label={({ device, percentage }) =>
                          `${device.charAt(0).toUpperCase() + device.slice(1)} (${percentage}%)`
                        }
                      >
                        {guestsData.deviceBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Daily Sessions Chart */}
            {guestsData.dailySessions && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Daily Guest Sessions
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={guestsData.dailySessions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                        color: "#F9FAFB",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      dot={false}
                      name="Sessions"
                    />
                    <Line
                      type="monotone"
                      dataKey="conversions"
                      stroke={COLORS.secondary}
                      strokeWidth={2}
                      dot={false}
                      name="Conversions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Guest Sessions
              </h3>
              <ExportButton
                data={guestsData.recentSessions}
                columns={guestColumns}
                filename="guest_sessions_export"
              />
            </div>

            <DataTable
              columns={guestColumns}
              data={guestsData.recentSessions}
              pageSize={15}
            />
          </>
        )}

        {/* Premium Tab */}
        {activeTab === "premium" && premiumData && (
          <>
            <FilterBar
              filters={filters}
              onChange={setFilters}
              options={{ upgradeSources: filterOptions.upgradeSources }}
              onReset={resetFilters}
            />

            {/* Premium Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-8">
              <MetricCard
                label="Total Upgrades"
                value={premiumData.overview.totalUpgrades}
                icon={Crown}
              />
              <MetricCard
                label="From QR Guests"
                value={premiumData.overview.qrGuestUpgrades}
                icon={Smartphone}
              />
              <MetricCard
                label="QR Guest %"
                value={premiumData.overview.qrGuestPercentage}
                suffix="%"
                icon={TrendingUp}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Upgrades by Source */}
              {premiumData.upgradesBySource && premiumData.upgradesBySource.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Upgrades by Source
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={premiumData.upgradesBySource} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis type="number" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                      <YAxis
                        type="category"
                        dataKey="source"
                        width={150}
                        tick={{ fill: "#9CA3AF", fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "none",
                          borderRadius: "8px",
                          color: "#F9FAFB",
                        }}
                        formatter={(value, name) => [value, "Upgrades"]}
                      />
                      <Bar dataKey="count" fill={COLORS.tertiary} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Conversion Funnel - Previous State */}
              {premiumData.upgradesByPreviousState && premiumData.upgradesByPreviousState.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Conversion Funnel
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={premiumData.upgradesByPreviousState}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="state"
                        label={({ state, percentage }) => `${state} (${percentage}%)`}
                      >
                        {premiumData.upgradesByPreviousState.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Daily Upgrades Chart */}
            {premiumData.dailyUpgrades && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Daily Premium Upgrades
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={premiumData.dailyUpgrades}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                        color: "#F9FAFB",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="upgrades"
                      stroke={COLORS.tertiary}
                      strokeWidth={2}
                      dot={false}
                      name="Upgrades"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent Upgrades Table */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Premium Upgrades
              </h3>
              <ExportButton
                data={premiumData.recentUpgrades}
                columns={[
                  { key: "userName", label: "User" },
                  { key: "userEmail", label: "Email" },
                  { key: "source", label: "Source" },
                  { key: "previousState", label: "From" },
                  { key: "wasQrGuest", label: "QR Guest", format: (v) => (v ? "Yes" : "No") },
                  { key: "campaignName", label: "Campaign" },
                  { key: "upgradedAt", label: "Upgraded", type: "date" },
                ]}
                filename="premium_upgrades_export"
              />
            </div>

            <DataTable
              columns={[
                { key: "userName", label: "User" },
                { key: "userEmail", label: "Email" },
                { key: "source", label: "Source" },
                { key: "previousState", label: "From" },
                { key: "wasQrGuest", label: "QR Guest", format: (v) => (v ? "Yes" : "No") },
                { key: "campaignName", label: "Campaign" },
                { key: "upgradedAt", label: "Upgraded", type: "date" },
              ]}
              data={premiumData.recentUpgrades || []}
              pageSize={15}
            />
          </>
        )}

        {/* Premium Tab - No Data State */}
        {activeTab === "premium" && !premiumData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Crown className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Premium Tracking Not Set Up
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Run the premium-upgrades-tracking.sql migration to enable detailed premium analytics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["platform_admin"]}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
