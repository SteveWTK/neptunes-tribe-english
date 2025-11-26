"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Star,
  Send,
  MessageSquare,
  Sparkles,
  Lightbulb,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import Link from "next/link";

/**
 * Detailed Feedback Page
 * Comprehensive feedback form with categorized sections
 */
export default function FeedbackPage() {
  const { data: session, status } = useSession();
  const { lang } = useLanguage();
  const pathname = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = {
    en: {
      title: "We Value Your Feedback",
      subtitle: "Help us improve Habitat English! Share your experience with the activities, content, and platform. Nothing is required - share as much or as little as you'd like.",

      // Section titles
      contentQuality: "Content Quality",
      easeOfUse: "Ease of Use",
      learningEffectiveness: "Learning Effectiveness",
      technicalPerformance: "Technical Performance",
      tellUsMore: "Tell Us More",

      // Rating labels
      contentRatingLabel: "Were the activities engaging and relevant?",
      easeRatingLabel: "Was the platform easy to navigate?",
      learningRatingLabel: "Did you feel you were learning effectively?",
      technicalRatingLabel: "Did everything work smoothly?",

      // Comment labels
      additionalThoughts: "Additional thoughts (optional)",
      contentPlaceholder: "Share your thoughts on the lessons, vocabulary, games, etc.",
      easePlaceholder: "How was your experience navigating the site?",
      learningPlaceholder: "Did the activities help you learn? Any suggestions?",
      technicalPlaceholder: "Any bugs, slow loading, or technical issues?",

      // Open-ended questions
      enjoyedLabel: "What did you enjoy most? (optional)",
      enjoyedPlaceholder: "What aspects of Habitat English did you find most valuable or enjoyable?",
      improvedLabel: "What could be improved? (optional)",
      improvedPlaceholder: "What would make your experience better?",
      featuresLabel: "Any specific features or content you'd like to see? (optional)",
      featuresPlaceholder: "New topics, activities, or features you'd find helpful",
      generalLabel: "General comments (optional)",
      generalPlaceholder: "Anything else you'd like to share?",

      // Actions
      submit: "Submit Feedback",
      submitting: "Submitting...",
      signInPrompt: "Please sign in to submit feedback",
      signInButton: "Sign In",
      allOptional: "All fields are optional. Share as much or as little as you'd like!",

      // Toast messages
      thankYou: "Thank you for your detailed feedback!",
      thankYouDesc: "Your insights are invaluable to improving Habitat English",
      provideRatingOrComment: "Please provide at least one rating or comment",
      error: "Something went wrong. Please try again.",
      loading: "Loading...",
    },
    pt: {
      title: "Valorizamos Seu Feedback",
      subtitle: "Ajude-nos a melhorar o Habitat English! Compartilhe sua experiência com as atividades, conteúdo e plataforma. Nada é obrigatório - compartilhe o quanto quiser!",

      // Section titles
      contentQuality: "Qualidade do Conteúdo",
      easeOfUse: "Facilidade de Uso",
      learningEffectiveness: "Eficácia do Aprendizado",
      technicalPerformance: "Desempenho Técnico",
      tellUsMore: "Conte-nos Mais",

      // Rating labels
      contentRatingLabel: "As atividades foram envolventes e relevantes?",
      easeRatingLabel: "A plataforma foi fácil de navegar?",
      learningRatingLabel: "Você sentiu que estava aprendendo efetivamente?",
      technicalRatingLabel: "Tudo funcionou bem?",

      // Comment labels
      additionalThoughts: "Pensamentos adicionais (opcional)",
      contentPlaceholder: "Compartilhe seus pensamentos sobre as lições, vocabulário, jogos, etc.",
      easePlaceholder: "Como foi sua experiência navegando no site?",
      learningPlaceholder: "As atividades ajudaram você a aprender? Alguma sugestão?",
      technicalPlaceholder: "Algum erro, carregamento lento ou problemas técnicos?",

      // Open-ended questions
      enjoyedLabel: "O que você mais gostou? (opcional)",
      enjoyedPlaceholder: "Quais aspectos do Habitat English você achou mais valiosos ou agradáveis?",
      improvedLabel: "O que poderia ser melhorado? (opcional)",
      improvedPlaceholder: "O que tornaria sua experiência melhor?",
      featuresLabel: "Algum recurso ou conteúdo específico que você gostaria de ver? (opcional)",
      featuresPlaceholder: "Novos tópicos, atividades ou recursos que você acharia úteis",
      generalLabel: "Comentários gerais (opcional)",
      generalPlaceholder: "Algo mais que você gostaria de compartilhar?",

      // Actions
      submit: "Enviar Feedback",
      submitting: "Enviando...",
      signInPrompt: "Por favor, faça login para enviar feedback",
      signInButton: "Fazer Login",
      allOptional: "Todos os campos são opcionais. Compartilhe o quanto quiser!",

      // Toast messages
      thankYou: "Obrigado pelo seu feedback detalhado!",
      thankYouDesc: "Seus insights são inestimáveis para melhorar o Habitat English",
      provideRatingOrComment: "Por favor, forneça pelo menos uma avaliação ou comentário",
      error: "Algo deu errado. Por favor, tente novamente.",
      loading: "Carregando...",
    },
  };

  const copy = t[lang];

  // Rating states
  const [contentQualityRating, setContentQualityRating] = useState(0);
  const [easeOfUseRating, setEaseOfUseRating] = useState(0);
  const [learningEffectivenessRating, setLearningEffectivenessRating] =
    useState(0);
  const [technicalPerformanceRating, setTechnicalPerformanceRating] =
    useState(0);

  // Comment states
  const [contentQualityComment, setContentQualityComment] = useState("");
  const [easeOfUseComment, setEaseOfUseComment] = useState("");
  const [learningEffectivenessComment, setLearningEffectivenessComment] =
    useState("");
  const [technicalPerformanceComment, setTechnicalPerformanceComment] =
    useState("");

  // Open-ended states
  const [whatEnjoyed, setWhatEnjoyed] = useState("");
  const [whatImproved, setWhatImproved] = useState("");
  const [featureRequests, setFeatureRequests] = useState("");
  const [generalComments, setGeneralComments] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error(copy.signInPrompt);
      return;
    }

    // Check if at least something is filled
    const hasRating =
      contentQualityRating ||
      easeOfUseRating ||
      learningEffectivenessRating ||
      technicalPerformanceRating;
    const hasComment =
      contentQualityComment.trim() ||
      easeOfUseComment.trim() ||
      learningEffectivenessComment.trim() ||
      technicalPerformanceComment.trim() ||
      whatEnjoyed.trim() ||
      whatImproved.trim() ||
      featureRequests.trim() ||
      generalComments.trim();

    if (!hasRating && !hasComment) {
      toast.error(copy.provideRatingOrComment);
      return;
    }

    setIsSubmitting(true);

    try {
      const deviceType =
        window.innerWidth < 768
          ? "mobile"
          : window.innerWidth < 1024
          ? "tablet"
          : "desktop";

      const response = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackType: "detailed",

          // Ratings
          contentQualityRating: contentQualityRating || null,
          contentQualityComment: contentQualityComment || null,
          easeOfUseRating: easeOfUseRating || null,
          easeOfUseComment: easeOfUseComment || null,
          learningEffectivenessRating: learningEffectivenessRating || null,
          learningEffectivenessComment: learningEffectivenessComment || null,
          technicalPerformanceRating: technicalPerformanceRating || null,
          technicalPerformanceComment: technicalPerformanceComment || null,

          // Open-ended
          whatEnjoyed: whatEnjoyed || null,
          whatImproved: whatImproved || null,
          featureRequests: featureRequests || null,
          generalComments: generalComments || null,

          // Context
          currentPage: pathname,
          deviceType,
          browser: navigator.userAgent,
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Celebration!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        toast.success(copy.thankYou, {
          description: copy.thankYouDesc,
          duration: 5000,
        });

        // Reset form
        setContentQualityRating(0);
        setEaseOfUseRating(0);
        setLearningEffectivenessRating(0);
        setTechnicalPerformanceRating(0);
        setContentQualityComment("");
        setEaseOfUseComment("");
        setLearningEffectivenessComment("");
        setTechnicalPerformanceComment("");
        setWhatEnjoyed("");
        setWhatImproved("");
        setFeatureRequests("");
        setGeneralComments("");
      } else {
        toast.error(data.error || copy.error);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error(copy.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, label }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={`w-8 h-8 ${
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
            <MessageSquare className="w-12 h-12 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {copy.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {copy.subtitle}
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8"
        >
          {/* Section 1: Content Quality */}
          <div className="space-y-4 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {copy.contentQuality}
              </h2>
            </div>
            <StarRating
              value={contentQualityRating}
              onChange={setContentQualityRating}
              label={copy.contentRatingLabel}
            />
            <div>
              <label
                htmlFor="content-comment"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {copy.additionalThoughts}
              </label>
              <textarea
                id="content-comment"
                value={contentQualityComment}
                onChange={(e) => setContentQualityComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder={copy.contentPlaceholder}
              />
            </div>
          </div>

          {/* Section 2: Ease of Use */}
          <div className="space-y-4 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {copy.easeOfUse}
              </h2>
            </div>
            <StarRating
              value={easeOfUseRating}
              onChange={setEaseOfUseRating}
              label={copy.easeRatingLabel}
            />
            <div>
              <label
                htmlFor="ease-comment"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {copy.additionalThoughts}
              </label>
              <textarea
                id="ease-comment"
                value={easeOfUseComment}
                onChange={(e) => setEaseOfUseComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder={copy.easePlaceholder}
              />
            </div>
          </div>

          {/* Section 3: Learning Effectiveness */}
          <div className="space-y-4 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-6 h-6 text-yellow-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {copy.learningEffectiveness}
              </h2>
            </div>
            <StarRating
              value={learningEffectivenessRating}
              onChange={setLearningEffectivenessRating}
              label={copy.learningRatingLabel}
            />
            <div>
              <label
                htmlFor="learning-comment"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {copy.additionalThoughts}
              </label>
              <textarea
                id="learning-comment"
                value={learningEffectivenessComment}
                onChange={(e) =>
                  setLearningEffectivenessComment(e.target.value)
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder={copy.learningPlaceholder}
              />
            </div>
          </div>

          {/* Section 4: Technical Performance */}
          <div className="space-y-4 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {copy.technicalPerformance}
              </h2>
            </div>
            <StarRating
              value={technicalPerformanceRating}
              onChange={setTechnicalPerformanceRating}
              label={copy.technicalRatingLabel}
            />
            <div>
              <label
                htmlFor="technical-comment"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {copy.additionalThoughts}
              </label>
              <textarea
                id="technical-comment"
                value={technicalPerformanceComment}
                onChange={(e) => setTechnicalPerformanceComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder={copy.technicalPlaceholder}
              />
            </div>
          </div>

          {/* Open-Ended Questions */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {copy.tellUsMore}
            </h2>

            <div>
              <label
                htmlFor="enjoyed"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {copy.enjoyedLabel}
              </label>
              <textarea
                id="enjoyed"
                value={whatEnjoyed}
                onChange={(e) => setWhatEnjoyed(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder={copy.enjoyedPlaceholder}
              />
            </div>

            <div>
              <label
                htmlFor="improved"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {copy.improvedLabel}
              </label>
              <textarea
                id="improved"
                value={whatImproved}
                onChange={(e) => setWhatImproved(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder={copy.improvedPlaceholder}
              />
            </div>

            <div>
              <label
                htmlFor="features"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {copy.featuresLabel}
              </label>
              <textarea
                id="features"
                value={featureRequests}
                onChange={(e) => setFeatureRequests(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder={copy.featuresPlaceholder}
              />
            </div>

            <div>
              <label
                htmlFor="general"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {copy.generalLabel}
              </label>
              <textarea
                id="general"
                value={generalComments}
                onChange={(e) => setGeneralComments(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder={copy.generalPlaceholder}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6">
            {session?.user ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Send className="w-5 h-5" />
                {isSubmitting ? copy.submitting : copy.submit}
              </button>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {copy.signInPrompt}
                </p>
                <Link
                  href="/api/auth/signin"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {copy.signInButton}
                </Link>
              </div>
            )}
          </div>

          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            {copy.allOptional}
          </p>
        </motion.form>
      </div>
    </div>
  );
}
