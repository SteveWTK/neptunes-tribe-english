"use client";

import { createClient } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";
import { useState, useContext, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import SignInButton from "@/app/components/SigninButton";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginPage() {
  const { lang } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false); // Keep this as your main toggle
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    },
  };

  const copy = t[lang];

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam && typeof emailParam === "string") setEmail(emailParam);
  }, [searchParams]);

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

        console.log("=== CLIENT-SIDE SIGNUP STARTED ===");
        console.log("Email:", email);

        // Use Supabase client-side signup
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
        });

        if (error) {
          console.error("Signup error:", error);
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
          // Optionally redirect or update UI
          router.push("/dashboard");
        }
      } else {
        // Login with NextAuth
        console.log("Attempting login...");

        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isRegister ? copy.register : copy.login}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Google Sign In */}
          <div className="mb-6">
            <SignInButton />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {isRegister ? copy.registerChoice : copy.loginChoice}
              </span>
            </div>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
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
                className="block text-sm font-medium text-gray-700"
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
                className="block text-sm font-medium text-gray-700"
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
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
                  className="block text-sm font-medium text-gray-700"
                >
                  {copy.confirmPassword}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? copy.processing : copy.submit}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                  setMessage("");
                }}
                className="text-indigo-600 hover:text-indigo-500"
              >
                {isRegister ? copy.toggleToLogin : copy.toggleToRegister}
              </button>
            </div>
          </form>
        </div>
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
                    setIsRegister(false); // Switch back to login mode
                  }}
                  className="px-4 py-2 bg-indigo-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {copy.ok}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
