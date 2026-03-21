"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Target,
  Sparkles,
  Play,
  Pause,
} from "lucide-react";

/**
 * AIWritingExercise - An AI-powered writing exercise with feedback
 *
 * @param {Object} props
 * @param {string} props.prompt - The writing prompt/task
 * @param {string} props.example - Example text to help user
 * @param {string} props.lessonId - Lesson identifier
 * @param {Function} props.onComplete - Callback when exercise is complete (receives XP score)
 * @param {number} props.minWords - Minimum words required (default: 20)
 * @param {number} props.maxWords - Maximum words allowed (default: 200)
 * @param {string} props.englishVariant - English accent variant for TTS (default: "british")
 * @param {string} props.voiceGender - Voice gender for TTS (default: "male")
 * @param {string} props.feedbackApiEndpoint - API endpoint for AI feedback (default: "/api/ai-feedback")
 * @param {string} props.ttsApiEndpoint - API endpoint for text-to-speech (default: "/api/tts")
 * @param {Object} props.translations - UI text translations
 */
export default function AIWritingExercise({
  prompt,
  example,
  lessonId,
  onComplete,
  minWords = 20,
  maxWords = 200,
  englishVariant = "british",
  voiceGender = "male",
  feedbackApiEndpoint = "/api/ai-feedback",
  ttsApiEndpoint = "/api/tts",
  translations = {},
}) {
  const t = {
    writing_task: "Writing Task",
    write_words: "Write",
    words: "words",
    start_writing: "Start writing here...",
    need_more_words: "Need more words",
    analyzing: "Analyzing...",
    submit_for_feedback: "Submit for Feedback",
    try_again: "Try Again",
    ai_feedback: "AI Feedback",
    grammar_notes: "Grammar Notes",
    vocabulary_suggestions: "Vocabulary Suggestions",
    overall_clarity: "Overall Clarity",
    next_steps: "Next Steps",
    you_demonstrated_excellent: "Excellent work! You demonstrated great understanding.",
    continue: "Continue",
    continue_anyway: "Continue Anyway",
    ...translations,
  };

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);

  // Storage key for persisting content
  const storageKey = `ai-writing-${lessonId}-${prompt?.substring(0, 50) || "default"}`;

  // Load saved content on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const savedText = localStorage.getItem(storageKey);
        if (savedText && !showFeedback) {
          setText(savedText);
          setWordCount(
            savedText
              .trim()
              .split(/\s+/)
              .filter((word) => word.length > 0).length
          );
        }
      }
    } catch (error) {
      console.error("Error loading saved text:", error);
    }
  }, [storageKey, showFeedback]);

  // Save content as user types
  useEffect(() => {
    if (text && !showFeedback && typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, text);
      } catch (error) {
        console.error("Error saving text:", error);
      }
    }
  }, [text, storageKey, showFeedback]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    setWordCount(
      newText
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length
    );
  };

  const submitForFeedback = async () => {
    if (wordCount < minWords) {
      alert(`Please write at least ${minWords} words.`);
      return;
    }

    setLoading(true);
    setShowFeedback(false);

    try {
      const response = await fetch(feedbackApiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "writing",
          content: text,
          context: prompt,
          lessonId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        let analysis;

        try {
          if (
            data.analysis &&
            typeof data.analysis === "object" &&
            !Array.isArray(data.analysis)
          ) {
            analysis = data.analysis;
          } else if (data.feedback && typeof data.feedback === "string") {
            try {
              analysis = JSON.parse(data.feedback);
            } catch {
              analysis = {
                score: 7,
                feedback: data.feedback,
                clarity: data.feedback,
                grammar: [],
                vocabulary: [],
                improvements: ["Continue practicing writing in English"],
                encouragement: "Great effort! Keep practicing to improve your English skills.",
              };
            }
          } else if (data.feedback && typeof data.feedback === "object") {
            analysis = data.feedback;
          } else {
            analysis = {
              score: 7,
              feedback: "Good work! Your writing shows understanding of the topic.",
              clarity: "Your writing demonstrates good comprehension.",
              grammar: [],
              vocabulary: [],
              improvements: ["Continue practicing writing in English"],
              encouragement: "Great effort! Keep practicing to improve your English skills.",
            };
          }

          if (typeof analysis.score !== "number" || analysis.score < 1 || analysis.score > 10) {
            analysis.score = 7;
          }
        } catch {
          analysis = {
            score: 7,
            feedback: data.feedback || "Good work!",
            clarity: "Your writing shows good understanding.",
            grammar: [],
            vocabulary: [],
            improvements: ["Continue practicing writing in English"],
            encouragement: "Great effort! Keep practicing to improve your English skills.",
          };
        }

        setFeedback(analysis);
        setShowFeedback(true);
      } else {
        console.error("AI feedback failed:", data);
        alert(`Failed to get feedback: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error getting feedback:", error);
      alert("Failed to get feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tryAgain = () => {
    setText("");
    setFeedback(null);
    setShowFeedback(false);
    setWordCount(0);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error("Error clearing saved text:", error);
    }
  };

  const speakText = async (textToSpeak) => {
    if (playingAudio) {
      speechSynthesis.cancel();
      setPlayingAudio(false);
      return;
    }

    try {
      const response = await fetch(ttsApiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSpeak,
          englishVariant,
          voiceGender,
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        setPlayingAudio(true);

        audio.onended = () => {
          setPlayingAudio(false);
          URL.revokeObjectURL(audioUrl);
        };

        audio.play();
      } else {
        throw new Error("TTS API not available");
      }
    } catch {
      // Fallback to browser TTS
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = "en-GB";
        utterance.rate = 0.9;

        setPlayingAudio(true);

        utterance.onend = () => {
          setPlayingAudio(false);
        };

        speechSynthesis.speak(utterance);
      }
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const clearStorageAndComplete = (xp) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error("Error clearing saved text:", error);
    }
    if (onComplete) {
      onComplete(xp);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Writing Prompt */}
      <div className="bg-primary-50 dark:bg-accent-900/20 border border-primary-200 dark:border-accent-800 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <BookOpen className="w-6 h-6 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {t.writing_task}
              </h3>
              <p className="text-gray-800 dark:text-gray-300 pb-2">{prompt}</p>
              {example && (
                <p className="text-accent-800 dark:text-accent-300 font-bold">
                  {example}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {t.write_words} {minWords}-{maxWords} {t.words}
              </p>
            </div>
          </div>
          <button
            onClick={() => speakText(prompt)}
            className="p-2 bg-white hover:bg-accent-100 dark:bg-accent-900/30 dark:hover:bg-accent-900/50
                     rounded-lg transition-colors flex items-center space-x-1 ml-4"
            title="Listen to prompt"
          >
            {playingAudio ? (
              <Pause className="w-4 h-4 text-accent-600 dark:text-accent-400" />
            ) : (
              <Play className="w-4 h-4 text-accent-600 dark:text-accent-400" />
            )}
          </button>
        </div>
      </div>

      {/* Writing Area */}
      <div className="mb-6">
        <div className="relative">
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder={t.start_writing}
            className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={loading || showFeedback}
          />
          <div className="absolute bottom-2 right-2 text-sm text-gray-500">
            {wordCount} words
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {wordCount < minWords && (
              <span className="text-orange-600">
                {t.need_more_words}: {minWords - wordCount} {t.words}
              </span>
            )}
          </div>
          <div className="space-x-3">
            {showFeedback ? (
              <button
                onClick={tryAgain}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                         rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors
                         flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t.try_again}</span>
              </button>
            ) : (
              <button
                onClick={submitForFeedback}
                disabled={loading || wordCount < minWords}
                className={`px-6 py-2 rounded-lg font-medium transition-all
                  ${
                    wordCount >= minWords
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  } flex items-center space-x-2`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.analyzing}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t.submit_for_feedback}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Feedback Display */}
      {showFeedback && feedback && (
        <div className="space-y-4 animate-fadeIn">
          {/* Score */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span>{t.ai_feedback}</span>
              </h4>
              {feedback.score && (
                <div className={`text-3xl font-bold ${getScoreColor(feedback.score)}`}>
                  {feedback.score}/10
                </div>
              )}
            </div>

            {/* Grammar Feedback */}
            {feedback.grammar && Array.isArray(feedback.grammar) && feedback.grammar.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span>{t.grammar_notes}</span>
                </h5>
                <ul className="space-y-2">
                  {feedback.grammar.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                      {item.error && item.correction ? (
                        <>
                          <span className="line-through text-red-500">{item.error}</span>
                          {" → "}
                          <span className="text-green-600 dark:text-green-400">{item.correction}</span>
                          {item.explanation && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {item.explanation}
                            </p>
                          )}
                        </>
                      ) : (
                        <span>{typeof item === "string" ? item : JSON.stringify(item)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Vocabulary Suggestions */}
            {feedback.vocabulary && Array.isArray(feedback.vocabulary) && feedback.vocabulary.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>{t.vocabulary_suggestions}</span>
                </h5>
                <ul className="space-y-2">
                  {feedback.vocabulary.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                      {item.original && item.suggestion ? (
                        <>
                          <span className="font-medium">{item.original}</span>
                          {" → "}
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {item.suggestion}
                          </span>
                          {item.reason && (
                            <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                              ({item.reason})
                            </span>
                          )}
                        </>
                      ) : (
                        <span>{typeof item === "string" ? item : JSON.stringify(item)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Overall Clarity */}
            {feedback.clarity && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                  {t.overall_clarity}
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">{feedback.clarity}</p>
              </div>
            )}

            {/* Improvements */}
            {feedback.improvements && Array.isArray(feedback.improvements) && feedback.improvements.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                  <Target className="w-4 h-4 text-purple-500" />
                  <span>{t.next_steps}</span>
                </h5>
                <ul className="space-y-1">
                  {feedback.improvements.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Encouragement */}
            {feedback.encouragement && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-300 flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{feedback.encouragement}</span>
                </p>
              </div>
            )}

            {/* Fallback display */}
            {(!feedback.grammar || feedback.grammar.length === 0) &&
              (!feedback.vocabulary || feedback.vocabulary.length === 0) &&
              !feedback.clarity &&
              (!feedback.improvements || feedback.improvements.length === 0) &&
              !feedback.encouragement &&
              feedback.feedback && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {feedback.feedback}
                  </div>
                </div>
              )}
          </div>

          {/* Action buttons after feedback */}
          <div className="flex justify-center space-x-4">
            {feedback.score && feedback.score >= 7 ? (
              <div className="text-center space-y-4">
                <p className="text-green-600 dark:text-green-400 font-medium">
                  {t.you_demonstrated_excellent}
                </p>
                <button
                  onClick={() => clearStorageAndComplete(feedback.score * 10)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{t.continue}</span>
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <button
                  onClick={tryAgain}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t.try_again}</span>
                </button>
                <button
                  onClick={() => clearStorageAndComplete(Math.max((feedback.score || 5) * 10, 50))}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{t.continue_anyway}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
