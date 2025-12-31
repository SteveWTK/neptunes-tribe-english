// components/MultiGapFillExerciseNew.js - Enhanced with Hover-based Feedback
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { fetchData, fetchUnitDetails } from "@/lib/data-service";
import supabase from "@/lib/supabase-browser";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";

import TextExpander from "./TextExpander";
import PieChartAnswers from "./PieChartAnswers";
import TextWithGlossary from "./TextWithGlossary";
import { fetchGlossaryTerms } from "@/lib/glossaryUtils";
import { toast } from "sonner";

export default function MultiGapFillExerciseNew({
  unitId,
  initialShowFullText = false,
}) {
  const [unitData, setUnitData] = useState(null);
  const [textId, setTextId] = useState(null);
  const [fullText, setFullText] = useState("");
  const [gapText, setGapText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [showFullText, setShowFullText] = useState(initialShowFullText);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [translations, setTranslations] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState("no");
  const [isLoading, setIsLoading] = useState(false);
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
  const [challengeResults, setChallengeResults] = useState([]);
  const [speciesUnlocked, setSpeciesUnlocked] = useState([]);
  const [expandedNotes, setExpandedNotes] = useState(new Set());
  const [hoveredGap, setHoveredGap] = useState(null);
  const [showHoverInstruction, setShowHoverInstruction] = useState(false);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // GLOSSARY FEATURE: State for glossary terms and saved words
  const [glossaryTerms, setGlossaryTerms] = useState([]);
  const [savedGlossaryWords, setSavedGlossaryWords] = useState(new Set());

  // FEATURE 1: User type/level for conditional rendering
  const [userType, setUserType] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(null);

  // FEATURE 2: Audio play limit
  const [audioPlayCount, setAudioPlayCount] = useState(0);
  const maxAudioPlays = 3;

  // FEATURE 3: Show tooltip on audio button hover
  const [showAudioTooltip, setShowAudioTooltip] = useState(false);

  const { data: session } = useSession();
  const { user } = useAuth();
  const router = useRouter();
  const { lang } = useLanguage();

  const languageLabels = {
    pt: "Português",
    es: "Español",
    fr: "Français",
    th: "Thai",
  };

  const t = {
    en: {
      showFullTextButton: "Show Full Text",
      showGapFillButton: "Show Gap Fill",
      translationButton: "Translation",
      submitAnswersButton: "Submit Answers",
      tryAgainButton: "Try Again",
      region: "Region",
      playAudio: "Listen",
      correctAnswer: "Correct answer:",
      showExplanation: "Show explanation",
      hideExplanation: "Hide explanation",
      hoverInstruction:
        "Hover over the gaps to see correct answers and explanations",
    },
    pt: {
      showFullTextButton: "Ver Texto Completo",
      showGapFillButton: "Ver Exercício",
      translationButton: "Tradução",
      submitAnswersButton: "Enviar Respostas",
      tryAgainButton: "Tentar Novamente",
      region: "Região",
      playAudio: "Ouça",
      correctAnswer: "Resposta correta:",
      showExplanation: "Mostrar explicação",
      hideExplanation: "Ocultar explicação",
      hoverInstruction:
        "Passe o mouse sobre as lacunas para ver as respostas corretas e explicações",
    },
  };

  const copy = t[lang];
  const percentage = (score / questions.length) * 100;
  const xpPerCorrectAnswer = 10;
  const bonusForPerfect = 20;

  let message;
  if (percentage === 100) {
    message = `Perfect score! Fantastic work! You have added ${
      score * xpPerCorrectAnswer + bonusForPerfect
    } points to your progress!`;
  } else if (percentage >= 80) {
    message = `Great job! You have added ${
      score * xpPerCorrectAnswer
    } points to your progress!`;
  } else if (percentage >= 60) {
    message = `Good effort! You have added ${
      score * xpPerCorrectAnswer
    } points to your progress!`;
  } else if (percentage >= 40) {
    message = `Not bad! You have added ${
      score * xpPerCorrectAnswer
    } points to your progress!`;
  } else {
    message = `Keep going! Practice makes perfect! You have added ${
      score * xpPerCorrectAnswer
    } points to your progress!`;
  }

  useEffect(() => {
    async function loadData() {
      try {
        const unitDetails = await fetchUnitDetails(unitId);
        const {
          textId,
          fullText,
          gapText,
          portugueseTranslation,
          spanishTranslation,
          frenchTranslation,
          questions,
        } = await fetchData(unitId);

        setUnitData(unitDetails);
        setTextId(textId);
        setFullText(fullText);
        setGapText(gapText);
        setQuestions(questions);
        setTranslations({
          pt: portugueseTranslation,
          es: spanishTranslation,
          fr: frenchTranslation,
        });

        if (session?.user?.email) {
          await checkIfUnitCompleted();
        }
      } catch (err) {
        console.error("Error loading unit data:", err);
      }
    }

    if (unitId) loadData();
  }, [unitId, session?.user?.email]);

  // FEATURE 1: Fetch user type and level for conditional rendering
  useEffect(() => {
    async function fetchUserData() {
      if (!user?.id && !user?.userId) return;

      try {
        const supabaseClient = createClient();
        const userId = user.userId || user.id;

        const { data, error } = await supabaseClient
          .from("users")
          .select("user_type, current_level")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
          return;
        }

        setUserType(data?.user_type || "individual");
        setCurrentLevel(data?.current_level || "Beginner");
      } catch (error) {
        console.error("Error in fetchUserData:", error);
      }
    }

    fetchUserData();
  }, [user]);

  // GLOSSARY FEATURE: Fetch glossary terms based on user level
  useEffect(() => {
    async function loadGlossary() {
      try {
        const supabaseClient = createClient();
        const terms = await fetchGlossaryTerms(supabaseClient, currentLevel);
        setGlossaryTerms(terms);
      } catch (error) {
        console.error("Error loading glossary:", error);
      }
    }

    if (currentLevel) {
      loadGlossary();
    }
  }, [currentLevel]);

  // Enhanced data fetching to include notes
  useEffect(() => {
    async function loadQuestionsWithNotes() {
      if (!textId) return;

      try {
        const { data: gapData, error: gapError } = await supabase
          .from("gap_fill_questions")
          .select(
            "gap_number, correct_answer, options, part_before, part_after, text_id, notes"
          )
          .eq("text_id", textId);

        if (gapError) {
          console.error("Error fetching gaps with notes:", gapError);
          return;
        }

        const formattedQuestions =
          gapData?.map((q) => ({
            ...q,
            options:
              typeof q.options === "string" ? q.options.split(",") : q.options,
          })) || [];

        setQuestions(formattedQuestions);
      } catch (error) {
        console.error("Error loading questions with notes:", error);
      }
    }

    if (textId) {
      loadQuestionsWithNotes();
    }
  }, [textId]);

  const checkIfUnitCompleted = async () => {
    if (!session?.user?.email) return;

    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", session.user.email)
        .single();

      if (userError || !userData) return;

      const { data: completionData, error: completionError } = await supabase
        .from("completed_units")
        .select("id")
        .eq("user_id", userData.id)
        .eq("unit_id", unitId)
        .single();

      if (completionData) {
        setIsAlreadyCompleted(true);
      }
    } catch (error) {
      console.error("Error checking unit completion:", error);
    }
  };

  const handleChange = (questionId, selectedAnswer) => {
    setUserAnswers({ ...userAnswers, [questionId]: selectedAnswer });
  };

  const toggleNoteExpansion = (gapNumber) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(gapNumber)) {
      newExpanded.delete(gapNumber);
    } else {
      newExpanded.add(gapNumber);
    }
    setExpandedNotes(newExpanded);
  };

  // GLOSSARY FEATURE: Save word to personal vocabulary list
  const handleSaveGlossaryWord = async (wordData) => {
    const { en, pt } = wordData;

    try {
      const payload = {
        english: en,
        portuguese: pt,
        englishImage: null,
        portugueseImage: null,
        lessonId: null, // unitId is an integer, but DB expects UUID - set to null for glossary saves
        stepType: "glossary",
      };

      console.log("🔍 Saving glossary word:", payload);

      const response = await fetch("/api/vocabulary/personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("📥 Response status:", response.status);

      const data = await response.json();
      console.log("📥 Response data:", data);

      if (response.status === 401) {
        toast.error("Please log in to save words to your practice list");
        return;
      }

      if (!response.ok) {
        const errorMsg = data.details || data.error || "Failed to save word";
        console.error("❌ API Error:", errorMsg);
        throw new Error(errorMsg);
      }

      if (data.success) {
        setSavedGlossaryWords((prev) => new Set([...prev, en.toLowerCase()]));
        toast.success(`"${en}" saved to your practice list!`, {
          description: "You can practice it later in vocabulary games",
          duration: 3000,
        });
        console.log("✅ Word saved successfully");
      } else if (data.alreadyExists) {
        setSavedGlossaryWords((prev) => new Set([...prev, en.toLowerCase()]));
        toast.info(`"${en}" is already in your practice list`);
        console.log("ℹ️ Word already exists");
      }
    } catch (error) {
      console.error("❌ Error saving glossary word:", error);
      toast.error(`Failed to save word: ${error.message}`);
    }
  };

  const renderGapWithHoverFeedback = (question, index) => {
    const questionId = `${unitId}-${question.gap_number}`;
    const userAnswer = userAnswers[questionId];
    const isCorrect = userAnswer === question.correct_answer;
    const hasNotes = question.notes && question.notes.trim().length > 0;
    const isNoteExpanded = expandedNotes.has(question.gap_number);

    // Create unique key using both unit ID, gap number, and index position
    const uniqueKey = `gap-${unitId}-${question.gap_number}-${index}`;
    // Simplified hover identifier
    const hoverIdentifier = `${question.gap_number}-${index}`;
    const isHovered = hoveredGap === hoverIdentifier;

    const handleMouseEnter = () => {
      console.log("SPAN MOUSE ENTER TRIGGERED for:", hoverIdentifier);
      if (isSubmitted) {
        console.log("Setting hover to:", hoverIdentifier);
        setHoveredGap(hoverIdentifier);
      }
    };

    const handleMouseLeave = (e) => {
      // Check if we're moving to the popup or staying within the gap area
      const relatedTarget = e.relatedTarget;
      const currentTarget = e.currentTarget;

      // If we're moving to a child element (like the popup), don't hide
      if (relatedTarget && currentTarget.contains(relatedTarget)) {
        console.log("Mouse moving to child element, keeping popup open");
        return;
      }

      console.log("SPAN MOUSE LEAVE TRIGGERED for:", hoverIdentifier);
      setHoveredGap(null);
    };

    return (
      <span
        key={uniqueKey}
        className="inline-block relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <select
          className={`font-josefin mx-2 my-1 border rounded px-2 transition-colors duration-200 ${
            isSubmitted
              ? isCorrect
                ? "bg-teal-800 text-white"
                : "bg-rose-800 text-white"
              : userAnswer
              ? "bg-primary-500 text-accent-50 hover:bg-accent-200 hover:text-accent-900"
              : "bg-accent-100 hover:bg-accent-200 text-accent-900"
          }`}
          value={userAnswer || ""}
          onChange={(e) => handleChange(questionId, e.target.value)}
          disabled={isSubmitted}
        >
          <option value="">Select</option>
          {question.options.map((option, idx) => (
            <option key={`${uniqueKey}-opt-${idx}`} value={option}>
              {option}
            </option>
          ))}
        </select>

        {/* Debug info - remove this later */}
        {/* {isSubmitted && (
          <div className="text-xs text-gray-500 absolute -bottom-5 left-0">
            Gap: {question.gap_number}, Hover: {hoverIdentifier}, Current:{" "}
            {hoveredGap}, Match: {isHovered ? "YES" : "NO"}
          </div>
        )} */}

        {/* Hover feedback popup - only shows on hover after submission */}
        {isSubmitted && isHovered && (
          <div
            className="absolute top-full left-0 z-20"
            onMouseEnter={() => {
              console.log("Popup mouse enter - keeping open");
              // Keep the popup open when hovering over it
              setHoveredGap(hoverIdentifier);
            }}
            onMouseLeave={() => {
              console.log("Popup mouse leave - closing");
              // Close when leaving the popup
              setHoveredGap(null);
            }}
          >
            {/* Invisible bridge to connect gap and popup */}
            <div className="absolute -top-1 left-0 right-0 h-2 bg-transparent"></div>

            <div
              className={`min-w-max max-w-xs p-3 rounded-lg shadow-lg border-2 mt-1 ${
                isCorrect
                  ? "bg-teal-50 border-teal-200 dark:bg-teal-900 dark:border-teal-700"
                  : "bg-rose-50 border-rose-200 dark:bg-rose-900 dark:border-rose-700"
              }`}
            >
              <div className="space-y-2">
                {isCorrect ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-teal-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-teal-800 dark:text-teal-200 text-sm font-medium">
                      Correct!
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-teal-600 dark:text-teal-400 text-sm font-medium">
                      {copy.correctAnswer}
                    </span>
                    <span className="text-teal-800 dark:text-teal-200 text-sm font-bold">
                      {question.correct_answer}
                    </span>
                  </div>
                )}

                {/* Notes section with expand/collapse */}
                {hasNotes && (
                  <div className="border-t pt-2 mt-2">
                    <button
                      onClick={() => toggleNoteExpansion(question.gap_number)}
                      className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      <svg
                        className={`w-3 h-3 transition-transform ${
                          isNoteExpanded ? "rotate-90" : ""
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {isNoteExpanded
                        ? copy.hideExplanation
                        : copy.showExplanation}
                    </button>

                    {isNoteExpanded && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-700 dark:text-gray-300">
                        {question.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </span>
    );
  };

  const handleSubmit = async () => {
    if (!session?.user?.email) {
      alert("Please log in to save your progress!");
      return;
    }

    setIsLoading(true);

    try {
      let correctCount = 0;
      questions.forEach((q) => {
        if (userAnswers[`${unitId}-${q.gap_number}`] === q.correct_answer)
          correctCount++;
      });

      setScore(correctCount);
      setIsSubmitted(true);
      setShowHoverInstruction(true);

      // FEATURE 2: Reset audio play count when user submits
      setAudioPlayCount(0);

      // Hide instruction after 5 seconds
      setTimeout(() => {
        setShowHoverInstruction(false);
      }, 5000);

      const totalQuestions = questions.length;
      const percentage = (correctCount / totalQuestions) * 100;
      const passedThreshold = percentage >= 60;

      let earnedXP = correctCount * xpPerCorrectAnswer;
      if (correctCount === totalQuestions) {
        earnedXP += bonusForPerfect;
      }

      const justCompleted = await updateUserProgressInDB(
        session.user.email,
        unitId,
        correctCount,
        totalQuestions,
        earnedXP,
        passedThreshold
      );

      showXPToast(
        earnedXP,
        justCompleted && passedThreshold,
        challengeResults,
        speciesUnlocked
      );
    } catch (error) {
      console.error("Error submitting answers:", error);
      alert("There was an error saving your progress. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProgressInDB = async (
    email,
    unitId,
    correctCount,
    totalQuestions,
    earnedXP,
    passedThreshold
  ) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (userError || !userData) {
        throw new Error("User not found in database");
      }

      const userId = userData.id;

      const { data: existingCompletion } = await supabase
        .from("completed_units")
        .select("id")
        .eq("user_id", userId)
        .eq("unit_id", unitId)
        .single();

      const wasAlreadyCompleted = !!existingCompletion;
      let justCompleted = false;

      if (passedThreshold && !wasAlreadyCompleted) {
        const { error: completionError } = await supabase
          .from("completed_units")
          .insert({
            user_id: userId,
            unit_id: unitId,
          });

        if (completionError) {
          console.error("Error marking unit as completed:", completionError);
        } else {
          console.log("Unit marked as completed successfully");
          justCompleted = true;
          setIsAlreadyCompleted(true);

          // 🌱 UPDATE ECOSYSTEM PROGRESS (enhanced with challenge integration)
          try {
            const ecosystemResponse = await fetch(
              "/api/user/update-ecosystem-progress",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ unitId: unitId }),
              }
            );

            if (ecosystemResponse.ok) {
              const ecosystemResult = await ecosystemResponse.json();
              console.log("✅ Ecosystem progress updated:", ecosystemResult);

              // Store challenge results for display
              if (
                ecosystemResult.challengeProgress &&
                ecosystemResult.challengeProgress.length > 0
              ) {
                setChallengeResults(ecosystemResult.challengeProgress);
              }

              // Check for species unlocks
              if (
                ecosystemResult.speciesUnlocked &&
                ecosystemResult.speciesUnlocked.length > 0
              ) {
                setSpeciesUnlocked(ecosystemResult.speciesUnlocked);
              }
            } else {
              console.warn(
                "❌ Failed to update ecosystem progress:",
                ecosystemResponse.status
              );
            }
          } catch (ecosystemError) {
            console.warn(
              "🔥 Error updating ecosystem progress:",
              ecosystemError
            );
          }
        }
      }

      // Update user progress (XP and level tracking)
      const { data: existingProgress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .single();

      const currentPoints = existingProgress?.total_points || 0;
      const currentLevel = existingProgress?.current_level || 1;
      const currentCompleted = existingProgress?.completed_exercises || 0;

      const newPoints = currentPoints + earnedXP;
      const newLevel = Math.floor(newPoints / 500) + 1;

      const newCompletedCount = justCompleted
        ? currentCompleted + 1
        : currentCompleted;

      const progressData = {
        user_id: userId,
        total_points: newPoints,
        current_level: newLevel,
        last_active: new Date().toISOString(),
        completed_exercises: newCompletedCount,
      };

      const { error: progressError } = await supabase
        .from("user_progress")
        .upsert(progressData, { onConflict: "user_id" });

      if (progressError) {
        console.error("Error updating user progress:", progressError);
      }

      return justCompleted;
    } catch (error) {
      console.error("Error in updateUserProgressInDB:", error);
      throw error;
    }
  };

  const showXPToast = (
    earnedXP,
    justCompleted,
    challengeContributions = [],
    speciesUnlocked = []
  ) => {
    const xpToast = document.createElement("div");

    let message = `+${earnedXP} XP earned!`;

    if (justCompleted) {
      message += ` Unit completed! 🎉`;
    }

    if (challengeContributions.length > 0) {
      message += ` 🚨 Contributing to ${challengeContributions.length} environmental challenge(s)!`;
    }

    if (speciesUnlocked.length > 0) {
      message += ` 🐾 ${speciesUnlocked.length} new species adopted!`;
    }

    xpToast.innerHTML = `
      <div class="text-center">
        <div class="font-bold">${message}</div>
        ${
          challengeContributions.length > 0
            ? `
          <div class="mt-2 text-sm">
            ${challengeContributions
              .map(
                (challenge) =>
                  `🌍 ${challenge.challengeName}: ${Math.round(
                    (challenge.newContribution / challenge.totalRequired) * 100
                  )}%`
              )
              .join("<br>")}
          </div>
        `
            : ""
        }
        ${
          speciesUnlocked.length > 0
            ? `
          <div class="mt-2 text-sm">
            ${speciesUnlocked
              .map((species) => `${species.emoji} ${species.name} adopted!`)
              .join(" ")}
          </div>
        `
            : ""
        }
      </div>
    `;

    xpToast.className =
      "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-bold z-50 transition-all duration-300 max-w-md";
    document.body.appendChild(xpToast);

    setTimeout(() => {
      xpToast.style.opacity = "0";
      setTimeout(() => {
        if (document.body.contains(xpToast)) {
          document.body.removeChild(xpToast);
        }
      }, 300);
    }, 6000); // Show longer for more complex messages
  };

  // FEATURE 2: Modified to track audio play count
  function handleAudioToggle() {
    if (!unitData?.audio) {
      console.warn("No audio URL available");
      return;
    }

    // FEATURE 2: Check if user has exceeded play limit (only when not submitted)
    if (!isSubmitted && audioPlayCount >= maxAudioPlays && !isPlaying) {
      alert(
        `You've reached the maximum of ${maxAudioPlays} plays. Submit your answers to play again.`
      );
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(unitData.audio);

      // FEATURE 2: Increment play count when audio finishes (not when it starts)
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);

        // Only count as a "play" if user listened all the way to the end
        if (!isSubmitted) {
          setAudioPlayCount((prev) => prev + 1);
        }
      });
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          // REMOVED: Don't increment here - only count when audio ends
        })
        .catch((err) => {
          console.error("Audio playback failed:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsPlaying(false);
      }
    };
  }, [unitId]);

  return (
    <main className="flex flex-col mx-10 lg:mx-20 my-6">
      <div className="flex flex-col">
        <div className="flex flex-col lg:grid lg:grid-cols-2">
          <div className="col-span-1 flex items-start justify-center align-middle md:px-2 lg:align-top lg:justify-items-start lg:px-4 py-4 xl:px-8">
            {unitData?.image && (
              <Image
                src={unitData.image}
                width={600}
                height={400}
                quality={80}
                className="w-full h-48 min-[440px]:h-72 sm:h-96 object-cover object-[50%_20%] lg:justify-start border-2 rounded-xl
                 border-primary-600 hover:ring-1 hover:ring-primary-950 dark:hover:ring-primary-600"
                alt={unitData.title || "Unit Image"}
              />
            )}
          </div>

          <div className="col-span-1 flex flex-col gap-3 ml-3 my-1">
            <h1 className="font-orbitron font-bold text-center lg:text-left text-2xl sm:text3xl md:text-4xl lg:text-4xl text-gray-800 dark:text-white mx-3">
              {unitData?.title || "Loading Title..."}
            </h1>
            {/* <h2 className="font-orbitron font-bold text-center lg:text-left text-lg lg:text-xl text-gray-700 dark:text-white mx-3">
              {unitData?.description || "Loading Description..."}
            </h2> */}
            <h2 className="font-orbitron font-semibold text-center lg:text-left text-[16px] lg:text-lg text-gray-700 dark:text-white mx-3">
              {copy.region}: {unitData?.region_name || "Loading region name..."}
            </h2>

            {isAlreadyCompleted && (
              <div className="mx-3 px-2 py-2 w-fit  bg-green-100 dark:bg-primary-800 rounded-xl">
                <p className="text-green-800 dark:text-green-100 text-sm text-center">
                  ✅ Completed!
                </p>
              </div>
            )}

            <div className="flex gap-6 lg:gap-12 justify-around lg:justify-start align-middle">
              {unitData?.audio && (
                <div
                  className="relative"
                  onMouseEnter={() => setShowAudioTooltip(true)}
                  onMouseLeave={() => setShowAudioTooltip(false)}
                >
                  {/* FEATURE 3: Audio hover tooltip */}
                  {showAudioTooltip && !isSubmitted && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-50">
                      <div className="text-center">
                        <p className="font-semibold mb-1">
                          🎧 Listen and complete.
                        </p>
                        <p>
                          You have <strong>{maxAudioPlays}</strong> attempts.
                        </p>

                        <p className="text-gray-300 mt-1">
                          You can pause anytime.
                        </p>

                        {/* <p className="text-gray-300 mt-1">
                          Full plays remaining:{" "}
                          <strong>{maxAudioPlays - audioPlayCount}</strong>
                        </p> */}
                      </div>
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-8 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleAudioToggle}
                    disabled={isLoading}
                    className={`flex items-center gap-2 text-[18px] rounded-lg px-2 transition-colors ${
                      isPlaying
                        ? "text-red-600 hover:text-red-700"
                        : "hover:text-accent-600"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isPlaying ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-9"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10 9v6m4-6v6m-6 9h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 002 2z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-9"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 3.75v16.5l13.5-8.25L5 3.75z"
                        />
                      </svg>
                    )}
                    {isPlaying ? "Pause" : "Listen"}
                    {/* FEATURE 2: Show play count indicator */}
                    {!isSubmitted && audioPlayCount > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({audioPlayCount}/{maxAudioPlays})
                      </span>
                    )}
                  </button>
                </div>
              )}

              <p className="text-gray-800 dark:text-gray-200 text-sm pt-2">
                Full plays remaining:{" "}
                <strong>{maxAudioPlays - audioPlayCount}</strong>
              </p>

              {/* FEATURE 1: Conditionally render button based on user_type */}
              {/* Hide "Show Full Text" button for school users, show for all others */}
              {userType !== "school" && (
                <button
                  className="w-fit text-[16px] rounded-lg px-2 hover:text-accent-600 hover:border-b-1 hover:border-accent-600"
                  onClick={() => setShowFullText(!showFullText)}
                >
                  {showFullText
                    ? copy.showGapFillButton
                    : copy.showFullTextButton}
                </button>
              )}
            </div>

            {/* Hover instruction notification */}
            {showHoverInstruction && (
              <div className="mx-3 p-3 bg-primary-100 dark:bg-primary-800 rounded-lg transition-all duration-300">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-primary-600 dark:text-primary-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-primary-800 dark:text-primary-100 text-sm">
                    💡 {copy.hoverInstruction}
                  </p>
                </div>
              </div>
            )}

            {showFullText ? (
              <div className="col-span-6 lg:col-span-4 font-orbitron font-normal text-md text-primary-900 bg-accent-50 dark:text-accent-50 dark:bg-primary-800 p-4 border-solid rounded-lg border-accent-50">
                <TextWithGlossary
                  text={fullText}
                  glossaryTerms={glossaryTerms}
                  onSaveWord={handleSaveGlossaryWord}
                  savedWords={savedGlossaryWords}
                  selectedLanguage={selectedLanguage}
                />
              </div>
            ) : (
              <div className="col-span-6 lg:col-span-4 font-orbitron font-normal text-md text-primary-900 bg-accent-50 dark:text-accent-50 dark:bg-primary-800 p-4 border-solid rounded-lg border-accent-50 relative">
                {questions.length > 0 ? (
                  gapText.split(/\{\{(\d+)\}\}/g).map((part, index) => {
                    if (index % 2 === 0)
                      return (
                        <TextWithGlossary
                          key={`text-${textId}-${index}`}
                          text={part}
                          glossaryTerms={glossaryTerms}
                          onSaveWord={handleSaveGlossaryWord}
                          savedWords={savedGlossaryWords}
                          selectedLanguage={selectedLanguage}
                        />
                      );

                    const question = questions.find(
                      (q) =>
                        q.gap_number === Number(part) && q.text_id === textId
                    );

                    if (!question) {
                      console.warn(
                        `Question ID ${part} for text ${textId} not found in questions array.`
                      );
                      return (
                        <span key={`error-${textId}-gap-${index}`}>
                          [error]
                        </span>
                      );
                    }

                    return renderGapWithHoverFeedback(question, index);
                  })
                ) : (
                  <p className="text-accent-50 text-lg font-josefin">
                    Loading...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {userType !== "school" && (
          <div className="m-4 flex justify-center">
            <label
              htmlFor="languageSelect"
              className="mr-2 text-primary-900 dark:text-white"
            >
              {copy.translationButton}:
            </label>
            <select
              id="languageSelect"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="text-[16px] rounded-b-lg px-2 text-accent-600 hover:border-b-1 hover:border-accent-600"
            >
              <option value="no">None</option>
              {Object.keys(translations).map((langCode) => (
                <option key={langCode} value={langCode}>
                  {languageLabels[langCode] || langCode}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedLanguage !== "no" && translations[selectedLanguage] && (
          <p className="col-span-6 lg:col-span-4 font-orbitron font-normal text-md text-primary-900 bg-accent-50 dark:text-accent-50 dark:bg-primary-800 p-4 border-solid rounded-lg border-accent-50">
            <TextExpander>{translations[selectedLanguage]}</TextExpander>
          </p>
        )}

        <div className="mx-3 p-3 col-span-2 flex flex-row flex-wrap gap-4 align-middle justify-center font-orbitron">
          {!showFullText && !isSubmitted && (
            <button
              className={`text-[16px] rounded-b-lg border-b-1 border-primary-600 px-2 hover:text-accent-600 hover:border-b-1 hover:border-accent-600 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : copy.submitAnswersButton}
            </button>
          )}

          {!showFullText && isSubmitted && (
            <button
              className="text-[16px] rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 transition-colors duration-200 font-medium"
              onClick={() => window.location.reload()}
            >
              {copy.tryAgainButton}
            </button>
          )}
        </div>

        {isSubmitted && (
          <div className="flex flex-col items-center">
            <h3 className="font-orbitron text-center lg:text-left text-2xl lg:text-xl text-primary-800 dark:text-accent-50 mx-3">
              You got {score} out of {questions.length} correct!
            </h3>
            <p className="mt-2 font-orbitron text-center lg:text-left text-lg lg:text-xl text-teal-800 dark:text-teal-300 mx-3">
              {message}
            </p>

            {/* Challenge contributions display */}
            {challengeResults.length > 0 && (
              <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-800 rounded-lg max-w-md">
                <h4 className="font-bold text-blue-800 dark:text-blue-100 text-center mb-2">
                  🚨 Environmental Impact!
                </h4>
                {challengeResults.map((challenge, index) => (
                  <div
                    key={index}
                    className="text-sm text-blue-700 dark:text-blue-200 text-center"
                  >
                    <p>
                      {challenge.challengeName}:{" "}
                      {Math.round(
                        (challenge.newContribution / challenge.totalRequired) *
                          100
                      )}
                      % complete
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Species unlocked display */}
            {speciesUnlocked.length > 0 && (
              <div className="mt-4 p-4 bg-green-100 dark:bg-green-800 rounded-lg max-w-md">
                <h4 className="font-bold text-green-800 dark:text-green-100 text-center mb-2">
                  🐾 Species Adopted!
                </h4>
                <div className="flex justify-center gap-4">
                  {speciesUnlocked.map((species, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl">{species.emoji}</div>
                      <div className="text-xs text-green-700 dark:text-green-200">
                        {species.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {percentage >= 60 && (
              <div className="mt-4 p-4 bg-green-100 dark:bg-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-100 font-bold text-center">
                  {isAlreadyCompleted
                    ? "🎉 Great job! You've mastered this unit!"
                    : "🎉 Unit Completed! Check your eco-map to see your progress!"}
                </p>
                <div className="flex gap-2 justify-center mt-2">
                  <button
                    onClick={() => router.push("/eco-map")}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    View Eco-Map
                  </button>
                  {challengeResults.length > 0 && (
                    <button
                      onClick={() => router.push("/eco-map?tab=progress")}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      View Challenges
                    </button>
                  )}
                </div>
              </div>
            )}
            <PieChartAnswers
              totalCorrect={score}
              totalQuestions={questions.length}
            />
          </div>
        )}
      </div>
    </main>
  );
}
