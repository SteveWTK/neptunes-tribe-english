"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { KeyRound, Sparkles, CheckCircle, AlertCircle, Gift, Building2 } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import Link from "next/link";

/**
 * Universal Activation Page
 * Handles all code types: beta_tester, bulk_premium, enterprise, donated_premium
 */
export default function ActivatePremiumPage() {
  const { data: session, status, update } = useSession();
  const { lang } = useLanguage();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const getCodeTypeInfo = (codeType) => {
    const info = {
      beta_tester: {
        title: { en: "Activate Beta Tester Access", pt: "Ativar Acesso de Beta Tester" },
        subtitle: { en: "Free premium access for NGO partners", pt: "Acesso premium gratuito para parceiros ONGs" },
        icon: Sparkles,
        color: "purple",
      },
      bulk_premium: {
        title: { en: "Activate Premium Access", pt: "Ativar Acesso Premium" },
        subtitle: { en: "Activate your premium account", pt: "Ative sua conta premium" },
        icon: KeyRound,
        color: "blue",
      },
      enterprise: {
        title: { en: "Activate Enterprise Access", pt: "Ativar Acesso Empresarial" },
        subtitle: { en: "Premium access for your organization", pt: "Acesso premium para sua organização" },
        icon: Building2,
        color: "indigo",
      },
      donated_premium: {
        title: { en: "Activate Donated Premium Access", pt: "Ativar Acesso Premium Doado" },
        subtitle: { en: "A gift of premium learning", pt: "Um presente de aprendizado premium" },
        icon: Gift,
        color: "green",
      },
    };

    return info[codeType] || info.bulk_premium;
  };

  const t = {
    en: {
      genericTitle: "Activate Your Access",
      genericSubtitle: "Enter your invitation code to activate premium access to Habitat English",
      codeLabel: "Invitation Code",
      codePlaceholder: "XXXX-XXX-XXXXX",
      validateButton: "Check Code",
      activateButton: "Activate Access",
      validating: "Checking...",
      activating: "Activating...",
      codeValid: "Valid code",
      codeInvalid: "Invalid or expired code",
      signInPrompt: "Please sign in to activate your access",
      signInButton: "Sign In",
      successTitle: "Welcome to Habitat English!",
      successMessage: "Your premium access has been activated",
      successMessageDuration: "Duration",
      successMessageLifetime: "Lifetime access",
      successMessageMonths: "months",
      goToWorlds: "Start Exploring",
      loading: "Loading...",
      alreadyPremium: "You already have premium access!",
    },
    pt: {
      genericTitle: "Ativar Seu Acesso",
      genericSubtitle: "Digite seu código de convite para ativar acesso premium ao Habitat English",
      codeLabel: "Código de Convite",
      codePlaceholder: "XXXX-XXX-XXXXX",
      validateButton: "Verificar Código",
      activateButton: "Ativar Acesso",
      validating: "Verificando...",
      activating: "Ativando...",
      codeValid: "Código válido",
      codeInvalid: "Código inválido ou expirado",
      signInPrompt: "Por favor, faça login para ativar seu acesso",
      signInButton: "Fazer Login",
      successTitle: "Bem-vindo ao Habitat English!",
      successMessage: "Seu acesso premium foi ativado",
      successMessageDuration: "Duração",
      successMessageLifetime: "Acesso vitalício",
      successMessageMonths: "meses",
      goToWorlds: "Começar a Explorar",
      loading: "Carregando...",
      alreadyPremium: "Você já tem acesso premium!",
    },
  };

  const copy = t[lang];
  const codeTypeInfo = validationResult?.codeType ? getCodeTypeInfo(validationResult.codeType) : null;

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
          codeType: data.code_type,
          premiumDurationMonths: data.premium_duration_months,
        });
        toast.success(`${copy.codeValid}: ${data.organization}`);
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

        let description = copy.successMessage;
        if (data.premium_duration_months) {
          description += ` - ${data.premium_duration_months} ${copy.successMessageMonths}`;
        } else if (data.code_type !== 'beta_tester') {
          description += ` - ${copy.successMessageLifetime}`;
        }

        toast.success(copy.successTitle, {
          description,
          duration: 6000,
        });

        // Update session to reflect new access
        await update();

        // Redirect to worlds after a delay
        setTimeout(() => {
          router.push("/worlds");
        }, 2000);
      } else {
        toast.error(data.error || copy.codeInvalid);
      }
    } catch (error) {
      console.error("Error activating code:", error);
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
              {copy.genericTitle}
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

  const Icon = codeTypeInfo?.icon || KeyRound;
  const colorClass = codeTypeInfo?.color || "blue";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className={`inline-block p-4 bg-${colorClass}-100 dark:bg-${colorClass}-900/30 rounded-full mb-4`}>
            <Icon className={`w-12 h-12 text-${colorClass}-600 dark:text-${colorClass}-400`} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {codeTypeInfo ? codeTypeInfo.title[lang] : copy.genericTitle}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {codeTypeInfo ? codeTypeInfo.subtitle[lang] : copy.genericSubtitle}
          </p>
        </motion.div>

        {/* Activation Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-lg"
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
                        {copy.codeValid}: {validationResult.organization}
                      </p>
                      {validationResult.premiumDurationMonths && (
                        <p className="text-sm mt-1">
                          {validationResult.premiumDurationMonths} {copy.successMessageMonths}
                        </p>
                      )}
                      {!validationResult.premiumDurationMonths && validationResult.codeType !== 'beta_tester' && (
                        <p className="text-sm mt-1">{copy.successMessageLifetime}</p>
                      )}
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
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-${colorClass}-600 to-blue-600 hover:from-${colorClass}-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all`}
              >
                <Icon className="w-5 h-5" />
                {isSubmitting ? copy.activating : copy.activateButton}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
