"use client";

import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Lightbulb,
  Target,
  AlertTriangle,
  Zap,
  Play,
  Pause,
} from "lucide-react";

/**
 * AIMultipleChoiceGapFill - Multiple choice gap fill exercise with AI hints
 *
 * @param {Object} props
 * @param {Array} props.sentences - Array of { id, text, correct_answer or correct_answers[], options[]?, context? }
 * @param {string} props.lessonId - Lesson identifier
 * @param {Function} props.onComplete - Callback when exercise is complete (receives XP score)
 * @param {string} props.englishVariant - English accent variant for TTS (default: "british")
 * @param {string} props.voiceGender - Voice gender for TTS (default: "male")
 * @param {string} props.hintApiEndpoint - API endpoint for AI hints (default: "/api/ai-feedback")
 * @param {string} props.ttsApiEndpoint - API endpoint for text-to-speech (default: "/api/tts")
 * @param {number} props.maxHintsPerGap - Maximum hints per gap (default: 2)
 * @param {Object} props.translations - UI text translations
 */
export default function AIMultipleChoiceGapFill({
  sentences,
  lessonId,
  onComplete,
  englishVariant = "british",
  voiceGender = "male",
  hintApiEndpoint = "/api/ai-feedback",
  ttsApiEndpoint = "/api/tts",
  maxHintsPerGap = 2,
  translations = {},
}) {
  const t = {
    choose_best_word: "Choose the best word",
    listen_to_sentence: "Listen to sentence",
    hints_used: "hints used",
    check_answer: "Check",
    correct: "Correct!",
    incorrect: "Incorrect",
    get_hint: "Get Hint",
    another_hint: "Another Hint",
    no_more_hints: "No More Hints",
    view_all_hints: "View all hints",
    final_hint_warning: "This was your final hint for this gap. Think carefully!",
    excellent_work_completed: "Excellent work! You've completed all the sentences.",
    perfect_message: "Perfect! You got everything right on the first try!",
    good_hints_message: "Great work! You used hints wisely and learned effectively!",
    keep_practicing_message: "Good job completing the exercise! Keep practicing to build confidence!",
    total_hints_used: "Total hints used",
    ...translations,
  };

  const STORAGE_KEY = `lesson-${lessonId}-aiGapFill-progress`;

  const [answers, setAnswers] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return data.answers || {};
        } catch {
          return {};
        }
      }
    }
    return {};
  });

  const [showFeedback, setShowFeedback] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return data.showFeedback || {};
        } catch {
          return {};
        }
      }
    }
    return {};
  });

  const [hints, setHints] = useState({});
  const [loadingHint, setLoadingHint] = useState({});
  const [attempts, setAttempts] = useState({});
  const [completed, setCompleted] = useState(false);
  const [playingAudio, setPlayingAudio] = useState({});
  const [hintUsage, setHintUsage] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return data.hintUsage || {};
        } catch {
          return {};
        }
      }
    }
    return {};
  });
  const [hintHistory, setHintHistory] = useState({});

  // Save progress to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && !completed) {
      const progressData = {
        answers,
        showFeedback,
        hintUsage,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
    }
  }, [answers, showFeedback, hintUsage, STORAGE_KEY, completed]);

  // Clear localStorage when completed
  useEffect(() => {
    if (completed && typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [completed, STORAGE_KEY]);

  const getOptions = (sentence) => {
    if (sentence.options && sentence.options.length >= 4) {
      return [...sentence.options].sort(() => Math.random() - 0.5);
    }

    if (sentence.correct_answers && sentence.correct_answers.length > 0) {
      const correctAnswers = sentence.correct_answers;
      const options = [...correctAnswers];

      const commonWrongOptions = {
        trial: ["test", "game", "match"],
        academy: ["school", "university", "college"],
        opportunity: ["chance", "moment", "time"],
        dream: ["wish", "hope", "goal"],
        practice: ["play", "study", "work"],
        improve: ["change", "help", "try"],
        coach: ["teacher", "manager", "captain"],
        teammates: ["friends", "players", "team"],
      };

      correctAnswers.forEach((correct) => {
        const wrongOpts = commonWrongOptions[correct.toLowerCase()];
        if (wrongOpts) {
          wrongOpts.forEach((wrong) => {
            if (!options.includes(wrong) && options.length < 4) {
              options.push(wrong);
            }
          });
        }
      });

      const genericOptions = ["play", "go", "make", "take", "good", "great", "big", "new"];
      genericOptions.forEach((opt) => {
        if (!options.includes(opt) && options.length < 4) {
          options.push(opt);
        }
      });

      return options.sort(() => Math.random() - 0.5).slice(0, 4);
    }

    return ["play", "go", "make", "take"];
  };

  const handleOptionSelect = (sentenceId, selectedOption) => {
    setAnswers((prev) => ({ ...prev, [sentenceId]: selectedOption }));
    if (showFeedback[sentenceId]) {
      setShowFeedback((prev) => ({ ...prev, [sentenceId]: false }));
    }
  };

  const checkAnswer = (sentenceId, sentence) => {
    const userAnswer = answers[sentenceId]?.trim().toLowerCase() || "";

    let correctAnswers;
    if (sentence.correct_answer) {
      correctAnswers = [sentence.correct_answer];
    } else if (sentence.correct_answers) {
      correctAnswers = sentence.correct_answers;
    } else {
      correctAnswers = [];
    }

    const isCorrect = correctAnswers.some((answer) => answer.toLowerCase() === userAnswer);

    setShowFeedback((prev) => ({
      ...prev,
      [sentenceId]: { isCorrect, answer: correctAnswers[0] },
    }));

    setAttempts((prev) => ({
      ...prev,
      [sentenceId]: (prev[sentenceId] || 0) + 1,
    }));

    const allAnswered = sentences.every((s) => showFeedback[s.id]?.isCorrect || (s.id === sentenceId && isCorrect));

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
      const fallbackHint =
        currentHintCount === 0
          ? "Think about what type of word would make sense here. Is it an action (verb), person/thing (noun), or description (adjective)?"
          : "Consider the context of the sentence.";

      setHintUsage((prev) => ({ ...prev, [sentenceId]: currentHintCount + 1 }));
      setHints((prev) => ({ ...prev, [sentenceId]: fallbackHint }));
    } finally {
      setLoadingHint((prev) => ({ ...prev, [sentenceId]: false }));
    }
  };

  const speakText = async (text, sentenceId) => {
    if (playingAudio[sentenceId]) {
      speechSynthesis.cancel();
      setPlayingAudio((prev) => ({ ...prev, [sentenceId]: false }));
      return;
    }

    try {
      const response = await fetch(ttsApiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, englishVariant, voiceGender }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        setPlayingAudio((prev) => ({ ...prev, [sentenceId]: true }));

        audio.onended = () => {
          setPlayingAudio((prev) => ({ ...prev, [sentenceId]: false }));
          URL.revokeObjectURL(audioUrl);
        };

        audio.play();
      } else {
        throw new Error("TTS API not available");
      }
    } catch {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = englishVariant === "british" ? "en-GB" : "en-US";
        utterance.rate = 0.9;

        setPlayingAudio((prev) => ({ ...prev, [sentenceId]: true }));

        utterance.onend = () => {
          setPlayingAudio((prev) => ({ ...prev, [sentenceId]: false }));
        };

        speechSynthesis.speak(utterance);
      }
    }
  };

  const getHintButtonText = (sentenceId) => {
    const usedHints = hintUsage[sentenceId] || 0;
    if (usedHints === 0) return t.get_hint;
    if (usedHints < maxHintsPerGap) return t.another_hint;
    return t.no_more_hints;
  };

  const getTotalHintsUsed = () => Object.values(hintUsage).reduce((total, count) => total + count, 0);

  const getPerformanceMessage = () => {
    const totalHints = getTotalHintsUsed();
    const totalAttempts = Object.values(attempts).reduce((a, b) => a + b, 0);

    if (totalHints === 0 && totalAttempts === sentences.length) {
      return t.perfect_message;
    } else if (totalHints <= 2) {
      return t.good_hints_message;
    }
    return t.keep_practicing_message;
  };

  const renderSentenceWithOptions = (sentence) => {
    const parts = sentence.text.split("___");
    const sentenceId = sentence.id;
    const feedback = showFeedback[sentenceId];
    const usedHints = hintUsage[sentenceId] || 0;
    const hasUsedAllHints = usedHints >= maxHintsPerGap;
    const options = getOptions(sentence);
    const selectedOption = answers[sentenceId];

    return (
      <div
        key={sentenceId}
        className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.choose_best_word}
            </span>
          </div>

          <button
            onClick={() =>
              speakText(sentence.text.replace("___", selectedOption || "[blank]"), sentenceId)
            }
            className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50
                     rounded-lg transition-colors flex items-center space-x-1"
            title={t.listen_to_sentence}
          >
            {playingAudio[sentenceId] ? (
              <Pause className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <Play className="w-4 h-4 text-green-600 dark:text-green-400" />
            )}
          </button>
        </div>

        <div className="text-lg text-primary-900 dark:text-white leading-relaxed mb-4">
          {parts[0]}
          <span
            className={`mx-2 px-3 py-1 rounded-2xl border-r-2 border-b-2 transition-colors min-w-[120px] inline-block text-center
            ${
              feedback?.isCorrect
                ? "border-accent-400 bg-accent-100 dark:border-accent-600 dark:bg-accent-200 text-accent-900"
                : feedback?.isCorrect === false
                ? "border-red-500 bg-red-100 text-red-700"
                : selectedOption
                ? "border-primary-500 bg-primary-50 text-primary-800"
                : "border-gray-300 bg-gray-50 text-gray-400"
            }`}
          >
            {selectedOption || "....."}
          </span>
          {parts[1]}
        </div>

        {!feedback?.isCorrect && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(sentenceId, option)}
                className={`p-3 rounded-2xl border-r-2 border-b-2 transition-all text-left
                  ${
                    selectedOption === option
                      ? "border-r-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20 hover:translate-x-1 text-primary-800 dark:text-primary-300"
                      : "border-r-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:translate-x-1 bg-white dark:bg-gray-700 dark:text-white"
                  }`}
              >
                <span className="font-medium">{option}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mt-4">
          <div className="flex items-center space-x-2">
            {!feedback?.isCorrect && selectedOption && (
              <button
                onClick={() => checkAnswer(sentenceId, sentence)}
                className="rounded-2xl border-2 transition-all text-left px-4 py-1 border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 hover:scale-105 font-medium"
              >
                {t.check_answer}
              </button>
            )}
          </div>

          {feedback && (
            <div className="flex items-center space-x-2">
              {feedback.isCorrect ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    {t.correct}
                  </span>
                  {usedHints > 0 && (
                    <span className="text-xs text-gray-500">
                      ({usedHints} hint{usedHints > 1 ? "s" : ""} used)
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <div className="text-sm">
                    <span className="text-red-600 dark:text-red-400">{t.incorrect}. </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Correct answer: <strong>{feedback.answer}</strong>
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {hints[sentenceId] && (
          <div
            className={`mt-3 p-3 rounded-xl border ${
              usedHints === 1
                ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
            }`}
          >
            <div className="flex items-start space-x-2">
              <Lightbulb
                className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  usedHints === 1 ? "text-yellow-600" : "text-orange-600"
                }`}
              />
              <div className="flex-1">
                <p
                  className={`text-sm ${
                    usedHints === 1 ? "text-yellow-800 dark:text-yellow-300" : "text-orange-800 dark:text-orange-300"
                  }`}
                >
                  <strong>Hint {usedHints}:</strong> {hints[sentenceId]}
                </p>
                {hasUsedAllHints && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 italic">
                    {t.final_hint_warning}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {hintHistory[sentenceId] && hintHistory[sentenceId].length > 1 && (
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800">
              {t.view_all_hints} ({hintHistory[sentenceId].length})
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
            Context: {sentence.context}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      {sentences.map((sentence) => renderSentenceWithOptions(sentence))}

      {completed && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-300 font-medium">
              {t.excellent_work_completed}
            </p>
          </div>
          <p className="text-sm text-green-700 dark:text-green-400">{getPerformanceMessage()}</p>
          {getTotalHintsUsed() > 0 && (
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">
              {t.total_hints_used}: {getTotalHintsUsed()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
