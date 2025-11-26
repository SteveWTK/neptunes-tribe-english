"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useLanguage } from "@/lib/contexts/LanguageContext";

/**
 * Floating Feedback Widget - Quick feedback submission
 * Always accessible via floating button in bottom-right corner
 */
export default function FeedbackWidget() {
  const { data: session } = useSession();
  const { lang } = useLanguage();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = {
    en: {
      quickFeedback: "Quick Feedback",
      ratingLabel: "How would you rate your experience? (optional)",
      commentLabel: "Share your thoughts (optional)",
      commentPlaceholder: "What's on your mind? Any suggestions or issues?",
      sendFeedback: "Send Feedback",
      sending: "Sending...",
      detailedLink: "Or give detailed feedback",
      signInPrompt: "Please",
      signIn: "sign in",
      toSubmit: "to submit feedback",
      thankYou: "Thank you for your feedback!",
      thankYouDesc: "Your input helps us improve Habitat English",
      signInRequired: "Please sign in to submit feedback",
      provideRatingOrComment: "Please provide a rating or comment",
      error: "Something went wrong. Please try again.",
    },
    pt: {
      quickFeedback: "Feedback Rápido",
      ratingLabel: "Como você avaliaria sua experiência? (opcional)",
      commentLabel: "Compartilhe seus pensamentos (opcional)",
      commentPlaceholder: "O que você está pensando? Alguma sugestão ou problema?",
      sendFeedback: "Enviar Feedback",
      sending: "Enviando...",
      detailedLink: "Ou dê feedback detalhado",
      signInPrompt: "Por favor,",
      signIn: "faça login",
      toSubmit: "para enviar feedback",
      thankYou: "Obrigado pelo seu feedback!",
      thankYouDesc: "Sua contribuição nos ajuda a melhorar o Habitat English",
      signInRequired: "Por favor, faça login para enviar feedback",
      provideRatingOrComment: "Por favor, forneça uma avaliação ou comentário",
      error: "Algo deu errado. Por favor, tente novamente.",
    },
  };

  const copy = t[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error(copy.signInRequired);
      return;
    }

    if (!comment.trim() && rating === 0) {
      toast.error(copy.provideRatingOrComment);
      return;
    }

    setIsSubmitting(true);

    try {
      // Detect device type
      const deviceType = window.innerWidth < 768 ? "mobile" :
                        window.innerWidth < 1024 ? "tablet" : "desktop";

      const response = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackType: "quick",
          quickComment: comment,
          overallRating: rating || null,
          currentPage: pathname,
          deviceType,
          browser: navigator.userAgent,
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(copy.thankYou, {
          description: copy.thankYouDesc,
          duration: 4000,
        });
        setComment("");
        setRating(0);
        setIsOpen(false);
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

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Give feedback"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Feedback Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed bottom-6 right-6 w-[90vw] sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    <h3 className="font-bold text-lg">{copy.quickFeedback}</h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {copy.ratingLabel}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label
                    htmlFor="quick-comment"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {copy.commentLabel}
                  </label>
                  <textarea
                    id="quick-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    placeholder={copy.commentPlaceholder}
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || (!comment.trim() && rating === 0)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? copy.sending : copy.sendFeedback}
                  </button>

                  <Link href="/feedback">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="w-full px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {copy.detailedLink}
                    </button>
                  </Link>
                </div>

                {!session?.user && (
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    {copy.signInPrompt}{" "}
                    <Link
                      href="/api/auth/signin"
                      className="text-primary-600 hover:underline"
                    >
                      {copy.signIn}
                    </Link>{" "}
                    {copy.toSubmit}
                  </p>
                )}
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
