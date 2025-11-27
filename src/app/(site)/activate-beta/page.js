"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { KeyRound, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import Link from "next/link";

/**
 * Beta Tester Activation Page
 * Allows NGO staff to redeem invitation codes and become beta testers
 */
export default function ActivateBetaPage() {
  const { data: session, status, update } = useSession();
  const { lang } = useLanguage();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const t = {
    en: {
      title: "Activate Beta Tester Access",
      subtitle:
        "Enter your invitation code to become a beta tester and get free premium access to Habitat English!",
      codeLabel: "Invitation Code",
      codePlaceholder: "BETA-XXX-XXXXX",
      validateButton: "Check Code",
      activateButton: "Activate Beta Access",
      validating: "Checking...",
      activating: "Activating...",
      codeValid: "Valid code for",
      codeInvalid: "Invalid or expired code",
      alreadyBeta: "You're already a beta tester!",
      signInPrompt: "Please sign in to activate your beta access",
      signInButton: "Sign In",
      successTitle: "Welcome, Beta Tester!",
      successMessage:
        "You now have full premium access to Habitat English. Thank you for helping us improve the platform!",
      goToWorlds: "Start Exploring",
      benefitsTitle: "Beta Tester Benefits",
      benefit1: "Free Premium Access",
      benefit1Desc: "Full access to all premium features and content",
      benefit2: "Early Access",
      benefit2Desc: "Try new features before anyone else",
      benefit3: "Direct Impact",
      benefit3Desc: "Your feedback shapes the future of Habitat English",
      loading: "Loading...",
    },
    pt: {
      title: "Ativar Acesso de Beta Tester",
      subtitle:
        "Digite seu código de convite para se tornar um beta tester e obter acesso premium gratuito ao Habitat English!",
      codeLabel: "Código de Convite",
      codePlaceholder: "BETA-XXX-XXXXX",
      validateButton: "Verificar Código",
      activateButton: "Ativar Acesso Beta",
      validating: "Verificando...",
      activating: "Ativando...",
      codeValid: "Código válido para",
      codeInvalid: "Código inválido ou expirado",
      alreadyBeta: "Você já é um beta tester!",
      signInPrompt: "Por favor, faça login para ativar seu acesso beta",
      signInButton: "Fazer Login",
      successTitle: "Bem-vindo, Beta Tester!",
      successMessage:
        "Agora você tem acesso premium completo ao Habitat English. Obrigado por nos ajudar a melhorar a plataforma!",
      goToWorlds: "Começar a Explorar",
      benefitsTitle: "Benefícios do Beta Tester",
      benefit1: "Acesso Premium Gratuito",
      benefit1Desc: "Acesso completo a todos os recursos e conteúdo premium",
      benefit2: "Acesso Antecipado",
      benefit2Desc: "Experimente novos recursos antes de todos",
      benefit3: "Impacto Direto",
      benefit3Desc: "Seu feedback molda o futuro do Habitat English",
      loading: "Carregando...",
    },
  };

  const copy = t[lang];

  const handleValidate = async () => {
    if (!code.trim()) {
      toast.error(copy.codeInvalid);
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await fetch("/api/beta-code/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (data.valid) {
        setValidationResult({
          valid: true,
          organization: data.organization,
        });
        toast.success(`${copy.codeValid} ${data.organization}`);
      } else {
        setValidationResult({ valid: false });
        toast.error(data.error || copy.codeInvalid);
      }
    } catch (error) {
      console.error("Error validating code:", error);
      toast.error(copy.codeInvalid);
    } finally {
      setIsValidating(false);
    }
  };

  const handleActivate = async () => {
    if (!code.trim()) {
      toast.error(copy.codeInvalid);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/beta-code/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Celebration!
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
        });

        toast.success(copy.successTitle, {
          description: copy.successMessage,
          duration: 6000,
        });

        // Update session to reflect new role
        await update();

        // Redirect to worlds after a delay
        setTimeout(() => {
          router.push("/worlds");
        }, 2000);
      } else {
        toast.error(data.error || copy.codeInvalid);
      }
    } catch (error) {
      console.error("Error activating beta code:", error);
      toast.error(copy.codeInvalid);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{copy.loading}</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <KeyRound className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {copy.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {copy.signInPrompt}
            </p>
            <Link
              href="/api/auth/signin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
            >
              {copy.signInButton}
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Check if user is already a beta tester
  if (session.user.role === "beta_tester") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {copy.alreadyBeta}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {copy.successMessage}
            </p>
            <Link
              href="/worlds"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
            >
              {copy.goToWorlds}
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
            <KeyRound className="w-12 h-12 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {copy.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {copy.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Activation Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {copy.codeLabel}
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder={copy.codePlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-lg"
                  maxLength={20}
                />
              </div>

              {/* Validation Result */}
              {validationResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg flex items-start gap-3 ${
                    validationResult.valid
                      ? "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                      : "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                  }`}
                >
                  {validationResult.valid ? (
                    <>
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">
                          {copy.codeValid} {validationResult.organization}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p className="font-semibold">{copy.codeInvalid}</p>
                    </>
                  )}
                </motion.div>
              )}

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleValidate}
                  disabled={isValidating || !code.trim()}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidating ? copy.validating : copy.validateButton}
                </button>

                <button
                  onClick={handleActivate}
                  disabled={
                    isSubmitting ||
                    !code.trim() ||
                    (validationResult && !validationResult.valid)
                  }
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  {isSubmitting ? copy.activating : copy.activateButton}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white"
          >
            <h2 className="text-2xl font-bold mb-6">{copy.benefitsTitle}</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{copy.benefit1}</h3>
                  <p className="text-white/90">{copy.benefit1Desc}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{copy.benefit2}</h3>
                  <p className="text-white/90">{copy.benefit2Desc}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{copy.benefit3}</h3>
                  <p className="text-white/90">{copy.benefit3Desc}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
