"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("🎯 AuthProvider: Session status:", status);
  console.log("🎯 AuthProvider: Session data:", session);

  useEffect(() => {
    console.log("🎯 AuthProvider: Status changed:", status);
    if (status === "loading") {
      setLoading(true);
    } else {
      setLoading(false);
      setUser(session?.user || null);
      console.log("🎯 AuthProvider: User set to:", session?.user || null);
    }
  }, [session, status]);

  const value = {
    user,
    session,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// // Updated src/components/AuthProvider.js to include role management
// "use client";

// import React, { createContext, useContext, useEffect, useState } from "react";
// import { auth } from "@/lib/auth";
// import { roleQueries } from "@/lib/supabase/role-queries";

// const AuthContext = createContext({});

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Get initial user
//     auth.getCurrentUser().then((user) => {
//       setUser(user);
//       setLoading(false);
//     });

//     // Listen for auth changes
//     const { data: authListener } = auth.onAuthStateChange(
//       async (event, session) => {
//         setUser(session?.user || null);
//         setLoading(false);
//       }
//     );

//     return () => {
//       authListener?.subscription?.unsubscribe();
//     };
//   }, []);

//   const signUp = async (email, password, metadata = {}) => {
//     const result = await auth.signUp(email, password, metadata);

//     // If signup successful and user confirmed, create player profile
//     if (result.user && !result.error) {
//       // Note: Profile creation happens automatically via database trigger
//       // Additional player data can be added here if needed
//       if (metadata.position || metadata.nationality) {
//         await roleQueries.createPlayerProfile(result.user.id, {
//           full_name: metadata.full_name,
//           position: metadata.position,
//           nationality: metadata.nationality,
//         });
//       }
//     }

//     return result;
//   };

//   const signIn = async (email, password) => {
//     return await auth.signIn(email, password);
//   };

//   const signInWithGoogle = async () => {
//     return await auth.signInWithGoogle();
//   };

//   const signOut = async () => {
//     const result = await auth.signOut();
//     if (!result.error) {
//       setUser(null);
//     }
//     return result;
//   };

//   const value = {
//     user,
//     loading,
//     signUp,
//     signIn,
//     signInWithGoogle,
//     signOut,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }
