"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Lightbulb,
  Target,
  AlertTriangle,
  Zap,
} from "lucide-react";

/**
 * AIGapFillExercise - An AI-powered gap-fill exercise with hints
 *
 * @param {Object} props
 * @param {Array} props.sentences - Array of sentences with { id, text, correct_answers[], context? }
 * @param {string} props.lessonId - Lesson identifier for hint context
 * @param {Function} props.onComplete - Callback when all sentences are complete (receives XP score)
 * @param {string} props.hintApiEndpoint - API endpoint for AI hints (default: "/api/ai-feedback")
 * @param {number} props.maxHintsPerGap - Maximum hints allowed per gap (default: 2)
 * @param {Object} props.translations - UI text translations
 */
export default function AIGapFillExercise({
  sentences,
  lessonId,
  onComplete,
  hintApiEndpoint = "/api/ai-feedback",
  maxHintsPerGap = 2,
  translations = {},
}) {
  const t = {
    title: "Complete the Sentences",
    instructions: 'Fill in the blanks with the correct words. Use the "Get Hint" button if you need help.',
    fillInBlank: "Fill in the blank",
    check: "Check",
    getHint: "Get Hint",
    anotherHint: "Another Hint",
    noMoreHints: "No More Hints",
    hintsUsed: "hints used",
    viewAllHints: "View all hints",
    context: "Context",
    try: "Try",
    excellentWork: "Excellent work! You've completed all the sentences.",
    noHintsMessage: "Amazing! You completed everything without using any hints! 🏆",
    fewHintsMessage: "Great work! You used hints wisely and learned effectively! ⭐",
    manyHintsMessage: "Good job completing the exercise! Keep practicing to build confidence! 💪",
    totalHintsUsed: "Total hints used",
    finalHintWarning: "This was your final hint for this gap. Think carefully!",
    ...translations,
  };

  const [answers, setAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState({});
  const [hints, setHints] = useState({});
  const [loadingHint, setLoadingHint] = useState({});
  const [attempts, setAttempts] = useState({});
  const [completed, setCompleted] = useState(false);
  const [hintUsage, setHintUsage] = useState({});
  const [hintHistory, setHintHistory] = useState({});

  const handleInputChange = (sentenceId, value) => {
    setAnswers((prev) => ({ ...prev, [sentenceId]: value }));
    if (showFeedback[sentenceId]) {
      setShowFeedback((prev) => ({ ...prev, [sentenceId]: false }));
    }
  };

  const checkAnswer = (sentenceId, correctAnswers) => {
    const userAnswer = answers[sentenceId]?.trim().toLowerCase() || "";
    const isCorrect = correctAnswers.some(
      (answer) => answer.toLowerCase() === userAnswer
    );

    setShowFeedback((prev) => ({
      ...prev,
      [sentenceId]: { isCorrect, answer: correctAnswers[0] },
    }));

    setAttempts((prev) => ({
      ...prev,
      [sentenceId]: (prev[sentenceId] || 0) + 1,
    }));

    // Check if all complete
    const allAnswered = sentences.every(
      (s) => showFeedback[s.id]?.isCorrect || (s.id === sentenceId && isCorrect)
    );

    if (allAnswered && !completed) {
      setCompleted(true);
      const totalAttempts = Object.values(attempts).reduce((a, b) => a + b, 0);
      const totalHints = Object.values(hintUsage).reduce((a, b) => a + b, 0);
      const baseXP = 100;
      const attemptPenalty = Math.min(totalAttempts * 5, 30);
      const hintPenalty = Math.min(totalHints * 10, 40);
      const finalXP = Math.max(baseXP - attemptPenalty - hintPenalty, 30);

      if (onComplete) {
        setTimeout(() => onComplete(finalXP), 1000);
      }
    }

    return isCorrect;
  };

  const getAIHint = async (sentenceId, sentence) => {
    const currentHintCount = hintUsage[sentenceId] || 0;
    if (currentHintCount >= maxHintsPerGap) return;

    setLoadingHint((prev) => ({ ...prev, [sentenceId]: true }));

    try {
      const hintLevel = currentHintCount + 1;
      let contextPrompt = "";

      if (hintLevel === 1) {
        contextPrompt = `This is a sentence: "${sentence.text}".
          Give a helpful first hint about what type of word fits here (noun, verb, adjective).
          Be encouraging and educational but don't reveal the answer.`;
      } else {
        contextPrompt = `This is the second hint for: "${sentence.text}".
          The student still needs help. Give a more specific clue about the meaning or context,
          but still don't give away the exact answer. Be supportive.`;
      }

      const response = await fetch(hintApiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "gap_fill",
          content: sentence.text,
          context: contextPrompt,
          lessonId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newHint = data.feedback;
        setHintUsage((prev) => ({ ...prev, [sentenceId]: currentHintCount + 1 }));
        setHintHistory((prev) => ({
          ...prev,
          [sentenceId]: [...(prev[sentenceId] || []), newHint],
        }));
        setHints((prev) => ({ ...prev, [sentenceId]: newHint }));
      }
    } catch (error) {
      console.error("Error getting hint:", error);
      const fallbackHint = currentHintCount === 0
        ? "Think about what type of word would make sense here. Is it an action (verb), person/thing (noun), or description (adjective)?"
        : "Consider the context of the sentence and what would commonly happen in situations like this.";

      setHintUsage((prev) => ({ ...prev, [sentenceId]: currentHintCount + 1 }));
      setHints((prev) => ({ ...prev, [sentenceId]: fallbackHint }));
    } finally {
      setLoadingHint((prev) => ({ ...prev, [sentenceId]: false }));
    }
  };

  const getHintButtonText = (sentenceId) => {
    const usedHints = hintUsage[sentenceId] || 0;
    if (usedHints === 0) return t.getHint;
    if (usedHints < maxHintsPerGap) return t.anotherHint;
    return t.noMoreHints;
  };

  const getTotalHintsUsed = () => Object.values(hintUsage).reduce((total, count) => total + count, 0);

  const getPerformanceMessage = () => {
    const totalHints = getTotalHintsUsed();
    if (totalHints === 0) return t.noHintsMessage;
    if (totalHints <= 2) return t.fewHintsMessage;
    return t.manyHintsMessage;
  };

  const renderSentenceWithGap = (sentence) => {
    const parts = sentence.text.split("___");
    const sentenceId = sentence.id;
    const feedback = showFeedback[sentenceId];
    const usedHints = hintUsage[sentenceId] || 0;
    const hasUsedAllHints = usedHints >= maxHintsPerGap;

    return (
      <div key={sentenceId} className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.fillInBlank}</span>
          </div>
          {usedHints > 0 && (
            <div className="flex items-center space-x-1">
              <Lightbulb className={`w-4 h-4 ${hasUsedAllHints ? "text-orange-500" : "text-yellow-500"}`} />
              <span className={`text-xs font-medium ${hasUsedAllHints ? "text-orange-600" : "text-yellow-600"}`}>
                {usedHints}/{maxHintsPerGap} {t.hintsUsed}
              </span>
            </div>
          )}
        </div>

        <div className="text-lg text-gray-900 dark:text-white leading-relaxed">
          {parts[0]}
          <input
            type="text"
            value={answers[sentenceId] || ""}
            onChange={(e) => handleInputChange(sentenceId, e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && checkAnswer(sentenceId, sentence.correct_answers)}
            className={`mx-2 px-3 py-1 border-b-2 bg-transparent focus:outline-none transition-colors min-w-[120px]
              ${feedback?.isCorrect ? "border-green-500 text-green-600"
                : feedback?.isCorrect === false ? "border-red-500 text-red-600"
                : usedHints > 0 ? "border-yellow-400 dark:border-yellow-600"
                : "border-gray-400 dark:border-gray-600 focus:border-blue-500"}`}
            placeholder="..."
            disabled={feedback?.isCorrect}
          />
          {parts[1]}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            {!feedback?.isCorrect && (
              <>
                <button
                  onClick={() => checkAnswer(sentenceId, sentence.correct_answers)}
                  disabled={!answers[sentenceId]?.trim()}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors
                    ${answers[sentenceId]?.trim() ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                >
                  {t.check}
                </button>
                <button
                  onClick={() => getAIHint(sentenceId, sentence)}
                  disabled={hasUsedAllHints || loadingHint[sentenceId]}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1
                    ${hasUsedAllHints ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : usedHints === 1 ? "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-400"
                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400"}`}
                >
                  {loadingHint[sentenceId] ? <Loader2 className="w-3 h-3 animate-spin" />
                    : hasUsedAllHints ? <AlertTriangle className="w-3 h-3" />
                    : usedHints === 1 ? <Zap className="w-3 h-3" />
                    : <HelpCircle className="w-3 h-3" />}
                  <span>{getHintButtonText(sentenceId)}</span>
                </button>
              </>
            )}
          </div>

          {feedback && (
            <div className="flex items-center space-x-2">
              {feedback.isCorrect ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  {usedHints > 0 && <span className="text-xs text-gray-500">({usedHints} hint{usedHints > 1 ? "s" : ""} used)</span>}
                </div>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t.try}: {feedback.answer}</span>
                </>
              )}
            </div>
          )}
        </div>

        {hints[sentenceId] && (
          <div className={`mt-3 p-3 rounded border ${usedHints === 1
            ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
            : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"}`}>
            <div className="flex items-start space-x-2">
              <Lightbulb className={`w-4 h-4 flex-shrink-0 mt-0.5 ${usedHints === 1 ? "text-yellow-600" : "text-orange-600"}`} />
              <div className="flex-1">
                <p className={`text-sm ${usedHints === 1 ? "text-yellow-800 dark:text-yellow-300" : "text-orange-800 dark:text-orange-300"}`}>
                  <strong>Hint {usedHints}:</strong> {hints[sentenceId]}
                </p>
                {hasUsedAllHints && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 italic">{t.finalHintWarning}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {hintHistory[sentenceId]?.length > 1 && (
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800">
              {t.viewAllHints} ({hintHistory[sentenceId].length})
            </summary>
            <div className="mt-2 space-y-2 pl-4">
              {hintHistory[sentenceId].map((hint, index) => (
                <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Hint {index + 1}:</strong> {hint}
                </div>
              ))}
            </div>
          </details>
        )}

        {sentence.context && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
            {t.context}: {sentence.context}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t.title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{t.instructions}</p>
      </div>

      {sentences.map((sentence) => renderSentenceWithGap(sentence))}

      {completed && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-300 font-medium">{t.excellentWork}</p>
          </div>
          <p className="text-sm text-green-700 dark:text-green-400">{getPerformanceMessage()}</p>
          {getTotalHintsUsed() > 0 && (
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">{t.totalHintsUsed}: {getTotalHintsUsed()}</p>
          )}
        </div>
      )}
    </div>
  );
}
