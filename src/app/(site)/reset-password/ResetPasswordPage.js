"use client";

import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ResetPasswordPage() {
  const { lang } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const t = {
    en: {
      title: "Reset Your Password",
      newPassword: "New Password",
      confirmPassword: "Confirm New Password",
      resetPassword: "Reset Password",
      processing: "Processing...",
      passwordsMismatch: "Passwords do not match.",
      passwordTooShort: "Password must be at least 6 characters long.",
      successMessage: "Password updated successfully! Redirecting to login...",
      errorMessage: "Failed to reset password. Please try again.",
      invalidLink: "Invalid or expired reset link. Please request a new one.",
      backToLogin: "Back to Login",
    },
    pt: {
      title: "Redefinir Sua Senha",
      newPassword: "Nova Senha",
      confirmPassword: "Confirmar Nova Senha",
      resetPassword: "Redefinir Senha",
      processing: "Processando...",
      passwordsMismatch: "As senhas não coincidem.",
      passwordTooShort: "A senha deve ter pelo menos 6 caracteres.",
      successMessage:
        "Senha atualizada com sucesso! Redirecionando para o login...",
      errorMessage: "Falha ao redefinir senha. Tente novamente.",
      invalidLink:
        "Link de redefinição inválido ou expirado. Solicite um novo.",
      backToLogin: "Voltar ao Login",
    },
    th: {
      title: "รีเซ็ตรหัสผ่านของคุณ",
      newPassword: "รหัสผ่านใหม่",
      confirmPassword: "ยืนยันรหัสผ่านใหม่",
      resetPassword: "รีเซ็ตรหัสผ่าน",
      processing: "กำลังดำเนินการ...",
      passwordsMismatch: "รหัสผ่านไม่ตรงกัน",
      passwordTooShort: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
      successMessage:
        "อัปเดตรหัสผ่านสำเร็จแล้ว! กำลังเปลี่ยนเส้นทางไปหน้าเข้าสู่ระบบ...",
      errorMessage: "รีเซ็ตรหัสผ่านไม่สำเร็จ กรุณาลองอีกครั้ง",
      invalidLink:
        "ลิงก์รีเซ็ตไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอลิงก์ใหม่",
      backToLogin: "กลับไปหน้าเข้าสู่ระบบ",
    },
  };

  const copy = t[lang];

  useEffect(() => {
    // Check if we have the required hash/session from the email link
    const hashFragment = window.location.hash;
    if (!hashFragment) {
      setError(copy.invalidLink);
    }
  }, [copy.invalidLink]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Validation
    if (password !== confirmPassword) {
      setError(copy.passwordsMismatch);
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(copy.passwordTooShort);
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setMessage(copy.successMessage);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Password reset error:", error);
      setError(error.message || copy.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-start py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-0 text-center text-3xl font-bold text-primary-900 dark:text-white">
          {copy.title}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className=" bg-white dark:bg-primary-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-center px-4 py-3 rounded">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-600 text-center px-4 py-3 rounded">
              {message}
            </div>
          )}

          {!error && !message && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-primary-50"
                >
                  {copy.newPassword}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-accent-500 focus:border-accent-500"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-s hover:text-accent-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

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
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-s hover:text-accent-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50"
                >
                  {loading ? copy.processing : copy.resetPassword}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/login")}
              className="text-gray-800 hover:text-accent-600 dark:text-white dark:hover:text-accent-400"
            >
              {copy.backToLogin}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
