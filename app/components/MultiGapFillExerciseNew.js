"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { fetchData, fetchUnitDetails } from "@/lib/data-service";
import supabase from "@/lib/supabase-browser";
import { useLanguage } from "@/lib/contexts/LanguageContext";

import TextExpander from "./TextExpander";
import PieChartAnswers from "./PieChartAnswers";

export default function MultiGapFillExerciseNew({ unitId }) {
  const [unitData, setUnitData] = useState(null);
  const [textId, setTextId] = useState(null);
  const [fullText, setFullText] = useState("");
  const [gapText, setGapText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [showFullText, setShowFullText] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  // const [portugueseTranslation, setPortugueseTranslation] = useState("");
  // const [spanishTranslation, setSpanishTranslation] = useState("");
  // const [frenchTranslation, setFrenchTranslation] = useState("");
  const [translations, setTranslations] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState("no");
  const [isLoading, setIsLoading] = useState(false);
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: session } = useSession();
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
      region: "Region",
      playAudio: "Listen",
    },
    pt: {
      showFullTextButton: "Ver Texto Completo",
      showGapFillButton: "Ver Exercício",
      translationButton: "Tradução",
      submitAnswersButton: "Enviar Respostas",
      region: "Região",
      playAudio: "Ouça",
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

        // Check if user has already completed this unit
        if (session?.user?.email) {
          await checkIfUnitCompleted();
        }
      } catch (err) {
        console.error("Error loading unit data:", err);
      }
    }

    if (unitId) loadData();
  }, [unitId, session?.user?.email]);

  const checkIfUnitCompleted = async () => {
    if (!session?.user?.email) return;

    try {
      // Get user ID from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", session.user.email)
        .single();

      if (userError || !userData) return;

      // Check if unit is already completed
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

  const handleSubmit = async () => {
    if (!session?.user?.email) {
      alert("Please log in to save your progress!");
      return;
    }

    setIsLoading(true);

    try {
      // Calculate score
      let correctCount = 0;
      questions.forEach((q) => {
        if (userAnswers[`${unitId}-${q.gap_number}`] === q.correct_answer)
          correctCount++;
      });

      setScore(correctCount);
      setIsSubmitted(true);

      const totalQuestions = questions.length;
      const percentage = (correctCount / totalQuestions) * 100;
      const passedThreshold = percentage >= 60;

      // Calculate XP
      let earnedXP = correctCount * xpPerCorrectAnswer;
      if (correctCount === totalQuestions) {
        earnedXP += bonusForPerfect;
      }

      // Update progress in database
      const justCompleted = await updateUserProgressInDB(
        session.user.email,
        unitId,
        correctCount,
        totalQuestions,
        earnedXP,
        passedThreshold
      );

      // Show success message
      showXPToast(earnedXP, justCompleted && passedThreshold);
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
      // First, get the user ID from the users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (userError || !userData) {
        throw new Error("User not found in database");
      }

      const userId = userData.id;

      // Check if unit was already completed
      const { data: existingCompletion } = await supabase
        .from("completed_units")
        .select("id")
        .eq("user_id", userId)
        .eq("unit_id", unitId)
        .single();

      const wasAlreadyCompleted = !!existingCompletion;
      let justCompleted = false;

      // If user passed and unit wasn't already completed, mark as completed
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

          // 🌱 UPDATE ECOSYSTEM PROGRESS (only for new completions)
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
              console.log("Ecosystem progress updated:", ecosystemResult);
            } else {
              console.warn(
                "Failed to update ecosystem progress:",
                ecosystemResponse.status
              );
            }
          } catch (ecosystemError) {
            console.warn("Error updating ecosystem progress:", ecosystemError);
            // Don't fail the whole completion if ecosystem update fails
          }
        }
      }

      // Update user progress (rest of your existing code...)
      const { data: existingProgress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .single();

      const currentPoints = existingProgress?.total_points || 0;
      const currentLevel = existingProgress?.current_level || 1;
      const currentCompleted = existingProgress?.completed_exercises || 0;

      // Calculate new level (every 500 points = 1 level)
      const newPoints = currentPoints + earnedXP;
      const newLevel = Math.floor(newPoints / 500) + 1;

      // Only increment completed_exercises if this is a new completion
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

  const showXPToast = (earnedXP, justCompleted) => {
    const xpToast = document.createElement("div");
    const message = justCompleted
      ? `+${earnedXP} XP earned! Unit completed! 🎉`
      : `+${earnedXP} XP earned!`;

    xpToast.textContent = message;
    xpToast.className =
      "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-bold z-50 transition-all duration-300";
    document.body.appendChild(xpToast);

    setTimeout(() => {
      xpToast.style.opacity = "0";
      setTimeout(() => {
        if (document.body.contains(xpToast)) {
          document.body.removeChild(xpToast);
        }
      }, 300);
    }, 4000); // Show a bit longer for completion message
  };

  function handleAudioToggle() {
    if (!unitData?.audio) {
      console.warn("No audio URL available");
      // alert("We will be adding audio for this unit shortly");
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(unitData.audio);

      // Reset playback state when audio ends
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
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
            <h2 className="font-orbitron font-bold text-center lg:text-left text-lg lg:text-xl text-gray-700 dark:text-white mx-3">
              {unitData?.description || "Loading Description..."}
            </h2>
            <h2 className="font-orbitron font-bold text-center lg:text-left text-[16px] lg:text-lg text-gray-700 dark:text-white mx-3">
              {copy.region}: {unitData?.region_name || "Loading region name..."}
            </h2>

            {isAlreadyCompleted && (
              <div className="mx-3 p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-100 text-sm text-center">
                  ✅ You have already completed this unit!
                </p>
              </div>
            )}

            <div className="flex gap-6 lg:gap-12 justify-around lg:justify-start">
              <button
                className="w-fit text-[16px] rounded-lg px-2 hover:text-accent-600 hover:border-b-1 hover:border-accent-600"
                onClick={() => setShowFullText(!showFullText)}
              >
                {showFullText
                  ? copy.showGapFillButton
                  : copy.showFullTextButton}
              </button>

              {unitData?.audio && (
                <button
                  onClick={handleAudioToggle}
                  disabled={isLoading}
                  className={`flex items-center gap-2 text-[16px] rounded-lg px-2 transition-colors ${
                    isPlaying
                      ? "text-red-600 hover:text-red-700"
                      : "hover:text-accent-600"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isPlaying ? (
                    // Pause icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-6"
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
                    // Play icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-6"
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
                  {isPlaying ? "Pause" : copy.playAudio}
                </button>
              )}
            </div>

            {showFullText ? (
              <p className="col-span-6 lg:col-span-4 font-orbitron font-normal text-md text-primary-900 bg-accent-50 dark:text-accent-50 dark:bg-primary-800 p-4 border-solid rounded-lg border-accent-50">
                <TextExpander>{fullText}</TextExpander>
              </p>
            ) : (
              <div className="col-span-6 lg:col-span-4 font-orbitron font-normal text-md text-primary-900 bg-accent-50 dark:text-accent-50 dark:bg-primary-800 p-4 border-solid rounded-lg border-accent-50">
                {questions.length > 0 ? (
                  gapText.split(/\{\{(\d+)\}\}/g).map((part, index) => {
                    if (index % 2 === 0)
                      return <span key={`${textId}-${index}`}>{part}</span>;

                    const question = questions.find(
                      (q) =>
                        q.gap_number === Number(part) && q.text_id === textId
                    );

                    if (!question) {
                      console.warn(
                        `Question ID ${part} for text ${textId} not found in questions array.`
                      );
                      return (
                        <span key={`${textId}-gap-${index}`}>[error]</span>
                      );
                    }

                    return (
                      <select
                        key={`${unitId}-gap-${question.gap_number}`}
                        className={`font-josefin mx-2 my-1 border rounded px-2 transition-colors duration-200 ${
                          isSubmitted
                            ? userAnswers[
                                `${unitId}-${question.gap_number}`
                              ] === question.correct_answer
                              ? "bg-teal-800"
                              : "bg-rose-800"
                            : userAnswers[`${unitId}-${question.gap_number}`]
                            ? "bg-primary-500 text-accent-50 hover:bg-accent-200 hover:text-accent-900"
                            : "bg-accent-100 hover:bg-accent-200 text-accent-900"
                        }`}
                        value={
                          userAnswers[`${unitId}-${question.gap_number}`] || ""
                        }
                        onChange={(e) =>
                          handleChange(
                            `${unitId}-${question.gap_number}`,
                            e.target.value
                          )
                        }
                        disabled={isSubmitted}
                      >
                        <option value="">Select</option>
                        {question.options.map((option, idx) => (
                          <option
                            key={`${unitId}-opt-${question.gap_number}-${idx}`}
                            value={option}
                          >
                            {option}
                          </option>
                        ))}
                      </select>
                    );
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
            className="text-[16px] rounded-b-lg px-2 hover:text-accent-600 hover:border-b-1 hover:border-accent-600"
          >
            <option value="no">None</option>
            {Object.keys(translations).map((langCode) => (
              <option key={langCode} value={langCode}>
                {languageLabels[langCode] || langCode}
              </option>
            ))}
          </select>
          {/* <select
            id="languageSelect"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="text-[16px] rounded-b-lg px-2 hover:text-accent-600 hover:border-b-1 hover:border-accent-600"
          >
            <option value="no">None</option>
            <option value="pt">Português</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select> */}
        </div>

        {selectedLanguage !== "no" && translations[selectedLanguage] && (
          <p className="col-span-6 lg:col-span-4 font-orbitron font-normal text-md text-primary-900 bg-accent-50 dark:text-accent-50 dark:bg-primary-800 p-4 border-solid rounded-lg border-accent-50">
            <TextExpander>{translations[selectedLanguage]}</TextExpander>
          </p>
        )}

        <div className="mx-3 p-3 col-span-2 flex flex-row flex-wrap gap-4 align-middle justify-center font-orbitron">
          {!showFullText && (
            <button
              className={`text-[16px] rounded-b-lg border-b-1 border-primary-600 px-2 hover:text-accent-600 hover:border-b-1 hover:border-accent-600 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleSubmit}
              disabled={isSubmitted || isLoading}
            >
              {isLoading ? "Submitting..." : copy.submitAnswersButton}
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
            {percentage >= 60 && (
              <div className="mt-4 p-4 bg-green-100 dark:bg-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-100 font-bold text-center">
                  {isAlreadyCompleted
                    ? "🎉 Great job! You've mastered this unit!"
                    : "🎉 Unit Completed! Check your eco-map to see your progress!"}
                </p>
                <button
                  onClick={() => router.push("/eco-map")}
                  className="mt-2 mx-auto block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  View Eco-Map
                </button>
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
