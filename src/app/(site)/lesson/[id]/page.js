// src/app/(site)/lesson/[id]/page.js - Updated with all step types
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Play,
  Pause,
  CheckCircle,
  X,
  Volume2,
  Mic,
  ArrowRight,
  Trophy,
  ArrowLeft,
  Home,
  Users,
  Target,
  Globe,
  MessageSquare,
  Star,
  Calendar,
  TrendingUp,
  BarChart3,
  AlertCircle,
  Book,
  Eye,
  Phone,
  MapPin,
  // Clock,
  Award,
  Headphones,
  Languages,
  RefreshCw,
} from "lucide-react";
import {
  getLessonById,
  markLessonComplete,
  getPlayerPreferredLanguage,
} from "@/lib/supabase/queries";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useTranslation } from "@/hooks/useTranslation";
import MultiGapFillExerciseNew from "@/components/MultiGapFillExerciseNew";
// InteractivePitch and InteractiveGame now imported from @inspire/shared below
import ConversationVote from "@/components/ConversationVote";
import {
  WordSnakeLesson,
  MemoryMatchLesson,
  VocabularyItem,
  VideoPlayer,
  FloatingFacts,
  AIGapFillExercise,
  AIWritingExercise,
  AIListeningChallenge,
  AISpeechPractice,
  AIConversationPractice,
  AIMultipleChoiceGapFill,
  InteractivePitch,
  InteractiveGame,
} from "@inspire/shared";
import UnitModal from "@/components/UnitModal";
import UnitReferenceStep from "@/components/UnitReferenceStep";
// FloatingFacts now imported from @inspire/shared above
import SingleGapFillSeries from "@/components/gapfill/SingleGapFillSeries";
import { fetchSingleGapChallenges } from "@/lib/data-service";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { WORLDS } from "@/data/worldsConfig";
import Link from "next/link";
import IUCNProgressBar from "@/components/progress/IUCNProgressBar";
import { toast } from "sonner";

function DynamicLessonContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t, userLanguage } = useTranslation(user);
  const lessonId = params.id;

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState({}); // For multiple gaps
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [cumulativeXP, setCumulativeXP] = useState(0); // Track total XP across all steps
  const [stepXP, setStepXP] = useState({}); // Track XP per step to prevent duplicate counting
  const [startTime] = useState(Date.now());
  const [completing, setCompleting] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translations, setTranslations] = useState({});
  const [translating, setTranslating] = useState(false);
  const [userPreferredLanguage, setUserPreferredLanguage] = useState("en");
  const [userEnglishVariant, setUserEnglishVariant] = useState("british");
  const [userVoiceGender, setUserVoiceGender] = useState("male");
  const [stepCompleted, setStepCompleted] = useState(false);
  const [autoTranslating, setAutoTranslating] = useState(false);
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [currentUnitId, setCurrentUnitId] = useState(null);
  const [unitShowFullText, setUnitShowFullText] = useState(false);
  const [unitDisplayMode, setUnitDisplayMode] = useState("gap_fill"); // "gap_fill", "cloze", "full_text"
  const [challengeExercises, setChallengeExercises] = useState({});
  const [completedUnits, setCompletedUnits] = useState(new Set()); // Track completed unit exercises
  const [stepAttempted, setStepAttempted] = useState(false); // Track if user has attempted the current step

  // Adventure progress tracking
  const [journey, setJourney] = useState(null);
  const [progressUpdate, setProgressUpdate] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Reset keys for each exercise type to force re-render
  const [aiWritingKey, setAiWritingKey] = useState(0);
  const [aiConversationKey, setAiConversationKey] = useState(0);
  const [aiGapFillKey, setAiGapFillKey] = useState(0);
  const [aiSpeechKey, setAiSpeechKey] = useState(0);
  const [interactivePitchKey, setInteractivePitchKey] = useState(0);
  const [interactiveGameKey, setInteractiveGameKey] = useState(0);

  const audioRef = useRef(null);

  // Helper function to get world URL from lesson or journey
  const getWorldUrl = () => {
    // Try to get world from lesson first
    if (lesson?.world) {
      const world = WORLDS[lesson.world];
      if (world?.slug) {
        return `/worlds/${world.slug}`;
      }
    }

    // Fallback to journey's world_id
    if (journey?.current_world_id) {
      const world = Object.values(WORLDS).find(
        (w) => w.id === journey.current_world_id
      );
      if (world?.slug) {
        return `/worlds/${world.slug}`;
      }
    }

    // Final fallback
    return "/worlds";
  };

  // Fetch lesson data and user preferences
  // Use primitive userId to prevent re-renders on focus/blur
  // Note: user?.userId is the database ID, user?.id might be OAuth provider ID
  const userId = user?.userId || user?.id;
  useEffect(() => {
    async function fetchLesson() {
      // Skip if lesson already loaded for this lessonId
      if (lesson && lesson.id === lessonId) return;

      try {
        setLoading(true);
        const lessonData = await getLessonById(lessonId);

        if (!lessonData) {
          setError("Lesson not found");
          return;
        }

        setLesson(lessonData);

        // Debug: Log lesson content structure
        console.log("[Lesson] Loaded:", {
          id: lessonData.id,
          title: lessonData.title,
          hasContent: !!lessonData.content,
          contentType: typeof lessonData.content,
          hasSteps: !!lessonData.content?.steps,
          stepsLength: lessonData.content?.steps?.length || 0,
          stepTypes: lessonData.content?.steps?.map((s) => s.type) || [],
        });

        // Fetch user's preferred language and English variant
        if (userId) {
          const preferredLang = await getPlayerPreferredLanguage(userId);
          setUserPreferredLanguage(preferredLang || "en");

          // Also fetch English variant and voice gender
          try {
            const { data, error } = await createClient()
              .from("players")
              .select("english_variant, voice_gender")
              .eq("id", userId)
              .single();

            if (!error && data) {
              setUserEnglishVariant(data.english_variant || "british");
              setUserVoiceGender(data.voice_gender || "male");
            }
          } catch (error) {
            console.error("Error fetching user preferences:", error);
          }
        }
      } catch (err) {
        setError("Failed to load lesson");
        console.error("Error fetching lesson:", err);
      } finally {
        setLoading(false);
      }
    }

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId, userId, lesson]);

  // Track which challenges have been loaded to prevent duplicate fetches
  const loadedChallengesRef = useRef(new Set());

  // Load challenge exercises for challenge_reference steps
  useEffect(() => {
    const loadChallengeExercises = async () => {
      if (!lesson?.content?.steps) return;

      const currentStepData = lesson.content.steps[currentStep];

      if (
        currentStepData?.type === "challenge_reference" &&
        currentStepData.challenge_id &&
        !loadedChallengesRef.current.has(currentStepData.challenge_id)
      ) {
        // Mark as loading to prevent duplicate requests
        loadedChallengesRef.current.add(currentStepData.challenge_id);

        try {
          const exercises = await fetchSingleGapChallenges(
            currentStepData.challenge_id
          );
          setChallengeExercises((prev) => ({
            ...prev,
            [currentStepData.challenge_id]: exercises,
          }));
        } catch (error) {
          console.error("Failed to load challenge:", error);
          // Remove from loaded set so it can be retried
          loadedChallengesRef.current.delete(currentStepData.challenge_id);
        }
      }
    };

    loadChallengeExercises();
  }, [currentStep, lesson?.content?.steps]);

  // Translation utility function
  const translateContent = async (content, key) => {
    // Don't translate if already in English or no preferred language
    if (userPreferredLanguage === "en" || !content) return content;

    // Check if already translated
    if (translations[key]) {
      return translations[key];
    }

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: content,
          targetLanguage: userPreferredLanguage,
          context: "Football/soccer training lesson for young players",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranslations((prev) => ({ ...prev, [key]: data.translatedText }));
        return data.translatedText;
      }
    } catch (error) {
      console.error("Translation error:", error);
    }
    return content; // Return original if translation fails
  };

  // Auto-translate content when step changes or language preference is loaded
  const autoTranslateStepContent = async () => {
    if (userPreferredLanguage === "en" || !lesson?.content?.steps) return;

    const steps = lesson.content.steps || [];
    const stepData = steps[currentStep];
    if (!stepData) return;

    setAutoTranslating(true);
    const translationPromises = [];

    // Translate step title
    if (stepData.title) {
      translationPromises.push(
        translateContent(stepData.title, `step-title-${currentStep}`)
      );
    }

    // Translate scenario content
    if (stepData.type === "scenario" && stepData.content) {
      translationPromises.push(
        translateContent(stepData.content, `scenario-${currentStep}`)
      );

      if (stepData.cultural_context) {
        translationPromises.push(
          translateContent(stepData.cultural_context, `cultural-${currentStep}`)
        );
      }

      if (stepData.reflection_questions) {
        stepData.reflection_questions.forEach((q, idx) => {
          translationPromises.push(
            translateContent(q, `reflection-${currentStep}-${idx}`)
          );
        });
      }
    }

    // Translate completion achievements
    if (stepData.type === "completion" && stepData.achievements) {
      stepData.achievements.forEach((achievement, idx) => {
        translationPromises.push(
          translateContent(achievement, `achievement-${currentStep}-${idx}`)
        );
      });
    }

    // Translate vocabulary tips and cultural notes (keep words in English)
    if (stepData.type === "vocabulary") {
      // Translate vocabulary instructions/content
      if (stepData.content) {
        translationPromises.push(
          translateContent(stepData.content, `vocab-content-${currentStep}`)
        );
      }

      const items = stepData.vocabulary || stepData.words || [];
      items.forEach((item, idx) => {
        if (item.tip) {
          translationPromises.push(
            translateContent(item.tip, `vocab-tip-${currentStep}-${idx}`)
          );
        }
        if (item.cultural_note) {
          translationPromises.push(
            translateContent(
              item.cultural_note,
              `vocab-note-${currentStep}-${idx}`
            )
          );
        }
      });
    }

    // Translate interactive pitch instructions and descriptions
    if (stepData.type === "interactive_pitch") {
      const config = stepData.interactive_config;
      if (config?.instruction) {
        translationPromises.push(
          translateContent(
            config.instruction,
            `pitch-instruction-${currentStep}`
          )
        );
      }
      if (config?.click_areas) {
        config.click_areas.forEach((area, idx) => {
          if (area.description) {
            translationPromises.push(
              translateContent(
                area.description,
                `pitch-area-desc-${currentStep}-${idx}`
              )
            );
          }
        });
      }
    }

    // Translate interactive game instructions
    if (stepData.type === "interactive_game") {
      const config = stepData.game_config;
      if (config?.instruction) {
        translationPromises.push(
          translateContent(
            config.instruction,
            `game-instruction-${currentStep}`
          )
        );
      }
      if (config?.commands) {
        config.commands.forEach((cmd, idx) => {
          if (cmd.success_message) {
            translationPromises.push(
              translateContent(
                cmd.success_message,
                `game-success-${currentStep}-${idx}`
              )
            );
          }
        });
      }
    }

    // Translate writing prompts
    if (stepData.type === "ai_writing" && stepData.prompt) {
      translationPromises.push(
        translateContent(stepData.prompt, `writing-prompt-${currentStep}`)
      );
    }

    // Translate listening challenge content and context
    if (stepData.type === "ai_listening_challenge") {
      if (stepData.content) {
        translationPromises.push(
          translateContent(stepData.content, `listening-content-${currentStep}`)
        );
      }

      // Translate context hints for each audio clip (keep the actual audio in English)
      if (stepData.audio_clips) {
        stepData.audio_clips.forEach((clip, idx) => {
          if (clip.context) {
            translationPromises.push(
              translateContent(
                clip.context,
                `listening-context-${currentStep}-${idx}`
              )
            );
          }
        });
      }
    }

    // Translate speech practice instructions (keep expectedText in English)
    if (stepData.type === "ai_speech_practice") {
      if (stepData.prompt) {
        translationPromises.push(
          translateContent(stepData.prompt, `speech-prompt-${currentStep}`)
        );
      }

      if (stepData.context) {
        translationPromises.push(
          translateContent(stepData.context, `speech-context-${currentStep}`)
        );
      }
    }

    // Translate any generic content field for other step types
    if (
      stepData.content &&
      !["scenario", "vocabulary"].includes(stepData.type)
    ) {
      translationPromises.push(
        translateContent(stepData.content, `content-${currentStep}`)
      );
    }

    await Promise.all(translationPromises);
    setAutoTranslating(false);
  };

  // Auto-translate content when step changes or language preference changes
  useEffect(() => {
    if (lesson && lesson.content?.steps && userPreferredLanguage !== "en") {
      const steps = lesson.content.steps || [];
      const stepData = steps[currentStep];
      if (stepData) {
        autoTranslateStepContent();
      }
    }
  }, [currentStep, userPreferredLanguage, lesson]);

  // Track if journey has been fetched to prevent duplicate fetches
  const journeyFetchedRef = useRef(false);

  // Fetch user's journey data
  // Use userId primitive to prevent re-renders on focus/blur
  useEffect(() => {
    const fetchJourney = async () => {
      if (!userId) {
        console.log("🗺️ No user, skipping journey fetch");
        return;
      }

      // Skip if already fetched
      if (journeyFetchedRef.current) return;
      journeyFetchedRef.current = true;

      try {
        console.log("🗺️ Fetching journey for user...");
        const response = await fetch("/api/user/journey");
        const data = await response.json();

        console.log("🗺️ Journey API response:", {
          ok: response.ok,
          hasJourney: !!data.journey,
          adventureId: data.journey?.current_adventure_id,
          worldId: data.journey?.current_world_id,
          fullJourney: data.journey,
        });

        if (response.ok && data.journey) {
          setJourney(data.journey);
        } else {
          console.log("🗺️ No journey found or response not ok:", data);
        }
      } catch (error) {
        console.error("❌ Error fetching journey:", error);
        // Reset so it can be retried
        journeyFetchedRef.current = false;
      }
    };

    fetchJourney();
  }, [userId]);

  // Handle lesson completion when reaching the completion step
  useEffect(() => {
    if (!lesson || !lesson.content?.steps) return;

    const currentStepData = lesson.content.steps[currentStep];

    console.log("📍 Completion check:", {
      stepType: currentStepData?.type,
      currentStep,
      hasProgressUpdate: !!progressUpdate,
      loadingProgress,
      hasJourney: !!journey,
      journeyDetails: journey
        ? {
            adventureId: journey.current_adventure_id,
            worldId: journey.current_world_id,
          }
        : null,
    });

    // Only trigger on completion step and only once
    // Allow completion even without journey - will use simpler completion API
    if (
      currentStepData?.type === "completion" &&
      !progressUpdate &&
      !loadingProgress
    ) {
      console.log("🚀 Triggering handleLessonCompletion...");
      handleLessonCompletion();
    }
  }, [currentStep, lesson, journey]);

  // Handle XP awards from step activities
  // Users can earn XP on repeated attempts to help reach the 200 XP threshold
  const handleXPAward = (xp, stepIndex = currentStep) => {
    const stepKey = `step-${stepIndex}`;
    const previousXP = stepXP[stepKey] || 0;
    const isRepeat = previousXP > 0;

    console.log(
      `Awarding ${xp} XP for step ${stepIndex}${
        isRepeat ? " (repeat attempt)" : ""
      }`
    );

    // Track cumulative XP earned on this step (for reference)
    setStepXP((prev) => ({ ...prev, [stepKey]: previousXP + xp }));
    setCumulativeXP((prev) => prev + xp);

    // Show toast notification with different message for repeats
    if (isRepeat) {
      toast.success(`+${xp} XP earned! Keep practicing!`, {
        duration: 2000,
      });
    } else {
      toast.success(`+${xp} XP earned!`, {
        duration: 2000,
      });
    }
  };

  // Handle lesson completion and IUCN progress
  const handleLessonCompletion = async () => {
    console.log("📝 handleLessonCompletion called", {
      hasLesson: !!lesson,
      lessonId: lesson?.id,
      cumulativeXP,
      hasJourney: !!journey,
    });

    if (!lesson) {
      console.log("❌ No lesson, aborting completion");
      return;
    }

    setLoadingProgress(true);

    try {
      // If user has an active journey/adventure, use the adventure-based completion API
      if (journey && journey.current_adventure_id && journey.current_world_id) {
        console.log("🎯 Using adventure completion API:", {
          lessonId: lesson.id,
          adventureId: journey.current_adventure_id,
          worldId: journey.current_world_id,
          xpEarned: cumulativeXP,
        });

        const response = await fetch("/api/lessons/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId: lesson.id,
            adventureId: journey.current_adventure_id,
            worldId: journey.current_world_id,
            xpEarned: cumulativeXP,
          }),
        });

        const data = await response.json();
        console.log("📬 Adventure completion response:", {
          ok: response.ok,
          data,
        });

        if (response.ok && data.success) {
          console.log("✅ Adventure lesson completion successful!");
          setProgressUpdate(data.progressUpdate);
          setJourney(data.journey);

          // Show success toast
          toast.success(data.message, {
            duration: 5000,
          });

          if (data.speciesSaved) {
            // Confetti or special celebration for saving a species
            toast.success(`🎉 ${data.speciesSaved.name} saved!`, {
              description: "You completed the adventure!",
              duration: 8000,
            });
          }
        } else {
          console.error("❌ Adventure lesson completion failed:", data.error);
        }
      } else {
        // No active journey - use simple lesson completion API
        // This ensures lessons are always marked as complete
        console.log("📝 No active journey, using simple completion API", {
          lessonId: lesson.id,
          xpEarned: cumulativeXP,
        });
        const response = await fetch("/api/lesson-completion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId: lesson.id,
            xpEarned: cumulativeXP,
          }),
        });

        const data = await response.json();
        console.log("📬 Simple completion response:", {
          ok: response.ok,
          data,
        });

        if (response.ok) {
          console.log("✅ Simple lesson completion successful!");
          toast.success("Lesson completed!", {
            duration: 3000,
          });
          // Set a basic progress update for display
          setProgressUpdate({
            xpEarned: cumulativeXP,
            meetsXPThreshold: cumulativeXP >= 100,
          });
        } else {
          console.error("❌ Simple lesson completion failed:", data.error);
        }
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
    } finally {
      setLoadingProgress(false);
    }
  };

  // FIXED: Better error boundaries and loading states
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 min-h-screen">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
        <div className="text-center mt-4">
          <p className="text-gray-600 dark:text-gray-400">{t("loading")}</p>
        </div>
      </div>
    );
  }

  // FIXED: Error state with better navigation
  if (error || !lesson) {
    return (
      <div className="max-w-4xl mx-auto p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t("lesson_not_found")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error || t("lesson_doesnt_exist")}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t("back_to_dashboard")}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t("reload_page")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const lessonContent = lesson?.content;
  const steps = lessonContent?.steps || [];
  const currentStepData = steps?.[currentStep];
  const progress =
    steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  // Don't render if lesson data is not properly loaded
  if (!lesson || !currentStepData) {
    return (
      <div className="max-w-4xl mx-auto p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t("loading")}</p>
        </div>
      </div>
    );
  }

  // Updated handleAnswerSubmit function
  // Updated handleAnswerSubmit function
  const handleAnswerSubmit = () => {
    if (!selectedAnswer && Object.keys(selectedAnswers).length === 0) return;

    let correct = false;
    let totalCorrect = 0;
    let totalQuestions = 0;

    // Handle different question types
    if (
      currentStepData.type === "gap_fill" ||
      currentStepData.type === "gap_fill_advanced"
    ) {
      if (currentStepData.scenarios) {
        // Multiple scenario gap fill - check all scenarios and gaps
        let allCorrect = 0;
        let totalGaps = 0;

        currentStepData.scenarios.forEach((scenario, scenarioIndex) => {
          scenario.gaps.forEach((gap, gapIndex) => {
            totalGaps++;
            const userAnswer = selectedAnswers[`${scenarioIndex}-${gapIndex}`];
            if (userAnswer === gap.correct_answer) {
              allCorrect++;
            }
          });
        });

        totalCorrect = allCorrect;
        totalQuestions = totalGaps;
        correct = allCorrect === totalGaps; // Only true if ALL answers are correct
      } else if (currentStepData.gaps) {
        // Single gap fill with new structure
        let correctGaps = 0;
        const totalGaps = currentStepData.gaps.length;

        currentStepData.gaps.forEach((gap, gapIndex) => {
          const userAnswer = selectedAnswers[`gap-${gapIndex}`];
          if (userAnswer === gap.correct_answer) {
            correctGaps++;
          }
        });

        totalCorrect = correctGaps;
        totalQuestions = totalGaps;
        correct = correctGaps === totalGaps;
      } else {
        // Fallback for old structure (backwards compatibility)
        correct =
          currentStepData.correct_answers?.includes(selectedAnswer) ||
          currentStepData.correctAnswers?.includes(selectedAnswer);
        totalCorrect = correct ? 1 : 0;
        totalQuestions = 1;
      }
    } else if (
      currentStepData.type === "situational" ||
      currentStepData.type === "situational_challenges"
    ) {
      if (currentStepData.challenges) {
        // Handle multiple challenges format
        let correctChallenges = 0;
        const totalChallenges = currentStepData.challenges.length;

        currentStepData.challenges.forEach((challenge, challengeIndex) => {
          const userAnswer = selectedAnswers[`challenge-${challengeIndex}`];
          if (userAnswer === challenge.correct_answer) {
            correctChallenges++;
          }
        });

        totalCorrect = correctChallenges;
        totalQuestions = totalChallenges;
        correct = correctChallenges === totalChallenges; // Only true if ALL challenges are correct
      } else {
        // Handle standard situational
        correct =
          selectedAnswer === currentStepData.correct_answer ||
          selectedAnswer === currentStepData.correctAnswer;
        totalCorrect = correct ? 1 : 0;
        totalQuestions = 1;
      }
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    // Award XP based on performance
    if (!completedSteps.has(currentStep)) {
      let xpToAward = 0;

      if (
        currentStepData.type === "gap_fill" ||
        currentStepData.type === "gap_fill_advanced"
      ) {
        // Award XP based on number of correct answers (partial credit)
        xpToAward = totalCorrect * 10; // 10 XP per correct gap
        if (correct) {
          xpToAward += 10; // Bonus 10 XP for perfect score
        }
      } else if (
        currentStepData.type === "situational" ||
        currentStepData.type === "situational_challenges"
      ) {
        if (currentStepData.challenges) {
          // Award XP based on number of correct challenges (partial credit)
          xpToAward = totalCorrect * 15; // 15 XP per correct challenge
          if (correct) {
            xpToAward += 10; // Bonus 10 XP for perfect score
          }
        } else {
          // Standard 20 XP for single situational
          xpToAward = correct ? 20 : 0;
        }
      } else {
        // Standard 20 XP for other question types
        xpToAward = correct ? 20 : 0;
      }

      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setXpEarned((prev) => prev + xpToAward);
    }
  };

  // New handleStepComplete function
  const handleStepComplete = (xpAwarded = 10) => {
    if (!completedSteps.has(currentStep)) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setXpEarned((prev) => prev + xpAwarded);
      setStepCompleted(true);
      setStepAttempted(true); // Mark step as attempted when step is completed

      // Show completion message briefly
      setTimeout(() => {
        setStepCompleted(false);
      }, 3000);
    }
  };

  const handleNext = () => {
    console.log(
      "[handleNext] Called. currentStep:",
      currentStep,
      "steps.length:",
      steps.length
    );
    setSelectedAnswer("");
    setSelectedAnswers({});
    setShowFeedback(false);
    setShowTranslation(false); // Reset translation view
    setStepCompleted(false); // Reset step completion indicator
    setStepAttempted(false); // Reset step attempted indicator
    if (currentStep < steps.length - 1) {
      console.log("[handleNext] Advancing to step:", currentStep + 1);
      setCurrentStep((prev) => prev + 1);
    } else {
      console.log("[handleNext] Already at last step, not advancing");
    }
  };

  const handlePrevious = () => {
    console.log("[handlePrevious] Called. currentStep:", currentStep);
    setSelectedAnswer("");
    setSelectedAnswers({});
    setShowFeedback(false);
    setShowTranslation(false); // Reset translation view
    setStepCompleted(false); // Reset step completion indicator
    setStepAttempted(false); // Reset step attempted indicator
    if (currentStep > 0) {
      console.log("[handlePrevious] Going back to step:", currentStep - 1);
      setCurrentStep((prev) => prev - 1);
    } else {
      console.log("[handlePrevious] Already at first step, not going back");
    }
  };

  const handleLessonComplete = async () => {
    // Lesson completion is already handled by handleLessonCompletion() on the completion step
    // This function just navigates back to the world page
    console.log("🏁 Navigating back to world page...");

    // Small delay for smooth transition
    setTimeout(() => {
      router.push(getWorldUrl() + "#content");
    }, 300);
  };

  // Check if step type requires user interaction before allowing navigation
  const stepRequiresInteraction = (stepType) => {
    // Steps that require user interaction (audio, exercises, games)
    const interactiveSteps = [
      "scenario", // Must listen to audio
      "ai_gap_fill",
      "ai_writing",
      "ai_conversation",
      "ai_listening_challenge",
      "ai_speech_practice",
      "memory_match",
      "conversation_vote",
      "unit_reference",
      "word_snake",
      "challenge_reference",
      // "video", // VideoPlayer doesn't have onPlay callback yet
      "interactive_pitch",
      "interactive_game",
      // For the following step types, interaction tracking is handled via onComplete callbacks
      // or they are informational and don't require mandatory interaction
    ];
    return interactiveSteps.includes(stepType);
  };

  const toggleAudio = async () => {
    console.log("[toggleAudio] Function called");
    console.log("[toggleAudio] Current step data:", {
      hasAudioUrl: !!currentStepData.audio_url,
      audioUrl: currentStepData.audio_url,
      hasContent: !!currentStepData.content,
      audioRefExists: !!audioRef.current,
    });

    if (!audioRef.current) {
      console.warn("[toggleAudio] No audio ref available");
      return;
    }

    if (isPlaying) {
      console.log("[toggleAudio] Pausing audio");
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      // Check if we have an uploaded audio URL (from Supabase or local)
      if (currentStepData.audio_url) {
        console.log(
          "[toggleAudio] Playing uploaded audio from:",
          currentStepData.audio_url
        );

        // Only set the source if it's not already loaded (to allow resume from pause)
        if (audioRef.current.src !== currentStepData.audio_url) {
          audioRef.current.src = currentStepData.audio_url;
          console.log("[toggleAudio] Audio source set, attempting to play...");
        } else {
          console.log("[toggleAudio] Resuming from current position...");
        }

        await audioRef.current.play();
        console.log("[toggleAudio] Audio playing successfully");
        setIsPlaying(true);
        setStepAttempted(true); // Mark step as attempted when audio starts

        // Clean up when audio ends
        audioRef.current.onended = () => {
          console.log("[toggleAudio] Audio ended");
          setIsPlaying(false);
        };

        // If audio plays successfully, return early
        return;
      }

      // Fallback to TTS generation if no audio_url is provided
      console.log("No uploaded audio found, generating TTS audio for scenario");

      if (!currentStepData.content) {
        console.warn("No content available for TTS generation");
        return;
      }

      // Only generate TTS if we don't already have audio loaded
      // Check if current src is a blob URL (TTS generated) and audio is paused
      const currentSrc = audioRef.current.src;
      const isBlobUrl = currentSrc && currentSrc.startsWith("blob:");

      if (
        isBlobUrl &&
        audioRef.current.paused &&
        audioRef.current.currentTime > 0
      ) {
        // Resume existing TTS audio
        console.log(
          "[toggleAudio] Resuming TTS audio from current position..."
        );
        await audioRef.current.play();
        setIsPlaying(true);
        return;
      }

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentStepData.content,
          englishVariant: userEnglishVariant,
          voiceGender: userVoiceGender,
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
        setIsPlaying(true);
        setStepAttempted(true); // Mark step as attempted when TTS audio starts

        // Clean up when audio ends
        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
      } else {
        console.error("Failed to generate TTS audio:", response.status);
      }
    } catch (error) {
      console.error("Error playing scenario audio:", error);
      setIsPlaying(false);
    }
  };

  const playAudio = (audioUrl) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  };

  const getStepIcon = (stepType) => {
    const iconMap = {
      ai_writing: BookOpen,
      ai_conversation: MessageSquare,
      ai_gap_fill: Target,
      ai_listening_challenge: Headphones,
      ai_speech_practice: Mic,
      scenario: Globe,
      vocabulary: Book,
      dialogue: MessageSquare,
      dialogue_immersion: MessageSquare,
      pronunciation_drill: Mic,
      audio_recognition: Headphones,
      gap_fill: Target,
      gap_fill_advanced: Target,
      situational: Users,
      situational_challenges: Users,
      completion: Trophy,
      video_analysis_dialogue: Eye,
      interview_simulation: Mic,
      team_talk_structure: Users,
      emergency_scenarios: AlertCircle,
      cultural_insights: Globe,
      phone_simulation: Phone,
      transport_mastery: MapPin,
      social_etiquette: Star,
      problem_solving: Target,
      media_landscape: TrendingUp,
      pain_scale_training: BarChart3,
      motivational_language: Award,
      conflict_resolution: Users,
      building_culture: Calendar,
    };

    const IconComponent = iconMap[stepType] || Book;
    return <IconComponent className="w-5 h-5 dark:text-white" />;
  };

  const renderStepContent = () => {
    if (!currentStepData) return <div>No content available</div>;

    // Log step info for debugging
    console.log("[renderStepContent] Rendering step:", {
      stepIndex: currentStep,
      stepType: currentStepData.type,
      hasTitle: !!currentStepData.title,
    });

    try {
      return renderStepContentInner();
    } catch (error) {
      console.error(
        "[renderStepContent] Error rendering step:",
        error,
        currentStepData
      );
      return (
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl">
          <p className="text-red-600 dark:text-red-400 font-bold mb-2">
            Error rendering step content
          </p>
          <p className="text-red-500 dark:text-red-300 text-sm mb-4">
            {error.message}
          </p>
          <details>
            <summary className="cursor-pointer text-sm text-gray-500">
              View step data
            </summary>
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(currentStepData, null, 2)}
            </pre>
          </details>
        </div>
      );
    }
  };

  const renderStepContentInner = () => {
    switch (currentStepData.type) {
      case "scenario":
        return (
          <div className="text-center">
            <div className="bg-white dark:bg-primary-900/20 rounded-xl p-6 mb-2">
              {currentStepData.video_url ? (
                <VideoPlayer
                  title={currentStepData.title}
                  videoUrl={currentStepData.video_url}
                  thumbnailUrl={currentStepData.thumbnail_url}
                  description={currentStepData.video_description}
                  className="mb-4"
                />
              ) : currentStepData.image_url ? (
                <img
                  src={currentStepData.image_url}
                  alt="Scenario"
                  className="w-full max-w-md mx-auto rounded-lg shadow-md mb-4"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : null}

              <button
                onClick={toggleAudio}
                className={`flex items-center space-x-2 mx-auto px-4 py-2 mb-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isPlaying
                    ? "bg-accent-500 hover:bg-accent-600 text-white"
                    : "bg-accent-600 hover:bg-accent-700 text-white"
                }`}
                disabled={
                  !currentStepData.audio_url && !currentStepData.content
                }
                title={
                  isPlaying
                    ? "Pause audio"
                    : !currentStepData.audio_url && !currentStepData.content
                    ? "No audio or content available"
                    : currentStepData.audio_url
                    ? "Listen to uploaded audio"
                    : "Listen to scenario in English (AI voice)"
                }
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>{t("pause") || "Pause"}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>{t("listen") || "Listen"}</span>
                  </>
                )}
              </button>
              <audio ref={audioRef} style={{ display: "none" }} />

              {/* Floating Facts Modal */}
              {currentStepData.facts && currentStepData.facts.length > 0 && (
                <FloatingFacts facts={currentStepData.facts} />
              )}
              {/* Auto-translated content */}
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                {translations[`scenario-${currentStep}`] ||
                  currentStepData.content}
              </p>

              {currentStepData.cultural_context && (
                <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg mt-4">
                  <p className="text-sm text-primary-800 dark:text-accent-200">
                    <strong>{t("cultural_context")}:</strong>{" "}
                    {translations[`cultural-${currentStep}`] ||
                      currentStepData.cultural_context}
                  </p>
                </div>
              )}

              {/* <button
                onClick={handleNext}
                disabled={
                  completing ||
                  (currentStep === steps.length - 1 &&
                    currentStepData?.type !== "completion")
                }
                className="flex items-center space-x-2 mx-auto bg-linear-to-br from-accent-700 to-accent-800 text-white px-12 py-0.5 mb-3 rounded-lg hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Start
              </button> */}

              {currentStepData.reflection_questions && (
                <div className="mt-4 text-left text-gray-700 dark:text-gray-300 ">
                  <h4 className="font-semibold mb-2">
                    {t("reflection_questions")}:
                  </h4>
                  <ul className="text-sm space-y-1">
                    {currentStepData.reflection_questions.map(
                      (question, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary-600 mr-2">•</span>
                          {translations[`reflection-${currentStep}-${index}`] ||
                            question}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );

      case "ai_writing":
        return (
          <div className="space-y-4">
            <AIWritingExercise
              key={aiWritingKey}
              prompt={
                translations[`writing-prompt-${currentStep}`] ||
                currentStepData.prompt
              }
              context={currentStepData.context}
              example={currentStepData.example}
              lessonId={lessonId}
              englishVariant={userEnglishVariant}
              voiceGender={userVoiceGender}
              onComplete={(xp) => {
                setXpEarned((prev) => prev + xp);
                setCompletedSteps((prev) => new Set([...prev, currentStep]));
                setStepAttempted(true); // Mark step as attempted when user submits writing
                // User clicks next button when ready (no auto-advance to prevent double-skip)
              }}
              minWords={currentStepData.minWords || 50}
              maxWords={currentStepData.maxWords || 200}
            />
            <div className="flex justify-center mt-4">
              <button
                onClick={() => {
                  // Clear localStorage for this writing exercise
                  if (typeof window !== "undefined") {
                    // AIWritingExercise uses: ai-writing-${lessonId}-${prompt.substring(0, 50)}
                    const promptPrefix = (
                      translations[`writing-prompt-${currentStep}`] ||
                      currentStepData.prompt ||
                      ""
                    ).substring(0, 50);
                    localStorage.removeItem(
                      `ai-writing-${lessonId}-${promptPrefix}`
                    );
                  }
                  // Force re-render by changing the key
                  setAiWritingKey((prev) => prev + 1);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-300 rounded-2xl hover:bg-primary-300 dark:hover:bg-primary-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {userLanguage === "pt-BR"
                  ? "Comece de Novo"
                  : userLanguage === "th"
                  ? "เริ่มใหม่"
                  : "Start Again"}
              </button>
            </div>
          </div>
        );

      case "ai_conversation":
        return (
          <div className="space-y-4">
            <AIConversationPractice
              key={aiConversationKey}
              scenario={currentStepData.scenario}
              context={currentStepData.context}
              conversationStarters={currentStepData.conversation_starters}
              lessonId={lessonId}
              englishVariant={userEnglishVariant}
              voiceGender={userVoiceGender}
              onComplete={(xp) => {
                setXpEarned((prev) => prev + xp);
                setCompletedSteps((prev) => new Set([...prev, currentStep]));
                setStepAttempted(true); // Mark step as attempted when user completes conversation
                // User clicks next button when ready (no auto-advance to prevent double-skip)
              }}
              maxTurns={currentStepData.maxTurns || 6}
            />
            <div className="flex justify-center mt-4">
              <button
                onClick={() => {
                  // Clear localStorage for this conversation practice
                  if (typeof window !== "undefined") {
                    // AIConversationPractice uses these keys:
                    localStorage.removeItem(
                      `ai-conversation-${lessonId}-input`
                    );
                    localStorage.removeItem(
                      `ai-conversation-${lessonId}-messages`
                    );
                    localStorage.removeItem(
                      `ai-conversation-${lessonId}-turnCount`
                    );
                    localStorage.removeItem(
                      `ai-conversation-${lessonId}-errors`
                    );
                  }
                  // Force re-render by changing the key
                  setAiConversationKey((prev) => prev + 1);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-300 rounded-2xl hover:bg-primary-300 dark:hover:bg-primary-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {userLanguage === "pt-BR"
                  ? "Comece de Novo"
                  : userLanguage === "th"
                  ? "เริ่มใหม่"
                  : "Start Again"}
              </button>
            </div>
          </div>
        );

      case "ai_gap_fill":
        // Debug: log step data to verify mode is being passed
        console.log("🎯 ai_gap_fill step data:", {
          mode: currentStepData.mode,
          hasSentences: currentStepData.sentences?.length,
          stepType: currentStepData.type,
        });
        return (
          <div className="space-y-4">
            {/* Theme Image - discreet display */}
            {currentStepData.image_url && (
              <div className="flex justify-center mb-6">
                <img
                  src={currentStepData.image_url}
                  alt="Gap fill theme"
                  className="w-48 h-32 sm:w-96 sm:h-48 object-cover rounded-lg shadow-md opacity-90"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            <AIMultipleChoiceGapFill
              key={`${currentStep}-${aiGapFillKey}`}
              sentences={currentStepData.sentences}
              lessonId={lessonId}
              stepIndex={currentStep}
              englishVariant={userEnglishVariant}
              voiceGender={userVoiceGender}
              mode={currentStepData.mode || "multiple_choice"}
              onXPAwarded={(xp) => {
                setXpEarned((prev) => prev + xp);
                setCumulativeXP((prev) => prev + xp); // Also update cumulative XP for progress bar
                setStepAttempted(true); // Mark step as attempted when user submits an answer
              }}
              onComplete={(xp) => {
                // XP already awarded incrementally via onXPAwarded
                setCompletedSteps((prev) => new Set([...prev, currentStep]));
                // User clicks next button when ready (no auto-advance to prevent double-skip)
              }}
            />
            <div className="flex justify-center mt-4">
              <button
                onClick={() => {
                  // Clear localStorage for this gap fill exercise
                  if (typeof window !== "undefined") {
                    // AIMultipleChoiceGapFill uses step-specific key
                    localStorage.removeItem(
                      `lesson-${lessonId}-step-${currentStep}-aiGapFill-progress`
                    );
                  }
                  // Force re-render by changing the key
                  setAiGapFillKey((prev) => prev + 1);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-300 rounded-2xl hover:bg-primary-300 dark:hover:bg-primary-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {/* {userLanguage === "pt-BR" ? "Comece de Novo" : userLanguage === "th" ? "เริ่มใหม่" : "Start Again"} */}
              </button>
            </div>
          </div>
        );

      case "ai_listening_challenge":
        // Prepare audio clips with translated context
        const translatedAudioClips = (currentStepData.audio_clips || []).map(
          (clip, idx) => ({
            ...clip,
            context:
              translations[`listening-context-${currentStep}-${idx}`] ||
              clip.context,
          })
        );

        return (
          <AIListeningChallenge
            audioClips={translatedAudioClips}
            content={
              translations[`listening-content-${currentStep}`] ||
              currentStepData.content
            }
            lessonId={lessonId}
            englishVariant={userEnglishVariant}
            voiceGender={userVoiceGender}
            onComplete={(xp) => {
              setXpEarned((prev) => prev + xp);
              setCompletedSteps((prev) => new Set([...prev, currentStep]));
              setStepAttempted(true); // Mark step as attempted when user completes listening
              // User clicks next button when ready (no auto-advance to prevent double-skip)
            }}
          />
        );

      case "ai_speech_practice":
        return (
          <div className="space-y-4">
            <AISpeechPractice
              key={aiSpeechKey}
              prompt={
                translations[`speech-prompt-${currentStep}`] ||
                currentStepData.prompt
              }
              expectedText={currentStepData.expectedText}
              context={
                translations[`speech-context-${currentStep}`] ||
                currentStepData.context
              }
              lessonId={lessonId}
              englishVariant={userEnglishVariant}
              voiceGender={userVoiceGender}
              onComplete={(xp) => {
                setXpEarned((prev) => prev + xp);
                setCompletedSteps((prev) => new Set([...prev, currentStep]));
                setStepAttempted(true); // Mark step as attempted when user completes speech practice
                // For speech practice, user manually advances after reviewing feedback
                handleNext();
              }}
            />
            <div className="flex justify-center mt-4">
              <button
                onClick={() => {
                  // Clear localStorage for this speech practice
                  if (typeof window !== "undefined") {
                    // AISpeechPractice doesn't use localStorage, just reset the component
                  }
                  // Force re-render by changing the key
                  setAiSpeechKey((prev) => prev + 1);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-300 rounded-2xl hover:bg-primary-300 dark:hover:bg-primary-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {/* {userLanguage === "pt-BR" ? "Comece de Novo" : userLanguage === "th" ? "เริ่มใหม่" : "Start Again"} */}
              </button>
            </div>
          </div>
        );

      case "vocabulary":
        return (
          <div className="space-y-4">
            {/* Theme Image - discreet display */}
            {currentStepData.image_url && (
              <div className="flex justify-end mb-4">
                <img
                  src={currentStepData.image_url}
                  alt="Vocabulary theme"
                  className="w-32 h-32 object-cover rounded-lg shadow-md opacity-90"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {translations[`vocab-content-${currentStep}`] ||
                currentStepData.content ||
                t("learn_essential_words")}
            </p> */}
            <div className="grid gap-4">
              {(currentStepData.vocabulary || currentStepData.words || []).map(
                (item, index) => {
                  // Pass translated tips and notes to the component
                  const translatedItem = {
                    ...item,
                    tip:
                      translations[`vocab-tip-${currentStep}-${index}`] ||
                      item.tip,
                    cultural_note:
                      translations[`vocab-note-${currentStep}-${index}`] ||
                      item.cultural_note,
                  };
                  return (
                    <VocabularyItem
                      key={index}
                      item={translatedItem}
                      englishVariant={userEnglishVariant}
                      voiceGender={userVoiceGender}
                      userLanguage={userLanguage}
                    />
                  );
                }
              )}
            </div>
          </div>
        );

      case "memory_match":
        const memoryVocabulary = currentStepData.vocabulary || [];
        const translatedVocabulary = memoryVocabulary.map((word, idx) => ({
          ...word,
          english:
            translations[`memory-english-${currentStep}-${idx}`] ||
            word.english,
          translation:
            translations[`memory-translation-${currentStep}-${idx}`] ||
            word.translation ||
            word.portuguese,
        }));

        const memoryPairCount = translatedVocabulary.length;
        const memoryMaxXP = memoryPairCount * 10 + 20; // 10 per pair + 20 bonus

        return (
          <MemoryMatchLesson
            vocabulary={translatedVocabulary}
            lessonId={lessonId}
            onComplete={(result) => {
              // Calculate XP: 10 per correct match + 20 bonus for all correct
              const correctMatches = result?.correctMatches || memoryPairCount;
              const xp =
                correctMatches * 10 +
                (correctMatches === memoryPairCount ? 20 : 0);

              handleXPAward(xp);
              setCompletedSteps((prev) => new Set([...prev, currentStep]));
              setStepCompleted(true);
              setStepAttempted(true); // Mark step as attempted when user completes memory match
            }}
          />
        );

      case "conversation_vote":
        return (
          <ConversationVote
            step={currentStepData}
            onComplete={() => {
              setStepAttempted(true); // Mark step as attempted when user votes
              handleNext();
            }}
          />
        );

      case "unit_reference":
        return (
          <UnitReferenceStep
            unitId={currentStepData.unit_id}
            instructions={currentStepData.instructions}
            isCompleted={completedUnits.has(currentStepData.unit_id)}
            onStartExercise={() => {
              setCurrentUnitId(currentStepData.unit_id);
              setUnitShowFullText(
                currentStepData.showFullTextByDefault || false
              );
              // Set display mode from step data (supports cloze mode for advanced levels)
              setUnitDisplayMode(currentStepData.displayMode || "gap_fill");
              setUnitModalOpen(true);
              setStepAttempted(true); // Mark step as attempted when user opens the exercise
            }}
          />
        );

      case "word_snake":
        const wordCount = (currentStepData.clues || []).length;
        const wordSnakeMaxXP = wordCount * 10 + 20; // 10 per word + 20 bonus

        return (
          <div>
            {currentStepData.instructions && (
              <div className="mb-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {currentStepData.instructions}
                </p>
              </div>
            )}
            <WordSnakeLesson
              clues={currentStepData.clues || []}
              difficulty={currentStepData.difficulty || "easy"}
              onComplete={(result) => {
                console.log("Word Snake completed:", result);

                // Calculate XP: 10 per correct word + 20 bonus for all correct
                const correctWords = result?.correctWords || wordCount;
                const xp =
                  correctWords * 10 + (correctWords === wordCount ? 20 : 0);

                handleXPAward(xp);
                setStepCompleted(true);
                setStepAttempted(true); // Mark step as attempted when user completes word snake
              }}
            />
          </div>
        );

      case "challenge_reference":
        const exercises = challengeExercises[currentStepData.challenge_id];

        if (!currentStepData.challenge_id) {
          return (
            <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <p className="text-red-600 dark:text-red-400">
                No challenge ID specified. Please add a challenge ID in the CMS.
              </p>
            </div>
          );
        }

        if (!exercises) {
          return (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading challenge...
              </p>
            </div>
          );
        }

        if (exercises.length === 0) {
          return (
            <div className="text-center p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <p className="text-yellow-700 dark:text-yellow-400">
                No exercises found for this challenge.
              </p>
            </div>
          );
        }

        return (
          <div>
            {currentStepData.description && (
              <div className="mb-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {currentStepData.description}
                </p>
              </div>
            )}
            <SingleGapFillSeries
              exercises={exercises}
              isEmbedded={true}
              onComplete={() => {
                // Award XP for completing the challenge series
                const xpEarned = exercises.length * 10 + 20; // 10 per exercise + 20 bonus
                handleXPAward(xpEarned);
                setStepAttempted(true); // Mark step as attempted when user completes challenge
                // Advance to next lesson step
                handleNext();
              }}
            />
          </div>
        );

      case "video":
        return (
          <VideoPlayer
            title={currentStepData.title}
            videoUrl={currentStepData.video_url}
            description={currentStepData.description}
            className="mb-6"
          />
        );

      // FIXED: Completion step with better button handling
      case "completion":
        const totalSteps = steps.length;

        return (
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-50 to-primary-50 dark:from-green-900/20 dark:to-primary-900/20 p-8 rounded-xl">
              {/* Translation button */}
              {/* {userPreferredLanguage !== "en" && (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => {
                      const content = `${currentStepData.content}${currentStepData.cultural_context ? "\n\nCultural Context: " + currentStepData.cultural_context : ""}${currentStepData.reflection_questions ? "\n\nReflection Questions:\n" + currentStepData.reflection_questions.join("\n") : ""}`;
                      translateContent(content, `scenario-${currentStep}`);
                    }}
                    disabled={translating}
                    className="flex items-center space-x-2 px-3 py-1 text-sm bg-white dark:bg-green-800 text-green-700 dark:text-gray-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-700 transition-colors"
                  >
                    <span>
                      {translating
                        ? "Traduzindo..."
                        : showTranslation
                          ? "Show English"
                          : "Traduzir"}
                    </span>
                  </button>
                </div>
              )} */}

              {currentStepData.video_url ? (
                <VideoPlayer
                  title={currentStepData.title}
                  videoUrl={currentStepData.video_url}
                  description={currentStepData.video_description}
                  className="mb-4"
                />
              ) : currentStepData.image_url ? (
                <img
                  src={currentStepData.image_url}
                  alt="Scenario"
                  className="w-full max-w-md mx-auto rounded-lg shadow-md mb-4"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : null}

              {/* <Trophy className="w-16 h-16 text-[#d97706] mx-auto mb-4" /> */}

              {/* Circular Progress Bar */}
              <div className="w-48 h-48 mx-auto mb-6">
                <CircularProgressbar
                  value={currentStep + 1}
                  maxValue={totalSteps}
                  text={`${Math.round(
                    ((currentStep + 1) / totalSteps) * 100
                  )}%`}
                  styles={buildStyles({
                    pathColor:
                      ((currentStep + 1) / totalSteps) * 100 >= 80
                        ? `#22c55e` // Green for 80%+
                        : ((currentStep + 1) / totalSteps) * 100 >= 60
                        ? `#3b82f6` // Blue for 60-79%
                        : `#f59e0b`, // Amber for <60%
                    textColor: "#5E82A6", // Primary color
                    trailColor: "#d6d6d6",
                    backgroundColor: "#f0f0f0",
                    textSize: "24px",
                  })}
                />
              </div>

              {/* Show translated or original content */}
              {showTranslation && translations[`completion-${currentStep}`] ? (
                <div className="space-y-4 mb-6">
                  <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                    {translations[`completion-${currentStep}`]}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    (Translated to {userPreferredLanguage})
                  </p>
                </div>
              ) : (
                <>
                  {/* Conditional messaging based on XP threshold - use cumulativeXP directly as source of truth */}
                  {cumulativeXP >= 100 ? (
                    // Celebration - User reached XP threshold!
                    <div className="relative">
                      {/* Subtle animated background glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-emerald-500/20 to-teal-400/20 rounded-2xl blur-xl animate-pulse" />

                      <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl p-6 mb-6 border border-green-200 dark:border-green-700">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <span className="text-3xl">🌿</span>
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                            {t("lesson_complete")}
                          </h3>
                          <span className="text-3xl">🌿</span>
                        </div>
                        <p className="text-lg text-green-700 dark:text-green-300 text-center font-medium">
                          You&apos;ve helped your chosen species recover!
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 text-center mt-2">
                          +{cumulativeXP} XP earned
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Encouragement - User needs more XP
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl p-6 mb-6 border border-amber-200 dark:border-amber-700">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="text-2xl">🌱</span>
                        {/* <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                          {t("lesson_complete")}
                        </h3> */}
                      </div>
                      <p className="text-lg text-amber-700 dark:text-amber-300 text-center mb-3">
                        Great effort! Keep practicing to help your species
                        recover.
                      </p>
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          XP earned:{" "}
                          <span className="font-semibold text-amber-600 dark:text-amber-400">
                            {cumulativeXP}
                          </span>{" "}
                          / 100
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-amber-600 dark:text-amber-400">
                            {100 - cumulativeXP}
                          </span>{" "}
                          more XP needed to advance your species
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3 italic">
                        Tip: Retry exercises to improve your score and earn more
                        XP!
                      </p>
                    </div>
                  )}

                  {currentStepData.achievements && (
                    <div className="text-left max-w-md mx-auto space-y-2 mb-6">
                      <h4 className="font-semibold text-center mb-3">
                        {t("achievements")}
                      </h4>
                      {currentStepData.achievements.map(
                        (achievement, index) => (
                          <p
                            key={index}
                            className="text-gray-700 dark:text-gray-300 text-sm"
                          >
                            {translations[
                              `achievement-${currentStep}-${index}`
                            ] || achievement}
                          </p>
                        )
                      )}
                    </div>
                  )}

                  {/* IUCN Progress Bar - Show species journey progress */}
                  {journey && journey.current_adventure_id && (
                    <div className="max-w-2xl mx-auto mb-6">
                      <IUCNProgressBar
                        currentStatus={
                          progressUpdate?.newStatus ||
                          journey.current_iucn_status
                        }
                        startingStatus="CR"
                        lessonsCompleted={
                          progressUpdate?.lessonsCompleted ||
                          journey.lessons_completed_in_adventure
                        }
                        totalLessons={5}
                        speciesInfo={{
                          name:
                            journey.species_avatar?.common_name ||
                            "Unknown Species",
                          scientificName:
                            journey.species_avatar?.scientific_name,
                          imageUrl: journey.species_avatar?.avatar_image_url,
                        }}
                        nextLevelName={
                          progressUpdate?.isAdventureComplete
                            ? null
                            : {
                                CR: "Endangered",
                                EN: "Vulnerable",
                                VU: "Near Threatened",
                                NT: "Least Concern",
                              }[
                                progressUpdate?.newStatus ||
                                  journey.current_iucn_status
                              ]
                        }
                        showLabels={true}
                        animated={true}
                        size="lg"
                        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
                      />

                      {/* Show different messages based on progress */}
                      {progressUpdate?.isAdventureComplete ? (
                        // Ultimate celebration - Species fully saved!
                        <div className="mt-6 text-center">
                          <div className="relative inline-block">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-green-400 to-teal-400 rounded-2xl blur-lg opacity-60 animate-pulse" />
                            <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 rounded-2xl shadow-xl">
                              <div className="flex items-center justify-center gap-3">
                                <span className="text-3xl">🏆</span>
                                <div className="text-center">
                                  <p className="text-white font-bold text-xl">
                                    Species Saved!
                                  </p>
                                  <p className="text-green-100 text-sm">
                                    {journey.species_avatar?.common_name} has
                                    reached Least Concern status!
                                  </p>
                                </div>
                                <span className="text-3xl">🌍</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : progressUpdate?.shouldAdvanceIUCN ? (
                        // User advanced IUCN level
                        <div className="mt-4 text-center">
                          <div className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 border border-green-300 dark:border-green-600 rounded-xl">
                            <span className="text-2xl">🎯</span>
                            <div className="text-left">
                              <p className="text-green-800 dark:text-green-200 font-semibold">
                                IUCN Level Advanced!
                              </p>
                              <p className="text-green-600 dark:text-green-400 text-sm">
                                {journey.species_avatar?.common_name} is now{" "}
                                {
                                  {
                                    CR: "Critically Endangered",
                                    EN: "Endangered",
                                    VU: "Vulnerable",
                                    NT: "Near Threatened",
                                    LC: "Least Concern",
                                  }[progressUpdate?.newStatus]
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : cumulativeXP >= 200 &&
                        progressUpdate &&
                        !progressUpdate.isFirstCompletion ? (
                        // Already completed this lesson
                        <div className="mt-4 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            Great practice! You&apos;ve already advanced from
                            this lesson.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </>
              )}
              <div className="flex flex-col gap-1">
                {/* <div className="bg-white dark:bg-gray-800 px-4 py-1 rounded-lg inline-block mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t("total_xp_earned")}
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {xpEarned} XP
                  </p>
                </div> */}

                <button
                  onClick={handleLessonComplete}
                  disabled={completing}
                  className="bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {completing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t("saving_progress")}</span>
                    </div>
                  ) : (
                    t("continue_learning")
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case "interactive_pitch":
        const pitchConfig = {
          ...currentStepData.interactive_config,
          instruction:
            translations[`pitch-instruction-${currentStep}`] ||
            currentStepData.interactive_config?.instruction,
          click_areas: currentStepData.interactive_config?.click_areas?.map(
            (area, idx) => ({
              ...area,
              description:
                translations[`pitch-area-desc-${currentStep}-${idx}`] ||
                area.description,
            })
          ),
        };
        return (
          <div className="space-y-4">
            <InteractivePitch
              key={interactivePitchKey}
              interactiveConfig={pitchConfig}
              lessonId={lessonId}
              onComplete={handleStepComplete}
            />
            <div className="flex justify-center mt-4">
              <button
                onClick={() => {
                  // Clear localStorage for this interactive pitch
                  if (typeof window !== "undefined") {
                    // InteractivePitch uses a single key with JSON data
                    localStorage.removeItem(
                      `lesson-${lessonId}-interactivePitch-progress`
                    );
                  }
                  // Force re-render by changing the key
                  setInteractivePitchKey((prev) => prev + 1);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-300 rounded-2xl hover:bg-primary-300 dark:hover:bg-primary-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {userLanguage === "pt-BR"
                  ? "Comece de Novo"
                  : userLanguage === "th"
                  ? "เริ่มใหม่"
                  : "Start Again"}
              </button>
            </div>
          </div>
        );

      case "interactive_game":
        const gameConfig = {
          ...currentStepData.game_config,
          instruction:
            translations[`game-instruction-${currentStep}`] ||
            currentStepData.game_config?.instruction,
          commands: currentStepData.game_config?.commands?.map((cmd, idx) => ({
            ...cmd,
            success_message:
              translations[`game-success-${currentStep}-${idx}`] ||
              cmd.success_message,
          })),
        };
        return (
          <div className="space-y-4">
            <InteractiveGame
              key={interactiveGameKey}
              gameConfig={gameConfig}
              lessonId={lessonId}
              onComplete={handleStepComplete}
            />
            <div className="flex justify-center mt-4">
              <button
                onClick={() => {
                  // Clear localStorage for this interactive game
                  if (typeof window !== "undefined") {
                    // InteractiveGame uses a single key with JSON data
                    localStorage.removeItem(
                      `lesson-${lessonId}-interactiveGame-progress`
                    );
                  }
                  // Force re-render by changing the key
                  setInteractiveGameKey((prev) => prev + 1);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-300 rounded-2xl hover:bg-primary-300 dark:hover:bg-primary-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {userLanguage === "pt-BR"
                  ? "Comece de Novo"
                  : userLanguage === "th"
                  ? "เริ่มใหม่"
                  : "Start Again"}
              </button>
            </div>
          </div>
        );

      case "pronunciation_drill":
        return (
          <div className="space-y-6">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {currentStepData.content}
            </p>
            <div className="grid gap-4">
              {(currentStepData.phrases || []).map((phrase, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-purple-50 to-primary-50 dark:from-purple-900/20 dark:to-primary-900/20 p-6 rounded-xl"
                >
                  <div className="text-center mb-4">
                    <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      &quot;{phrase.text}&quot;
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      {phrase.phonetic}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {phrase.translation}
                    </p>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                      <Volume2 className="w-4 h-4" />
                      <span>Listen</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                      <Mic className="w-4 h-4" />
                      <span>Record</span>
                    </button>
                  </div>
                  {phrase.confidence_tips && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-50 rounded text-sm">
                      <strong>Confidence Tip:</strong> {phrase.confidence_tips}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "dialogue":
      case "dialogue_immersion":
        return (
          <div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {currentStepData.content}
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6">
              {(
                currentStepData.dialogue ||
                currentStepData.conversation ||
                []
              ).map((line, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    line.speaker === "João" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block max-w-xs lg:max-w-md p-3 rounded-lg ${
                      line.speaker === "João"
                        ? "bg-primary-600 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border"
                    }`}
                  >
                    <p className="font-semibold text-sm mb-1">{line.speaker}</p>
                    <p>{line.text}</p>
                    {line.cultural_note && (
                      <p className="text-xs mt-2 opacity-75">
                        💡 {line.cultural_note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {currentStepData.audio_url && (
              <button
                onClick={toggleAudio}
                className="flex items-center space-x-2 mx-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>{isPlaying ? "Pause" : "Listen to Dialogue"}</span>
              </button>
            )}
            {currentStepData.key_phrases_to_remember && (
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-semibold mb-2">Key Phrases to Remember:</h4>
                <ul className="text-sm space-y-1">
                  {currentStepData.key_phrases_to_remember.map(
                    (phrase, index) => (
                      <li key={index} className="flex items-start">
                        <Star className="w-4 h-4 text-yellow-500 mr-2 mt-0.5" />
                        &quot;{phrase}&quot;
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        );

      case "gap_fill":
      case "gap_fill_advanced":
        return (
          <div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {currentStepData.content}
            </p>

            {currentStepData.scenarios ? (
              // Handle advanced gap fill with multiple scenarios
              <div className="space-y-6">
                {currentStepData.scenarios.map((scenario, scenarioIndex) => {
                  // Split text by underscores and create gaps
                  const textParts = scenario.text.split("_____");
                  const totalGaps = textParts.length - 1;

                  return (
                    <div
                      key={scenarioIndex}
                      className="bg-accent-50 dark:bg-accent-900/20 text-gray-900 dark:text-white p-6 rounded-xl"
                    >
                      <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">
                        {scenario.context}
                      </h4>
                      <div className="text-lg leading-9 mb-4">
                        {textParts.map((part, partIndex) => (
                          <span key={partIndex}>
                            {/* Handle line breaks in text */}
                            {part.split("\n").map((line, lineIndex, lines) => (
                              <span key={lineIndex}>
                                {line}
                                {lineIndex < lines.length - 1 && <br />}
                              </span>
                            ))}
                            {partIndex < totalGaps && (
                              <select
                                value={
                                  selectedAnswers[
                                    `${scenarioIndex}-${partIndex}`
                                  ] || ""
                                }
                                onChange={(e) =>
                                  setSelectedAnswers((prev) => ({
                                    ...prev,
                                    [`${scenarioIndex}-${partIndex}`]:
                                      e.target.value,
                                  }))
                                }
                                className={`mx-2 px-3 py-1 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[120px] ${
                                  showFeedback
                                    ? selectedAnswers[
                                        `${scenarioIndex}-${partIndex}`
                                      ] ===
                                      scenario.gaps[partIndex]?.correct_answer
                                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                      : "border-red-500 bg-red-50 dark:bg-red-900/20"
                                    : "border-gray-300 dark:border-gray-600"
                                }`}
                                disabled={showFeedback}
                              >
                                <option value="">
                                  {userLanguage === "pt-BR"
                                    ? "Escolha..."
                                    : userLanguage === "th"
                                    ? "เลือก..."
                                    : "Choose..."}
                                </option>
                                {scenario.gaps[partIndex]?.options?.map(
                                  (option, optIndex) => (
                                    <option key={optIndex} value={option}>
                                      {option}
                                    </option>
                                  )
                                )}
                              </select>
                            )}
                          </span>
                        ))}
                      </div>

                      {/* Show individual gap feedback after submission */}
                      {showFeedback && (
                        <div className="mt-4 space-y-2">
                          {scenario.gaps.map((gap, gapIndex) => {
                            const userAnswer =
                              selectedAnswers[`${scenarioIndex}-${gapIndex}`];
                            const isGapCorrect =
                              userAnswer === gap.correct_answer;

                            return (
                              <div
                                key={gapIndex}
                                className={`p-3 rounded text-sm ${
                                  isGapCorrect
                                    ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                                    : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  {isGapCorrect ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    <X className="w-4 h-4" />
                                  )}
                                  <span className="font-medium">
                                    Gap {gapIndex + 1}:{" "}
                                    {isGapCorrect
                                      ? userLanguage === "pt-BR"
                                        ? "Correto!"
                                        : userLanguage === "th"
                                        ? "ถูกต้อง!"
                                        : "Correct!"
                                      : userLanguage === "pt-BR"
                                      ? "Incorreto"
                                      : userLanguage === "th"
                                      ? "ไม่ถูกต้อง"
                                      : "Incorrect"}
                                  </span>
                                </div>
                                {!isGapCorrect && (
                                  <div className="mt-1 text-xs">
                                    {userLanguage === "pt-BR"
                                      ? "Você escolheu:"
                                      : userLanguage === "th"
                                      ? "คุณเลือก:"
                                      : "You chose:"}{" "}
                                    &quot;{userAnswer || "nothing"}
                                    &quot; |{" "}
                                    {userLanguage === "pt-BR"
                                      ? "Resposta correta:"
                                      : userLanguage === "th"
                                      ? "คำตอบที่ถูกต้อง:"
                                      : "Correct answer:"}{" "}
                                    &quot;
                                    {gap.correct_answer}&quot;
                                    {gap.explanation && (
                                      <div className="mt-1">
                                        💡 {gap.explanation}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Overall scenario feedback */}
                          {scenario.feedback && (
                            <div className="mt-3 p-3 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 rounded text-sm">
                              <strong>
                                {userLanguage === "pt-BR"
                                  ? "Feedback:"
                                  : userLanguage === "th"
                                  ? "ข้อเสนอแนะ:"
                                  : "Feedback:"}
                              </strong>{" "}
                              {scenario.feedback}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              // Handle standard gap fill - same line break logic
              <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl mb-6">
                <div className="text-xl leading-relaxed">
                  {currentStepData.text
                    ? currentStepData.text
                        .split("_____")
                        .map((part, partIndex) => {
                          const totalGaps =
                            currentStepData.text.split("_____").length - 1;
                          return (
                            <span key={partIndex}>
                              {/* Handle line breaks in text */}
                              {part
                                .split("\n")
                                .map((line, lineIndex, lines) => (
                                  <span key={lineIndex}>
                                    {line}
                                    {lineIndex < lines.length - 1 && <br />}
                                  </span>
                                ))}
                              {partIndex < totalGaps && (
                                <select
                                  value={
                                    selectedAnswers[`gap-${partIndex}`] || ""
                                  }
                                  onChange={(e) =>
                                    setSelectedAnswers((prev) => ({
                                      ...prev,
                                      [`gap-${partIndex}`]: e.target.value,
                                    }))
                                  }
                                  className={`mx-2 px-3 py-1 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[120px] ${
                                    showFeedback
                                      ? selectedAnswers[`gap-${partIndex}`] ===
                                        currentStepData.gaps[partIndex]
                                          ?.correct_answer
                                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                        : "border-red-500 bg-red-50 dark:bg-red-900/20"
                                      : "border-gray-300 dark:border-gray-600"
                                  }`}
                                  disabled={showFeedback}
                                >
                                  <option value="">
                                    {userLanguage === "pt-BR"
                                      ? "Escolha..."
                                      : userLanguage === "th"
                                      ? "เลือก..."
                                      : "Choose..."}
                                  </option>
                                  {currentStepData.gaps[
                                    partIndex
                                  ]?.options?.map((option, optIndex) => (
                                    <option key={optIndex} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </span>
                          );
                        })
                    : null}
                </div>

                {/* Show feedback for standard gap fill */}
                {showFeedback && currentStepData.gaps && (
                  <div className="mt-4 space-y-2">
                    {currentStepData.gaps.map((gap, gapIndex) => {
                      const userAnswer = selectedAnswers[`gap-${gapIndex}`];
                      const isGapCorrect = userAnswer === gap.correct_answer;

                      return (
                        <div
                          key={gapIndex}
                          className={`p-3 rounded text-sm ${
                            isGapCorrect
                              ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                              : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {isGapCorrect ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            <span className="font-medium">
                              Gap {gapIndex + 1}:{" "}
                              {isGapCorrect
                                ? userLanguage === "pt-BR"
                                  ? "Correto!"
                                  : userLanguage === "th"
                                  ? "ถูกต้อง!"
                                  : "Correct!"
                                : userLanguage === "pt-BR"
                                ? "Incorreto"
                                : userLanguage === "th"
                                ? "ไม่ถูกต้อง"
                                : "Incorrect"}
                            </span>
                          </div>
                          {!isGapCorrect && (
                            <div className="mt-1 text-xs">
                              {userLanguage === "pt-BR"
                                ? "Você escolheu:"
                                : userLanguage === "th"
                                ? "คุณเลือก:"
                                : "You chose:"}{" "}
                              &quot;{userAnswer || "nothing"}&quot; |
                              {userLanguage === "pt-BR"
                                ? "Resposta correta:"
                                : userLanguage === "th"
                                ? "คำตอบที่ถูกต้อง:"
                                : "Correct answer:"}{" "}
                              &quot;{gap.correct_answer}&quot;
                              {gap.explanation && (
                                <div className="mt-1">💡 {gap.explanation}</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Overall feedback */}
                    {currentStepData.feedback && (
                      <div className="mt-3 p-3 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 rounded text-sm">
                        <strong>
                          {userLanguage === "pt-BR"
                            ? "Feedback:"
                            : userLanguage === "th"
                            ? "ข้อเสนอแนะ:"
                            : "Feedback:"}
                        </strong>{" "}
                        {currentStepData.feedback}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!showFeedback && (
              <button
                onClick={handleAnswerSubmit}
                disabled={
                  // Check if any gaps are empty
                  currentStepData.scenarios
                    ? currentStepData.scenarios.some(
                        (scenario, scenarioIndex) =>
                          scenario.gaps.some(
                            (_, gapIndex) =>
                              !selectedAnswers[`${scenarioIndex}-${gapIndex}`]
                          )
                      )
                    : currentStepData.gaps?.some(
                        (_, gapIndex) => !selectedAnswers[`gap-${gapIndex}`]
                      )
                }
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {userLanguage === "pt-BR"
                  ? "Verificar Respostas"
                  : userLanguage === "th"
                  ? "ตรวจคำตอบ"
                  : "Check Answers"}
              </button>
            )}

            {showFeedback && (
              <div className="mt-4">
                <div
                  className={`p-4 rounded-lg ${
                    isCorrect
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span className="font-semibold">
                      {isCorrect
                        ? `Perfect! All answers correct. +${
                            20 *
                            (currentStepData.scenarios?.reduce(
                              (total, scenario) => total + scenario.gaps.length,
                              0
                            ) ||
                              currentStepData.gaps?.length ||
                              1)
                          } XP`
                        : "Some answers need work. Review the feedback above and try to remember the correct answers!"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "situational":
      case "situational_challenges":
        return (
          <div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {currentStepData.content}
            </p>

            {currentStepData.challenges ? (
              // Handle challenges format
              <div className="space-y-6">
                {currentStepData.challenges.map((challenge, challengeIndex) => (
                  <div
                    key={challengeIndex}
                    className="bg-gradient-to-r from-purple-50 to-primary-50 dark:from-purple-900/20 dark:to-primary-900/20 p-6 rounded-xl"
                  >
                    <div className="mb-4">
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">
                        Situation {challengeIndex + 1}:
                      </p>
                      <p className="text-lg italic text-gray-700 dark:text-gray-300 mb-4">
                        &quot;{challenge.scenario}&quot;
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {challenge.challenge}
                      </p>
                    </div>

                    <div className="space-y-3 mb-6">
                      {challenge.options?.map((option, optIndex) => (
                        <button
                          key={optIndex}
                          onClick={() =>
                            setSelectedAnswers((prev) => ({
                              ...prev,
                              [`challenge-${challengeIndex}`]: option,
                            }))
                          }
                          className={`w-full p-4 text-left rounded-lg border transition-colors ${
                            selectedAnswers[`challenge-${challengeIndex}`] ===
                            option
                              ? showFeedback
                                ? option === challenge.correct_answer
                                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                                  : "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                                : "text-gray-900 dark:text-white border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                              : "text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                          }`}
                          disabled={showFeedback}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    {/* Individual challenge feedback */}
                    {showFeedback && (
                      <div className="space-y-3">
                        <div
                          className={`p-4 rounded-lg ${
                            selectedAnswers[`challenge-${challengeIndex}`] ===
                            challenge.correct_answer
                              ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                              : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            {selectedAnswers[`challenge-${challengeIndex}`] ===
                            challenge.correct_answer ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <X className="w-5 h-5" />
                            )}
                            <span className="font-semibold">
                              {selectedAnswers[
                                `challenge-${challengeIndex}`
                              ] === challenge.correct_answer
                                ? "Correct! Excellent choice!"
                                : "Not quite right"}
                            </span>
                          </div>

                          {selectedAnswers[`challenge-${challengeIndex}`] !==
                            challenge.correct_answer && (
                            <div className="text-sm mb-2">
                              <strong>You chose:</strong> &quot;
                              {selectedAnswers[`challenge-${challengeIndex}`] ||
                                "nothing"}
                              &quot;
                              <br />
                              <strong>Correct answer:</strong> &quot;
                              {challenge.correct_answer}&quot;
                            </div>
                          )}

                          {challenge.explanation && (
                            <div className="text-sm">
                              <strong>Explanation:</strong>{" "}
                              {challenge.explanation}
                            </div>
                          )}
                        </div>

                        {challenge.follow_up_tips && (
                          <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
                            <p className="font-semibold mb-1 text-primary-800 dark:text-primary-200">
                              Tips for next time:
                            </p>
                            <ul className="text-sm text-primary-700 dark:text-primary-300 space-y-1">
                              {challenge.follow_up_tips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="flex items-start">
                                  <span className="text-primary-600 mr-2">
                                    •
                                  </span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Handle standard situational format (backwards compatibility)
              <div className="bg-gradient-to-r from-purple-50 to-primary-50 dark:from-purple-900/20 dark:to-primary-900/20 p-6 rounded-xl mb-6">
                <p className="font-semibold text-gray-900 dark:text-white mb-4">
                  Situation:
                </p>
                <p className="text-lg italic text-gray-700 dark:text-gray-300 mb-4">
                  &quot;{currentStepData.situation}&quot;
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {currentStepData.question}
                </p>
              </div>
            )}

            {!currentStepData.challenges && (
              <>
                <div className="space-y-3 mb-6">
                  {currentStepData.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(option)}
                      className={`w-full p-4 text-left rounded-lg border transition-colors ${
                        selectedAnswer === option
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                      disabled={showFeedback}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {!showFeedback && (
                  <button
                    onClick={handleAnswerSubmit}
                    disabled={!selectedAnswer}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {userLanguage === "pt-BR"
                      ? "Enviar Resposta"
                      : userLanguage === "th"
                      ? "ส่งคำตอบ"
                      : "Submit Answer"}
                  </button>
                )}
                {showFeedback && (
                  <div
                    className={`p-4 rounded-lg mb-4 ${
                      isCorrect
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                      <span className="font-semibold">
                        {isCorrect
                          ? "Excellent choice! +20 XP"
                          : "Good try! Here's why this matters:"}
                      </span>
                    </div>
                    {currentStepData.explanation && (
                      <p className="text-sm mt-2">
                        {currentStepData.explanation}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Submit button for challenges */}
            {currentStepData.challenges && !showFeedback && (
              <button
                onClick={handleAnswerSubmit}
                disabled={
                  // Check if all challenges have been answered
                  currentStepData.challenges.some(
                    (_, challengeIndex) =>
                      !selectedAnswers[`challenge-${challengeIndex}`]
                  )
                }
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {userLanguage === "pt-BR"
                  ? "Enviar Respostas"
                  : userLanguage === "th"
                  ? "ส่งคำตอบ"
                  : "Submit Answers"}
              </button>
            )}

            {/* Overall feedback for challenges */}
            {currentStepData.challenges && showFeedback && (
              <div className="mt-6">
                <div
                  className={`p-4 rounded-lg ${
                    isCorrect
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span className="font-semibold">
                      {isCorrect
                        ? `Perfect! All situations handled correctly. +${
                            20 * currentStepData.challenges.length
                          } XP`
                        : `You got ${
                            currentStepData.challenges.filter(
                              (challenge, index) =>
                                selectedAnswers[`challenge-${index}`] ===
                                challenge.correct_answer
                            ).length
                          } out of ${
                            currentStepData.challenges.length
                          } correct. Keep practicing!`}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "audio_recognition":
        return (
          <div className="space-y-6">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {currentStepData.content}
            </p>
            <div className="grid gap-6">
              {(currentStepData.audio_clips || []).map((clip, index) => (
                <div
                  key={index}
                  className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Audio Clip {index + 1}</h4>
                    <button
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      onClick={() => playAudio(clip.audio_url)}
                    >
                      <Headphones className="w-4 h-4" />
                      <span>Listen</span>
                    </button>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    <strong>Instruction:</strong> {clip.instruction}
                  </p>
                  {clip.key_actions && (
                    <div className="mb-3">
                      <strong>Key Actions:</strong>
                      <ul className="mt-1 text-sm">
                        {clip.key_actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {clip.your_response && (
                    <div className="p-3 bg-white dark:bg-gray-800 rounded border-l-4 border-green-500">
                      <strong>Your Response:</strong> &quot;{clip.your_response}
                      &quot;
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "cultural_insights":
        return (
          <div className="space-y-6">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {currentStepData.content}
            </p>
            <div className="grid gap-6">
              {(currentStepData.insights || []).map((insight, index) => (
                <div
                  key={index}
                  className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl"
                >
                  <div className="flex items-start space-x-3 mb-4">
                    <div
                      className={`w-3 h-3 rounded-full mt-2 ${
                        insight.importance === "Critical"
                          ? "bg-red-500"
                          : insight.importance === "Very Important"
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                      }`}
                    ></div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {insight.topic}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          insight.importance === "Critical"
                            ? "bg-red-100 text-red-800"
                            : insight.importance === "Very Important"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {insight.importance}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {insight.explanation}
                  </p>
                  {insight.practical_tips && (
                    <div>
                      <h5 className="font-semibold mb-2 text-gray-900 dark:text-white">
                        Practical Tips:
                      </h5>
                      <ul className="text-sm space-y-1">
                        {insight.practical_tips.map((tip, tipIndex) => (
                          <li
                            key={tipIndex}
                            className="flex items-start text-gray-700 dark:text-gray-300"
                          >
                            <span className="text-primary-600 mr-2">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "emergency_scenarios":
        return (
          <div className="space-y-6">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {currentStepData.content}
            </p>
            <div className="grid gap-6">
              {(currentStepData.emergency_types || []).map(
                (emergency, index) => (
                  <div
                    key={index}
                    className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border-l-4 border-red-500"
                  >
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      {emergency.emergency}
                    </h4>

                    {emergency.immediate_actions && (
                      <div className="mb-4">
                        <h5 className="font-semibold mb-2">
                          Immediate Actions:
                        </h5>
                        <ul className="text-sm space-y-1">
                          {emergency.immediate_actions.map(
                            (action, actionIndex) => (
                              <li
                                key={actionIndex}
                                className="flex items-start"
                              >
                                <span className="text-red-600 mr-2">1.</span>
                                {action}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {emergency.what_to_say && (
                      <div className="mb-4">
                        <h5 className="font-semibold mb-2">What to Say:</h5>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded space-y-2">
                          {emergency.what_to_say.map((phrase, phraseIndex) => (
                            <p key={phraseIndex} className="text-sm font-mono">
                              &quot;{phrase}&quot;
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {emergency.phone_emergency && (
                      <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded">
                        <strong>Emergency Number:</strong>{" "}
                        {emergency.phone_emergency}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        );

      case "interactive_map":
        return (
          <div className="space-y-6">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {currentStepData.content}
            </p>

            {/* Interactive Map Container */}
            <div className="bg-gradient-to-br from-primary-50 to-green-50 dark:from-primary-900/20 dark:to-green-900/20 p-6 rounded-xl">
              <div className="relative">
                {/* Map Image */}
                <img
                  src={
                    currentStepData.map_image ||
                    "/images/training-ground-map.jpg"
                  }
                  alt="Interactive Map"
                  className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f3f4f6'/%3E%3Ctext x='300' y='200' text-anchor='middle' fill='%236b7280' font-size='16'%3EInteractive Map Coming Soon%3C/text%3E%3C/svg%3E";
                  }}
                />

                {/* Interactive Elements */}
                {currentStepData.interactive_elements?.map((element, index) => (
                  <div
                    key={index}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{
                      left: element.x || `${20 + index * 15}%`,
                      top: element.y || `${30 + index * 15}%`,
                    }}
                    onClick={() => {
                      // Handle click - show popup or info
                      alert(element.popup || `Learn about: ${element.area}`);
                    }}
                  >
                    <div className="w-4 h-4 bg-primary-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-primary-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {element.popup || element.area}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend/Instructions */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Click on the highlighted areas to explore and learn key
                  vocabulary
                </p>
              </div>
            </div>

            {/* Vocabulary Review */}
            {currentStepData.interactive_elements && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3 text-black dark:text-white">
                  Areas to Explore:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentStepData.interactive_elements.map(
                    (element, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white dark:bg-gray-800 rounded border"
                      >
                        <h5 className="collapse font-medium text-black dark:text-gray-300">
                          {element.area}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {element.popup}
                        </p>
                        {element.vocab_review && (
                          <div className="mt-2">
                            <span className="text-xs text-primary-600">
                              Key words: {element.vocab_review.join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case "confidence_building":
        return (
          <div className="space-y-6">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {currentStepData.content}
            </p>

            <div className="grid gap-6">
              {(currentStepData.strategies || []).map((strategy, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-green-50 to-primary-50 dark:from-green-900/20 dark:to-primary-900/20 p-6 rounded-xl"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {strategy.strategy}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {strategy.description}
                      </p>

                      {strategy.examples && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                            Examples:
                          </h4>
                          <ul className="space-y-1">
                            {strategy.examples.map((example, exIndex) => (
                              <li
                                key={exIndex}
                                className="text-sm text-gray-600 dark:text-gray-300 flex items-start"
                              >
                                <span className="text-green-600 mr-2">•</span>
                                &quot;
                                {example}&quot;
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {strategy.tips && (
                        <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-green-500">
                          <h4 className="font-medium mb-1 text-gray-900 dark:text-white">
                            Tips:
                          </h4>
                          <ul className="text-sm space-y-1">
                            {strategy.tips.map((tip, tipIndex) => (
                              <li
                                key={tipIndex}
                                className="text-gray-600 dark:text-gray-300"
                              >
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {strategy.mindset && (
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>Mindset:</strong> {strategy.mindset}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "problem_solving":
        return (
          <div className="space-y-6">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {currentStepData.content}
            </p>

            <div className="space-y-6">
              {(currentStepData.problems || []).map((problem, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        problem.urgency === "High"
                          ? "bg-red-500"
                          : problem.urgency === "Medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    >
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {problem.problem}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            problem.urgency === "High"
                              ? "bg-red-100 text-red-800"
                              : problem.urgency === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {problem.urgency} Priority
                        </span>
                      </div>

                      {problem.who_to_contact && (
                        <div className="mb-3">
                          <strong>Who to contact:</strong>{" "}
                          {problem.who_to_contact}
                        </div>
                      )}

                      {problem.what_to_say && (
                        <div className="mb-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                          <h4 className="font-medium mb-2">What to say:</h4>
                          <p className="text-sm font-mono bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-primary-500">
                            &quot;{problem.what_to_say}&quot;
                          </p>
                        </div>
                      )}

                      {problem.solution_steps && (
                        <div className="mb-3">
                          <h4 className="font-medium mb-2">Solution Steps:</h4>
                          <ol className="text-sm space-y-1">
                            {problem.solution_steps.map((step, stepIndex) => (
                              <li key={stepIndex} className="flex items-start">
                                <span className="bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                                  {stepIndex + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {problem.your_rights && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            <strong>Your Rights:</strong> {problem.your_rights}
                          </p>
                        </div>
                      )}

                      {problem.cultural_tip && (
                        <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                          <p className="text-sm text-purple-800 dark:text-purple-200">
                            <strong>Cultural Tip:</strong>{" "}
                            {problem.cultural_tip}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "position_specific":
        return (
          <div className="space-y-6">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {currentStepData.content}
            </p>

            <div className="space-y-6">
              {Object.entries(
                currentStepData.midfielder_communications || {}
              ).map(([situationType, situationData], index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-primary-50 to-green-50 dark:from-primary-900/20 dark:to-green-900/20 p-6 rounded-xl"
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {situationType
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </h3>

                  {situationData.what_teammates_shout && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                        What teammates shout to you:
                      </h4>
                      <div className="grid gap-2">
                        {situationData.what_teammates_shout.map(
                          (shout, shoutIndex) => (
                            <div
                              key={shoutIndex}
                              className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-primary-500"
                            >
                              <span className="font-mono text-primary-600 dark:text-blue-400">
                                &quot;{shout.split(" - ")[0]}&quot;
                              </span>
                              {shout.includes(" - ") && (
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                  - {shout.split(" - ")[1]}
                                </span>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {situationData.your_responses && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Your responses:
                      </h4>
                      <div className="grid gap-2">
                        {situationData.your_responses.map(
                          (response, responseIndex) => (
                            <div
                              key={responseIndex}
                              className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-green-500"
                            >
                              <span className="font-mono text-green-600 dark:text-green-400">
                                &quot;{response.split(" - ")[0]}&quot;
                              </span>
                              {response.includes(" - ") && (
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                  - {response.split(" - ")[1]}
                                </span>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {situationData.leadership_phrases && (
                    <div>
                      <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Leadership phrases:
                      </h4>
                      <div className="grid gap-2">
                        {situationData.leadership_phrases.map(
                          (phrase, phraseIndex) => (
                            <div
                              key={phraseIndex}
                              className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-purple-500"
                            >
                              <span className="font-mono text-purple-600 dark:text-purple-400">
                                &quot;{phrase.split(" - ")[0]}&quot;
                              </span>
                              {phrase.includes(" - ") && (
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                  - {phrase.split(" - ")[1]}
                                </span>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "injury_dialogue":
        // Reuse dialogue logic but with medical styling
        return (
          <div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {currentStepData.content}
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mb-6 border-l-4 border-red-500">
              {(currentStepData.dialogue || []).map((line, index) => (
                <div key={index} className="mb-4">
                  <div
                    className={`p-3 rounded-lg ${
                      line.speaker === "João"
                        ? "bg-primary-100 dark:bg-blue-900/30 ml-8"
                        : "bg-white dark:bg-gray-800 mr-8"
                    }`}
                  >
                    <p className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">
                      {line.speaker}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {line.text}
                    </p>
                    {line.professional_approach && (
                      <p className="text-xs mt-2 text-green-600 dark:text-green-400">
                        💡 {line.professional_approach}
                      </p>
                    )}
                    {line.good_reporting && (
                      <p className="text-xs mt-2 text-primary-600 dark:text-blue-400">
                        ✅ {line.good_reporting}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Key Communication Points:</h4>
              <ul className="text-sm space-y-1">
                <li>• Be specific about timing and location</li>
                <li>• Describe pain using 0-10 scale</li>
                <li>• Mention what makes it better/worse</li>
                <li>• Report changes since the injury occurred</li>
              </ul>
            </div>
          </div>
        );

      // Add cases for other step types...
      case "pain_scale_training":
      case "media_landscape":
      case "motivational_language":
      case "conflict_resolution":
      case "team_talk_structure":
      case "phone_simulation":
      case "transport_mastery":
      case "social_etiquette":
      case "problem_solving":
      case "building_culture":
      case "interview_simulation":
      case "video_analysis_dialogue":
        return (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl">
            <div className="flex items-center space-x-2 mb-4">
              {getStepIcon(currentStepData.type)}
              <h3 className="text-lg font-semibold">
                {translations[`step-title-${currentStep}`] ||
                  currentStepData.title}
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {currentStepData.content}
            </p>
            <div className="bg-primary-100 dark:bg-blue-900/30 p-4 rounded">
              <p className="text-sm text-primary-800 dark:text-primary-200">
                <strong>Note:</strong> This advanced step type (
                {currentStepData.type}) is being developed. The content
                structure is ready and will be fully interactive soon.
              </p>
            </div>
            {/* Display raw content for debugging */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-500">
                View content structure
              </summary>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 overflow-auto">
                {JSON.stringify(currentStepData, null, 2)}
              </pre>
            </details>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              Unknown step type: {currentStepData.type}
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                This step type needs to be implemented in the lesson renderer.
              </p>
              <details>
                <summary className="cursor-pointer">View step data</summary>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 overflow-auto text-left">
                  {JSON.stringify(currentStepData, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(getWorldUrl())}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                {lesson?.world && WORLDS[lesson.world]
                  ? WORLDS[lesson.world].name
                  : "Worlds"}
              </span>
            </button>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 dark:text-gray-300 font-bold">
              {lesson.pillar?.display_name || "Lesson"}
            </span>
          </div>
          <button
            onClick={() => router.push(getWorldUrl())}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title={
              userLanguage === "pt-BR"
                ? "Voltar ao Mundo"
                : userLanguage === "th"
                ? "กลับไปที่โลก"
                : "Back to World"
            }
          >
            <Home className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {lesson.title}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              {/* <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                {lesson.pillar?.display_name || "Lesson"}
              </span> */}
              {/* <span className="px-3 py-1 bg-white text-accent-800 rounded-full text-sm font-medium">
                {lesson.difficulty}
              </span> */}
              {/* <span className="text-gray-600 dark:text-gray-300 text-sm">
                {lesson.xp_reward} XP Available
              </span> */}
            </div>
          </div>
          {/* <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              XP Earned
            </p>
            <p className="text-2xl font-bold text-green-600">{xpEarned}</p>
          </div> */}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
          <div
            className="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>
            Step {currentStep + 1} of {steps.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>

        {/* XP Progress Indicator */}
        {journey && journey.current_adventure_id && (
          <div className="mt-4 px-3 py-1 bg-linear-to-r from-accent-50 to-accent-100 dark:from-primary-700 dark:to-primary-800 rounded-lg border border-accent-200 dark:border-accent-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy
                  className={`w-5 h-5 ${
                    cumulativeXP >= 100
                      ? "text-green-600 dark:text-green-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                />
                <span className="font-semibold text-gray-900 dark:text-white">
                  Lesson XP: {cumulativeXP} / 100
                </span>
              </div>
              <span
                className={`text-sm font-medium ${
                  cumulativeXP >= 100
                    ? "text-green-600 dark:text-green-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {cumulativeXP >= 100
                  ? "✓ Threshold met!"
                  : `${100 - cumulativeXP} XP needed`}
              </span>
            </div>
            {/* <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  cumulativeXP >= 200 ? "bg-green-600" : "bg-amber-500"
                }`}
                style={{
                  width: `${Math.min((cumulativeXP / 200) * 100, 100)}%`,
                }}
              ></div>
            </div> */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {cumulativeXP >= 100
                ? "Great! You'll advance the species when you complete the lesson."
                : "Earn 100 XP to advance the species to the next IUCN level."}
            </p>
          </div>
        )}
      </div>

      {/* Step Content */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          {/* {getStepIcon(currentStepData?.type)} */}
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {translations[`step-title-${currentStep}`] ||
              currentStepData?.title}
          </h2>
        </div>

        {/* Step completion indicator */}
        {stepCompleted && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">{t("step_complete")}</span>
          </div>
        )}

        {renderStepContent()}
      </div>

      {/* Navigation - hide for challenge_reference steps (they have their own navigation) */}
      {currentStepData?.type !== "challenge_reference" && (
        <div className="flex gap-4 justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
          {currentStep === 0 ? (
            <button
              onClick={() => router.push(getWorldUrl())}
              // disabled={currentStep === 0 || completing}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white border-2 border-accent-600 dark:border-accent-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {/* <span>Voltar</span> */}
            </button>
          ) : (
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0 || completing}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white border-2 border-accent-600 dark:border-accent-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {/* <span>Atividade anterior</span> */}
            </button>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {completedSteps.size} of {steps.length - 1} activities completed
            </p>
            {completing && (
              <p className="text-xs text-primary-600 mt-1">
                {userLanguage === "pt-BR"
                  ? "Salvando progresso..."
                  : userLanguage === "th"
                  ? "กำลังบันทึกความก้าวหน้า..."
                  : "Saving progress..."}
              </p>
            )}
          </div>

          <button
            onClick={
              currentStep === steps.length - 1
                ? handleLessonComplete
                : handleNext
            }
            disabled={
              completing ||
              (currentStep === steps.length - 1 &&
                currentStepData?.type !== "completion") ||
              (!stepAttempted &&
                !completedSteps.has(currentStep) &&
                stepRequiresInteraction(currentStepData?.type))
            }
            className="flex items-center space-x-2 px-6 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {completing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>
                  {userLanguage === "pt-BR"
                    ? "Concluindo..."
                    : userLanguage === "th"
                    ? "กำลังดำเนินการ..."
                    : "Completing..."}
                </span>
              </>
            ) : (
              <>
                {/* <span>
                {currentStep === steps.length - 1 ? "Aula Completa" : ""}
              </span> */}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Unit Modal */}
      <UnitModal
        unitId={currentUnitId}
        isOpen={unitModalOpen}
        initialShowFullText={unitShowFullText}
        displayMode={unitDisplayMode}
        onClose={() => setUnitModalOpen(false)}
        onXPAwarded={(xp) => {
          // Award XP incrementally as answers are submitted
          setXpEarned((prev) => prev + xp);
          setCumulativeXP((prev) => prev + xp); // Also update cumulative XP for progress bar
        }}
        onComplete={(result) => {
          console.log("Unit completed:", result);

          // Note: XP now awarded via onXPAwarded callback during exercise
          // This callback is for tracking completion status

          // Track this unit as completed for showing checkmark
          if (currentUnitId) {
            setCompletedUnits((prev) => new Set([...prev, currentUnitId]));
          }

          setStepCompleted(true);
          // Don't auto-close modal - let user review answers and close manually
        }}
      />
    </div>
  );
}

export default function DynamicLessonPage() {
  return (
    <ProtectedRoute>
      <DynamicLessonContent />
    </ProtectedRoute>
  );
}
