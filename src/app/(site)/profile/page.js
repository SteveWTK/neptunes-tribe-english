"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  User,
  Mail,
  Calendar,
  Edit3,
  Check,
  X,
  CreditCard,
  ExternalLink,
  Crown,
  Heart,
  Shield,
  LogOut,
  ChevronLeft,
  Sparkles,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { resetDashboardTour } from "@/components/onboarding/DashboardTour";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [billingLoading, setBillingLoading] = useState(false);

  // Fetch profile data
  useEffect(() => {
    if (!session) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setProfile(data.user);
          setNewName(data.user.name || "");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSaveName = async () => {
    if (!newName.trim()) {
      setError("Please enter a display name");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update name");
      }

      setProfile((prev) => ({ ...prev, name: newName.trim() }));
      setEditingName(false);
      setSuccess("Display name updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenBillingPortal = async () => {
    setBillingLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stripe/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to open billing portal");
      }

      // Redirect to Stripe billing portal
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setBillingLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800">
        <Loader2 className="w-8 h-8 animate-spin text-accent-600 dark:text-accent-400" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const getSubscriptionBadge = () => {
    if (profile?.isPremium) {
      return {
        icon: Crown,
        text: "Premium",
        className: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
      };
    }
    if (profile?.isSupporter) {
      return {
        icon: Heart,
        text: "Supporter",
        className: "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300",
      };
    }
    return {
      icon: User,
      text: "Free",
      className: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    };
  };

  const badge = getSubscriptionBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Profile & Account
        </h1>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 flex items-center gap-2">
            <Check className="w-4 h-4" />
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
          {/* Header with avatar */}
          <div className="bg-gradient-to-r from-accent-500 to-blue-500 p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/30">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={profile?.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div className="text-white">
                <h2 className="text-xl font-bold">
                  {profile?.name || "Set your name"}
                </h2>
                <p className="text-white/80 text-sm">{profile?.email}</p>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}
                  >
                    <BadgeIcon className="w-3 h-3" />
                    {badge.text}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 space-y-4">
            {/* Display Name */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Display Name
                  </p>
                  {editingName ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        placeholder="Enter display name"
                        maxLength={50}
                        disabled={saving}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={saving}
                        className="p-1.5 bg-accent-600 text-white rounded-lg hover:bg-accent-700 disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingName(false);
                          setNewName(profile?.name || "");
                          setError("");
                        }}
                        disabled={saving}
                        className="p-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="font-medium text-gray-800 dark:text-white">
                      {profile?.name || (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              {!editingName && (
                <button
                  onClick={() => setEditingName(true)}
                  className="p-2 text-gray-500 hover:text-accent-600 dark:text-gray-400 dark:hover:text-accent-400 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {profile?.email}
                </p>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Member Since
                </p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    : "--"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription & Billing */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-6">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-accent-600 dark:text-accent-400" />
              Subscription & Billing
            </h3>

            {/* Current Plan */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Current Plan
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white flex items-center gap-2">
                    <BadgeIcon className="w-4 h-4" />
                    {badge.text}
                    {profile?.subscriptionStatus &&
                      profile.subscriptionStatus !== "active" && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          ({profile.subscriptionStatus})
                        </span>
                      )}
                  </p>
                </div>
                {!profile?.isPremium && (
                  <Link
                    href="/subscriptions"
                    className="px-4 py-2 bg-gradient-to-r from-accent-500 to-blue-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Upgrade
                  </Link>
                )}
              </div>
            </div>

            {/* Billing Portal Button */}
            {profile?.hasStripeCustomer ? (
              <button
                onClick={handleOpenBillingPortal}
                disabled={billingLoading}
                className="w-full py-3 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {billingLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Manage Billing & Subscriptions
                  </>
                )}
              </button>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                Billing options will appear here after your first purchase.
              </p>
            )}
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              Account
            </h3>

            <div className="space-y-3">
              {/* Restart Dashboard Tour */}
              <button
                onClick={() => {
                  resetDashboardTour();
                  router.push("/dashboard");
                }}
                className="w-full py-3 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Restart Dashboard Tour
              </button>

              {/* Sign Out */}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full py-3 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>

              {/* Delete Account (links to support) */}
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
                To delete your account, please{" "}
                <a
                  href="mailto:support@neptunes-tribe.com?subject=Account Deletion Request"
                  className="text-accent-600 dark:text-accent-400 hover:underline"
                >
                  contact support
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
