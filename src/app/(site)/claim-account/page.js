"use client";

import { useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import {
  UserPlus,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

const translations = {
  en: {
    title: "Create Your Account",
    subtitle:
      "Save your progress and continue exploring with your own account",
    googleSignIn: "Continue with Google",
    orDivider: "or create with email",
    emailLabel: "Email Address",
    emailPlaceholder: "your@email.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 6 characters",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter your password",
    nameLabel: "Display Name (optional)",
    namePlaceholder: "Explorer",
    createAccount: "Create Account",
    creating: "Creating...",
    passwordMismatch: "Passwords do not match",
    successTitle: "Account Created!",
    successMessage:
      "Your account has been created. All your progress has been preserved. Please sign in with your new credentials.",
    signIn: "Sign In",
    notGuest: "This page is for guest users. You already have an account.",
    goToDashboard: "Go to Dashboard",
    notLoggedIn: "Please sign in first.",
    goToLogin: "Go to Login",
  },
  pt: {
    title: "Crie Sua Conta",
    subtitle:
      "Salve seu progresso e continue explorando com sua própria conta",
    googleSignIn: "Continuar com Google",
    orDivider: "ou criar com email",
    emailLabel: "Endereço de Email",
    emailPlaceholder: "seu@email.com",
    passwordLabel: "Senha",
    passwordPlaceholder: "Pelo menos 6 caracteres",
    confirmPasswordLabel: "Confirmar Senha",
    confirmPasswordPlaceholder: "Digite sua senha novamente",
    nameLabel: "Nome de Exibição (opcional)",
    namePlaceholder: "Explorador",
    createAccount: "Criar Conta",
    creating: "Criando...",
    passwordMismatch: "As senhas não coincidem",
    successTitle: "Conta Criada!",
    successMessage:
      "Sua conta foi criada. Todo seu progresso foi preservado. Faça login com suas novas credenciais.",
    signIn: "Entrar",
    notGuest: "Esta página é para visitantes. Você já tem uma conta.",
    goToDashboard: "Ir para o Painel",
    notLoggedIn: "Faça login primeiro.",
    goToLogin: "Ir para Login",
  },
  th: {
    title: "สร้างบัญชีของคุณ",
    subtitle:
      "บันทึกความก้าวหน้าและสำรวจต่อด้วยบัญชีของคุณเอง",
    googleSignIn: "ดำเนินการต่อด้วย Google",
    orDivider: "หรือสร้างด้วยอีเมล",
    emailLabel: "ที่อยู่อีเมล",
    emailPlaceholder: "your@email.com",
    passwordLabel: "รหัสผ่าน",
    passwordPlaceholder: "อย่างน้อย 6 ตัวอักษร",
    confirmPasswordLabel: "ยืนยันรหัสผ่าน",
    confirmPasswordPlaceholder: "กรอกรหัสผ่านอีกครั้ง",
    nameLabel: "ชื่อที่แสดง (ไม่บังคับ)",
    namePlaceholder: "นักสำรวจ",
    createAccount: "สร้างบัญชี",
    creating: "กำลังสร้าง...",
    passwordMismatch: "รหัสผ่านไม่ตรงกัน",
    successTitle: "สร้างบัญชีสำเร็จ!",
    successMessage:
      "บัญชีของคุณถูกสร้างแล้ว ความก้าวหน้าทั้งหมดถูกเก็บรักษาไว้ กรุณาเข้าสู่ระบบด้วยข้อมูลใหม่ของคุณ",
    signIn: "เข้าสู่ระบบ",
    notGuest: "หน้านี้สำหรับผู้เยี่ยมชม คุณมีบัญชีอยู่แล้ว",
    goToDashboard: "ไปที่แดชบอร์ด",
    notLoggedIn: "กรุณาเข้าสู่ระบบก่อน",
    goToLogin: "ไปที่หน้าเข้าสู่ระบบ",
  },
};

export default function ClaimAccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { lang } = useLanguage();
  const copy = translations[lang] || translations.en;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-600" />
      </div>
    );
  }

  // Not logged in
  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {copy.notLoggedIn}
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-medium transition-colors"
          >
            {copy.goToLogin}
          </button>
        </div>
      </div>
    );
  }

  // Not a guest user
  if (session.user.role !== "guest") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {copy.notGuest}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-medium transition-colors"
          >
            {copy.goToDashboard}
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {copy.successTitle}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {copy.successMessage}
          </p>
          <button
            onClick={async () => {
              await signOut({ redirect: false });
              router.push("/login");
            }}
            className="w-full py-3 px-6 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {copy.signIn}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(copy.passwordMismatch);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/guest-access/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to create account");
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error("Error claiming account:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      // Store the guest user ID so we can transfer data after Google sign-in
      const prepRes = await fetch("/api/guest-access/prepare-claim", {
        method: "POST",
      });

      if (!prepRes.ok) {
        const data = await prepRes.json();
        throw new Error(data.error || "Failed to prepare account claim");
      }

      // Sign out the guest user first, then sign in with Google
      await signOut({ redirect: false });

      // Redirect to Google OAuth with a special callback
      await signIn("google", {
        callbackUrl: "/auth/claim-callback",
      });
    } catch (err) {
      console.error("Error starting Google sign-in:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-accent-600 dark:text-accent-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {copy.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {copy.subtitle}
          </p>
        </div>

        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isSubmitting}
          className="w-full flex items-center justify-center gap-3 py-3 px-6 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-300" />
          ) : (
            <img
              src="https://authjs.dev/img/providers/google.svg"
              alt="Google"
              width="20"
              height="20"
            />
          )}
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {copy.googleSignIn}
          </span>
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              {copy.orDivider}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {copy.emailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={copy.emailPlaceholder}
              required
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {copy.passwordLabel}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={copy.passwordPlaceholder}
                required
                minLength={6}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {copy.confirmPasswordLabel}
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={copy.confirmPasswordPlaceholder}
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {copy.nameLabel}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={copy.namePlaceholder}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-accent-600 hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {copy.creating}
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                {copy.createAccount}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
