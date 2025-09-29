"use client";

import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProtectedRoute({ children, allowedRoles = null }) {
  console.log("🚀 ProtectedRoute: Component rendered");
  console.log("🚀 ProtectedRoute: allowedRoles prop:", allowedRoles);

  const { user, loading } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [checkingRole, setCheckingRole] = useState(!!allowedRoles);

  console.log("🚀 ProtectedRoute: Auth state:", { user: user?.email, loading, checkingRole });

  useEffect(() => {
    console.log("🔄 ProtectedRoute: Auth check effect", { loading, user: user?.email });
    if (!loading && !user) {
      console.log("⚠️ ProtectedRoute: No user, redirecting to login");
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    console.log("🔄 ProtectedRoute: Role check effect", {
      hasUser: !!user,
      userEmail: user?.email,
      allowedRoles,
      willCheckRole: !!(user && allowedRoles)
    });

    if (user && allowedRoles) {
      checkUserRole();
    } else if (user && !allowedRoles) {
      console.log("✅ ProtectedRoute: No role restriction, allowing access");
      setCheckingRole(false);
    }
  }, [user, allowedRoles]);

  async function checkUserRole() {
    try {
      console.log("🔍 ProtectedRoute: Checking role for user:", user.email);
      console.log("🔍 ProtectedRoute: Required roles:", allowedRoles);

      const supabase = createClient();
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("email", user.email)
        .single();

      if (error) {
        console.error("❌ ProtectedRoute: Error fetching role:", error);
        throw error;
      }

      console.log("✅ ProtectedRoute: User role found:", data?.role);
      setUserRole(data?.role);

      if (data?.role && !allowedRoles.includes(data.role)) {
        console.warn("⚠️ ProtectedRoute: User role not allowed. Redirecting to home.");
        console.log("   - User has role:", data.role);
        console.log("   - Required roles:", allowedRoles);
        router.push("/");
      } else {
        console.log("✅ ProtectedRoute: Access granted!");
      }
    } catch (error) {
      console.error("❌ ProtectedRoute: Fatal error:", error);
      router.push("/");
    } finally {
      setCheckingRole(false);
    }
  }

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-primary-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return null;
  }

  return children;
}
