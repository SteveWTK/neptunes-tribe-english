"use client";

import { useSearchParams } from "next/navigation";
import { useState, useContext, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/contexts/LanguageContext";
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
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const t = {
    en: {
      loginChoice: "Or sign in with your email and password",
      registerChoice: "Or register with an email and password",
      login: "Sign in",
      register: "Create an Account",
      toggleToRegister: "Don’t have an account? Register here.",
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
    setMessage("");
    setLoading(true);

    if (isRegister) {
      if (password !== confirmPassword) {
        setMessage(copy.passwordsMismatch);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Something went wrong.");
      } else {
        setShowModal(true);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setIsRegister(false);
      }
    } else {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setMessage(copy.invalidLogin);
      } else {
        router.push("/units");
      }
    }

    setLoading(false);
  };

  return (
    <div className="h-100svh">
      <div className="max-w-md mx-auto mt-12 mb-24 p-6 bg-white dark:bg-primary-900 rounded-xl shadow-md relative">
        <h1 className="text-2xl font-bold text-center mb-6 dark:text-accent-100">
          {isRegister ? copy.register : copy.login}
        </h1>

        <div className="flex justify-center align-middle mb-6">
          <SignInButton />
        </div>

        <p className="text-center my-2">
          {isRegister ? copy.registerChoice : copy.loginChoice}
        </p>

        {/* <button
          onClick={() => signIn("google")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mb-4"
        >
          {copy.google}
        </button> */}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">{copy.email}</label>
            <input
              type="email"
              required
              className="w-full p-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <label className="block text-sm mb-1">{copy.password}</label>
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full p-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2/3 transform -translate-y-1/2 text-sm text-gray-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {isRegister && (
            <div className="relative">
              <label className="block text-sm mb-1">
                {copy.confirmPassword}
              </label>
              <input
                type="password"
                required
                className="w-full p-2 border rounded"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2/3 transform -translate-y-1/2 text-sm text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          )}

          {message && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
          >
            {loading ? copy.processing : copy.submit}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
            }}
            className="text-blue-600 hover:underline"
          >
            {isRegister ? copy.toggleToLogin : copy.toggleToRegister}
          </button>
        </div>

        {/* Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm text-center">
              <h2 className="text-lg font-bold mb-2">{copy.successTitle}</h2>
              <p className="mb-4">{copy.successMessage}</p>
              <button
                onClick={() => setShowModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                {copy.ok}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
