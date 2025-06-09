"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { registerUser } from "@/lib/actions"; // Import the new registration action
import supabase from "@/lib/supabase-browser";
import SignInButton from "@/app/components/SigninButton";

export default function LoginPage() {
  const { lang } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const t = {
    en: {
      loginChoice: "Or sign in with your email and password",
      registerChoice: "Or register with an email and password",
      login: "Sign in",
      register: "Create an Account",
      toggleToRegister: "Don't have an account? Register here.",
      toggleToLogin: "Already have an account? Login here.",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      google: "Sign in with Google",
      submit: isRegister ? "Create Account" : "Login",
      processing: "Processing...",
      passwordsMismatch: "Passwords do not match.",
      invalidLogin: "Invalid email or password.",
      successTitle: "Account created successfully!",
      successMessage: "Please check your email to continue.",
      ok: "OK",
      forgotPassword: "Forgot your password?",
      resetPassword: "Reset Password",
      sendResetEmail: "Send Reset Email",
      backToLogin: "Back to Login",
      resetEmailSent: "Password reset email sent! Check your inbox.",
      enterEmailForReset:
        "Enter your email address to receive password reset instructions.",
      cancel: "Cancel",
    },
    pt: {
      loginChoice: "Ou entre com seu email e senha",
      registerChoice: "Ou crie uma conta com seu email e senha",
      login: "Entre",
      register: "Crie uma Conta",
      toggleToRegister: "Não tem uma conta? Registre-se aqui.",
      toggleToLogin: "Já tem uma conta? Entre aqui.",
      email: "Email",
      password: "Senha",
      confirmPassword: "Confirmar senha",
      google: "Entrar com o Google",
      submit: isRegister ? "Criar Conta" : "Entrar",
      processing: "Processando...",
      passwordsMismatch: "As senhas não coincidem.",
      invalidLogin: "Email ou senha inválidos.",
      successTitle: "Conta criada com sucesso!",
      successMessage: "Por favor, verifique seu email para continuar.",
      ok: "OK",
      forgotPassword: "Esqueceu sua senha?",
      resetPassword: "Redefinir Senha",
      sendResetEmail: "Enviar Email de Redefinição",
      backToLogin: "Voltar ao Login",
      resetEmailSent:
        "Email de redefinição enviado! Verifique sua caixa de entrada.",
      enterEmailForReset:
        "Digite seu endereço de email para receber instruções de redefinição de senha.",
      cancel: "Cancelar",
    },
  };

  const copy = t[lang];

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const confirmed = searchParams.get("confirmed");
    const error = searchParams.get("error");

    if (emailParam && typeof emailParam === "string") {
      setEmail(emailParam);
    }

    if (confirmed === "true") {
      setMessage("Email confirmed successfully! You can now sign in.");
      const url = new URL(window.location);
      url.searchParams.delete("confirmed");
      window.history.replaceState({}, "", url);
    }

    if (error === "confirmation_failed") {
      setError(
        "Email confirmation failed. Please try again or contact support."
      );
      const url = new URL(window.location);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url);
    }
  }, [searchParams]);

  const checkForExistingGoogleUser = async (email) => {
    try {
      console.log("🔍 Making API call to check user:", email);

      const response = await fetch("/api/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      console.log("API response status:", response.status);
      console.log("API response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("API response data:", data);
        return data;
      } else {
        const errorText = await response.text();
        console.error("API response error:", errorText);
      }

      return { exists: false };
    } catch (error) {
      console.error("Error checking for existing user:", error);
      return { exists: false };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isRegister) {
        // Validate password confirmation
        if (password !== confirmPassword) {
          throw new Error(copy.passwordsMismatch);
        }

        // Check if user already exists (Google OAuth user trying to register)
        const userCheck = await checkForExistingGoogleUser(email);
        if (userCheck.exists && userCheck.isGoogleUser) {
          setError(
            "This email is already registered with Google. Please sign in with Google instead."
          );
          setLoading(false);
          return; // ← This return was missing!
        }

        console.log("=== CLIENT-SIDE SIGNUP STARTED ===");
        console.log("Email:", email);

        // Use Supabase client-side signup
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          console.error("Signup error:", error);

          // Handle specific error cases
          if (error.message.includes("already registered")) {
            throw new Error(
              "This email is already registered. Please try signing in instead."
            );
          }

          throw error;
        }

        console.log("Signup successful:", data);

        // Check if user needs to confirm email
        if (data.user && !data.session) {
          setMessage(copy.successMessage);
          setShowModal(true);
          // Clear form
          setEmail("");
          setPassword("");
          setConfirmPassword("");
        } else if (data.session) {
          // User is immediately signed in (email confirmation disabled)
          setMessage("Account created successfully! You are now signed in.");
          router.push("/units");
        }
      } else {
        // Login logic
        console.log("Attempting login...");

        // First check if this might be a Google OAuth user trying to use email/password
        const userCheck = await checkForExistingGoogleUser(email);
        if (
          userCheck.exists &&
          userCheck.isGoogleUser &&
          !userCheck.hasPassword
        ) {
          setError(
            "This email was registered with Google. Please sign in with Google instead, or use 'Forgot Password' to set up email login."
          );
          setLoading(false);
          return;
        }

        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          // Provide more helpful error messages
          if (result.error === "CredentialsSignin") {
            const userCheck = await checkForExistingGoogleUser(email);
            if (userCheck.exists && userCheck.isGoogleUser) {
              throw new Error(
                "This email was registered with Google. Please sign in with Google instead."
              );
            } else {
              throw new Error(copy.invalidLogin);
            }
          }
          throw new Error(copy.invalidLogin);
        }

        if (result?.ok) {
          router.push("/units");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResetMessage("");

    try {
      // Use server action for password reset
      const result = await resetPassword({ email: resetEmail });

      if (!result.success) {
        throw new Error(result.error);
      }

      setResetMessage(copy.resetEmailSent);
      setResetEmail("");
    } catch (error) {
      console.error("Password reset error:", error);
      setError(
        error.message || "Failed to send reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-6 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-3 text-center text-3xl font-bold text-primary-900 dark:text-white">
          {isRegister ? copy.register : copy.login}
        </h2>
      </div>
      <div className="max-w-md mx-auto mt-6 mb-24 px-6 sm:px-10 md:px-14 lg:px-18 py-2 bg-white dark:bg-primary-800 rounded-xl shadow-md relative">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          {/* Google Sign In */}
          <div className="mb-6 flex justify-center">
            <SignInButton />
          </div>

          <div className="relative">
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-primary-950 dark:text-primary-50">
                {isRegister ? copy.registerChoice : copy.loginChoice}
              </span>
            </div>
          </div>

          {!showForgotPassword ? (
            <form className="mt-2 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {message && !showModal && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                  {message}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-primary-50"
                >
                  {copy.email}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-primary-50"
                >
                  {copy.password}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs hover:text-accent-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {isRegister && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-primary-50"
                  >
                    {copy.confirmPassword}
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs hover:text-accent-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? copy.processing : copy.submit}
                </button>
              </div>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError("");
                    setMessage("");
                  }}
                  className="text-gray-800 hover:text-accent-600 dark:text-white dark:hover:text-accent-400"
                >
                  {isRegister ? copy.toggleToLogin : copy.toggleToRegister}
                </button>

                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setError("");
                      setMessage("");
                      setResetEmail(email);
                    }}
                    className="pb-4 font-light text-sm text-gray-800 hover:text-accent-600 dark:text-white dark:hover:text-accent-400"
                  >
                    {copy.forgotPassword}
                  </button>
                )}
              </div>
            </form>
          ) : (
            <form className="mt-6 space-y-6" onSubmit={handlePasswordReset}>
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-primary-50">
                  {copy.resetPassword}
                </h3>
                <p className="text-sm text-gray-700 dark:text-primary-50 mt-2">
                  {copy.enterEmailForReset}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {resetMessage && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                  {resetMessage}
                </div>
              )}

              <div>
                <label
                  htmlFor="resetEmail"
                  className="block text-sm font-medium text-gray-700 dark:text-primary-50"
                >
                  {copy.email}
                </label>
                <input
                  id="resetEmail"
                  name="resetEmail"
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-accent-500 focus:border-accent-500"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !resetEmail}
                  className="group relative w-full flex justify-center py-2 px-4 mb-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? copy.processing : copy.sendResetEmail}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setError("");
                    setResetMessage("");
                  }}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  {copy.backToLogin}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Success Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {copy.successTitle}
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">{copy.successMessage}</p>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setIsRegister(false);
                    }}
                    className="px-4 py-2 bg-accent-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    {copy.ok}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// "use client";

// import { createClient } from "@supabase/supabase-js";
// import { useSearchParams } from "next/navigation";
// import { useState, useContext, useEffect } from "react";
// import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useLanguage } from "@/lib/contexts/LanguageContext";
// import SignInButton from "@/app/components/SigninButton";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// );

// export default function LoginPage() {
//   const { lang } = useLanguage();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [isRegister, setIsRegister] = useState(false); // Keep this as your main toggle
//   const [message, setMessage] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showForgotPassword, setShowForgotPassword] = useState(false);
//   const [resetEmail, setResetEmail] = useState("");
//   const [resetMessage, setResetMessage] = useState("");

//   const t = {
//     en: {
//       loginChoice: "Or sign in with your email and password",
//       registerChoice: "Or register with an email and password",
//       login: "Sign in",
//       register: "Create an Account",
//       toggleToRegister: "Don't have an account? Register here.",
//       toggleToLogin: "Already have an account? Login here.",
//       email: "Email",
//       password: "Password",
//       confirmPassword: "Confirm Password",
//       google: "Sign in with Google",
//       submit: isRegister ? "Create Account" : "Login",
//       processing: "Processing...",
//       passwordsMismatch: "Passwords do not match.",
//       invalidLogin: "Invalid email or password.",
//       successTitle: "Account created successfully!",
//       successMessage: "Please check your email to continue.",
//       ok: "OK",
//       forgotPassword: "Forgot your password?",
//       resetPassword: "Reset Password",
//       sendResetEmail: "Send Reset Email",
//       backToLogin: "Back to Login",
//       resetEmailSent: "Password reset email sent! Check your inbox.",
//       enterEmailForReset:
//         "Enter your email address to receive password reset instructions.",
//       cancel: "Cancel",
//     },
//     pt: {
//       loginChoice: "Ou entre com seu email e senha",
//       registerChoice: "Ou crie uma conta com seu email e senha",
//       login: "Entre",
//       register: "Crie uma Conta",
//       toggleToRegister: "Não tem uma conta? Registre-se aqui.",
//       toggleToLogin: "Já tem uma conta? Entre aqui.",
//       email: "Email",
//       password: "Senha",
//       confirmPassword: "Confirmar senha",
//       google: "Entrar com o Google",
//       submit: isRegister ? "Criar Conta" : "Entrar",
//       processing: "Processando...",
//       passwordsMismatch: "As senhas não coincidem.",
//       invalidLogin: "Email ou senha inválidos.",
//       successTitle: "Conta criada com sucesso!",
//       successMessage: "Por favor, verifique seu email para continuar.",
//       ok: "OK",
//       forgotPassword: "Esqueceu sua senha?",
//       resetPassword: "Redefinir Senha",
//       sendResetEmail: "Enviar Email de Redefinição",
//       backToLogin: "Voltar ao Login",
//       resetEmailSent:
//         "Email de redefinição enviado! Verifique sua caixa de entrada.",
//       enterEmailForReset:
//         "Digite seu endereço de email para receber instruções de redefinição de senha.",
//       cancel: "Cancelar",
//     },
//   };

//   const copy = t[lang];

//   useEffect(() => {
//     const emailParam = searchParams.get("email");
//     const confirmed = searchParams.get("confirmed");
//     const error = searchParams.get("error");

//     if (emailParam && typeof emailParam === "string") {
//       setEmail(emailParam);
//     }

//     // Handle confirmation success
//     if (confirmed === "true") {
//       setMessage("Email confirmed successfully! You can now sign in.");
//       // Optionally clear the URL parameters
//       const url = new URL(window.location);
//       url.searchParams.delete("confirmed");
//       window.history.replaceState({}, "", url);
//     }

//     // Handle confirmation errors
//     if (error === "confirmation_failed") {
//       setError(
//         "Email confirmation failed. Please try again or contact support."
//       );
//       const url = new URL(window.location);
//       url.searchParams.delete("error");
//       window.history.replaceState({}, "", url);
//     }
//   }, [searchParams]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setMessage("");

//     try {
//       if (isRegister) {
//         // Validate password confirmation
//         if (password !== confirmPassword) {
//           throw new Error(copy.passwordsMismatch);
//         }

//         console.log("=== CLIENT-SIDE SIGNUP STARTED ===");
//         console.log("Email:", email);

//         // Use Supabase client-side signup
//         const { data, error } = await supabase.auth.signUp({
//           email: email,
//           password: password,
//         });

//         if (error) {
//           console.error("Signup error:", error);
//           throw error;
//         }

//         console.log("Signup successful:", data);

//         // Check if user needs to confirm email
//         if (data.user && !data.session) {
//           setMessage(copy.successMessage);
//           setShowModal(true);
//           // Clear form
//           setEmail("");
//           setPassword("");
//           setConfirmPassword("");
//         } else if (data.session) {
//           // User is immediately signed in (email confirmation disabled)
//           setMessage("Account created successfully! You are now signed in.");
//           // Optionally redirect or update UI
//           router.push("/dashboard");
//         }
//       } else {
//         // Login with NextAuth
//         console.log("Attempting login...");

//         const result = await signIn("credentials", {
//           email,
//           password,
//           redirect: false,
//         });

//         if (result?.error) {
//           throw new Error(copy.invalidLogin);
//         }

//         if (result?.ok) {
//           router.push("/units");
//         }
//       }
//     } catch (error) {
//       console.error("Auth error:", error);
//       setError(error.message || "An error occurred. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePasswordReset = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setResetMessage("");

//     try {
//       const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
//         redirectTo: `${window.location.origin}/reset-password`,
//       });

//       if (error) throw error;

//       setResetMessage(copy.resetEmailSent);
//       setResetEmail("");
//     } catch (error) {
//       console.error("Password reset error:", error);
//       setError(
//         error.message || "Failed to send reset email. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col justify-center py-6 sm:px-6 lg:px-8">
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <h2 className="mt-3 text-center text-3xl font-bold text-primary-900 dark:text-white">
//           {isRegister ? copy.register : copy.login}
//         </h2>
//       </div>
//       <div className="max-w-md mx-auto mt-6 mb-24 px-6 sm:px-10 md:px-14 lg:px-18 py-2 bg-white dark:bg-primary-800 rounded-xl shadow-md relative">
//         <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//           {/* <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"> */}
//           {/* Google Sign In */}
//           <div className="mb-6 flex justify-center">
//             <SignInButton />
//           </div>

//           <div className="relative">
//             {/* <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-primary-500" />
//             </div> */}
//             <div className="relative flex justify-center text-sm">
//               <span className="px-2 text-primary-950 dark:text-primary-50">
//                 {isRegister ? copy.registerChoice : copy.loginChoice}
//               </span>
//             </div>
//           </div>

//           {!showForgotPassword ? (
//             <form className="mt-2 space-y-6" onSubmit={handleSubmit}>
//               {error && (
//                 <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
//                   {error}
//                 </div>
//               )}

//               {message && !showModal && (
//                 <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
//                   {message}
//                 </div>
//               )}

//               <div>
//                 <label
//                   htmlFor="email"
//                   className="block text-sm font-medium text-gray-700 dark:text-primary-50"
//                 >
//                   {copy.email}
//                 </label>
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//               </div>

//               <div>
//                 <label
//                   htmlFor="password"
//                   className="block text-sm font-medium text-gray-700 dark:text-primary-50"
//                 >
//                   {copy.password}
//                 </label>
//                 <div className="mt-1 relative">
//                   <input
//                     id="password"
//                     name="password"
//                     type={showPassword ? "text" : "password"}
//                     required
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                   <button
//                     type="button"
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs hover:text-accent-500"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? "Hide" : "Show"}
//                   </button>
//                 </div>
//               </div>

//               {isRegister && (
//                 <div>
//                   <label
//                     htmlFor="confirmPassword"
//                     className="block text-sm font-medium text-gray-700 dark:text-primary-50"
//                   >
//                     {copy.confirmPassword}
//                   </label>
//                   <div className="mt-1 relative">
//                     <input
//                       id="confirmPassword"
//                       name="confirmPassword"
//                       type={showPassword ? "text" : "password"}
//                       required
//                       value={confirmPassword}
//                       onChange={(e) => setConfirmPassword(e.target.value)}
//                       className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                     />
//                     <button
//                       type="button"
//                       className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs hover:text-accent-500"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? "Hide" : "Show"}
//                     </button>
//                   </div>
//                 </div>
//               )}

//               <div>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//                 >
//                   {loading ? copy.processing : copy.submit}
//                 </button>
//               </div>

//               <div className="text-center space-y-2">
//                 {!showForgotPassword ? (
//                   <>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setIsRegister(!isRegister);
//                         setError("");
//                         setMessage("");
//                       }}
//                       className="text-gray-800 hover:text-accent-600 dark:text-white dark:hover:text-accent-400"
//                     >
//                       {isRegister ? copy.toggleToLogin : copy.toggleToRegister}
//                     </button>

//                     {!isRegister && (
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setShowForgotPassword(true);
//                           setError("");
//                           setMessage("");
//                           setResetEmail(email); // Pre-fill with current email
//                         }}
//                         className="pb-4 font-light text-sm text-gray-800 hover:text-accent-600 dark:text-white dark:hover:text-accent-400"
//                       >
//                         {copy.forgotPassword}
//                       </button>
//                     )}
//                   </>
//                 ) : (
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowForgotPassword(false);
//                       setError("");
//                       setResetMessage("");
//                     }}
//                     className="text-indigo-600 hover:text-indigo-500"
//                   >
//                     {copy.backToLogin}
//                   </button>
//                 )}
//               </div>
//             </form>
//           ) : (
//             // New forgot password form
//             <form className="mt-6 space-y-6" onSubmit={handlePasswordReset}>
//               <div className="text-center mb-4">
//                 <h3 className="text-lg font-medium text-gray-700 dark:text-primary-50">
//                   {copy.resetPassword}
//                 </h3>
//                 <p className="text-sm text-gray-700 dark:text-primary-50 mt-2">
//                   {copy.enterEmailForReset}
//                 </p>
//               </div>

//               {error && (
//                 <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
//                   {error}
//                 </div>
//               )}

//               {resetMessage && (
//                 <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
//                   {resetMessage}
//                 </div>
//               )}

//               <div>
//                 <label
//                   htmlFor="resetEmail"
//                   className="block text-sm font-medium text-gray-700 dark:text-primary-50"
//                 >
//                   {copy.email}
//                 </label>
//                 <input
//                   id="resetEmail"
//                   name="resetEmail"
//                   type="email"
//                   required
//                   value={resetEmail}
//                   onChange={(e) => setResetEmail(e.target.value)}
//                   className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-accent-500 focus:border-accent-500"
//                 />
//               </div>

//               <div>
//                 <button
//                   type="submit"
//                   disabled={loading || !resetEmail}
//                   className="group relative w-full flex justify-center py-2 px-4 mb-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//                 >
//                   {loading ? copy.processing : copy.sendResetEmail}
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>

//         {/* Success Modal */}
//         {showModal && (
//           <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
//             <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
//               <div className="mt-3 text-center">
//                 <h3 className="text-lg font-medium text-gray-900">
//                   {copy.successTitle}
//                 </h3>
//                 <div className="mt-2 px-7 py-3">
//                   <p className="text-sm text-gray-500">{copy.successMessage}</p>
//                 </div>
//                 <div className="items-center px-4 py-3">
//                   <button
//                     onClick={() => {
//                       setShowModal(false);
//                       setIsRegister(false); // Switch back to login mode
//                     }}
//                     className="px-4 py-2 bg-accent-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
//                   >
//                     {copy.ok}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
