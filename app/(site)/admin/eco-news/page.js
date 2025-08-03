// app/(site)/admin/eco-news/page.js
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import EcoNewsAdmin from "@/components/admin/EcoNewsAdmin";

// List of admin emails - you can move this to env variables later
const ADMIN_EMAILS = [
  "michaelalanwatkins@gmail.com",
  "michael.alan.watkins@gmail.com",

  "steveinspirewtk@gmail.com",
  "stevecultura@gmail.com",
  "davidchaveswatkins@gmail.com",
  "chaveswatkinspaul@gmail.com", // Add your team emails
  "stephenchaveswatkins@gmail.com",
  // Add more admin emails as needed
];

export const metadata = {
  title: "Eco-News Admin - Neptune's Tribe",
  description: "Manage environmental news and blog posts",
};

export default async function AdminEcoNewsPage() {
  const session = await auth();

  // Check if user is logged in
  if (!session?.user?.email) {
    redirect("/auth/signin?callbackUrl=/admin/eco-news");
  }

  // Check if user is admin
  if (!ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/"); // Redirect to home if not admin
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">
                Neptune&apos;s Tribe Admin
              </h1>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Eco-News Management
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {session.user.name || session.user.email}
              </span>
              <a
                href="/eco-news"
                target="_blank"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View Public Page →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <EcoNewsAdmin />
    </div>
  );
}
