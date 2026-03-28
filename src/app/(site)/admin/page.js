"use client";

import Link from "next/link";
import {
  BookOpen,
  BarChart3,
  QrCode,
  Newspaper,
  Ticket,
  MessageSquare,
  ArrowRight,
  Settings,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

const adminPages = [
  {
    title: "Lessons",
    description: "Create, edit, and manage all lessons and their content",
    href: "/admin/lessons",
    icon: BookOpen,
    color: "blue",
  },
  {
    title: "Analytics Dashboard",
    description: "Track user engagement, conversions, and content performance",
    href: "/admin/dashboard",
    icon: BarChart3,
    color: "green",
  },
  {
    title: "QR Campaigns",
    description: "Manage QR codes for guest access at partner locations",
    href: "/admin/qr-campaigns",
    icon: QrCode,
    color: "purple",
  },
  {
    title: "Eco News",
    description: "Publish and manage conservation news articles",
    href: "/admin/eco-news",
    icon: Newspaper,
    color: "amber",
  },
  {
    title: "Beta Codes",
    description: "Generate and manage beta access invitation codes",
    href: "/admin/beta-codes",
    icon: Ticket,
    color: "cyan",
  },
  {
    title: "Feedback",
    description: "View and respond to user feedback and suggestions",
    href: "/admin/feedback",
    icon: MessageSquare,
    color: "orange",
  },
];

// Color mappings for consistent styling
const colorClasses = {
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
    hover: "hover:border-blue-300 dark:hover:border-blue-700",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-600 dark:text-green-400",
    hover: "hover:border-green-300 dark:hover:border-green-700",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-600 dark:text-purple-400",
    hover: "hover:border-purple-300 dark:hover:border-purple-700",
  },
  amber: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-600 dark:text-amber-400",
    hover: "hover:border-amber-300 dark:hover:border-amber-700",
  },
  cyan: {
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    text: "text-cyan-600 dark:text-cyan-400",
    hover: "hover:border-cyan-300 dark:hover:border-cyan-700",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-600 dark:text-orange-400",
    hover: "hover:border-orange-300 dark:hover:border-orange-700",
  },
};

function AdminHomeContent() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Settings className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-12">
            Manage content, track analytics, and configure platform settings
          </p>
        </div>

        {/* Admin Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminPages.map((page) => {
            const Icon = page.icon;
            const colors = colorClasses[page.color];

            return (
              <Link
                key={page.href}
                href={page.href}
                className={`group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-lg ${colors.hover}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${colors.bg}`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {page.title}
                      </h2>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {page.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdminHomePage() {
  return (
    <ProtectedRoute allowedRoles={["platform_admin"]}>
      <AdminHomeContent />
    </ProtectedRoute>
  );
}
