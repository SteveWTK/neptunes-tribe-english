// 1. UPDATED: app/components/signoutButton.js
"use client";

import { signOut } from "next-auth/react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";

function SignOutButton({ className = "", onSignOutComplete }) {
  const handleSignOut = async () => {
    try {
      // Use NextAuth's client-side signOut with redirect
      await signOut({
        callbackUrl: "/",
        redirect: true, // This forces a proper redirect and session refresh
      });

      // Optional callback for any additional cleanup
      if (onSignOutComplete) {
        onSignOutComplete();
      }
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="py-0.5 px-5 rounded-2xl  transition-colors flex items-center gap-3 text-primary-900 hover:text-accent-400 hover:border-b-1 hover:border-accent-600 dark:text-accent-50 dark:hover:text-accent-400 dark:hover:border-accent-400"
    >
      <ArrowRightOnRectangleIcon className="h-5 w-5" />
      <span>Sign Out</span>
    </button>
  );
}

export default SignOutButton;
