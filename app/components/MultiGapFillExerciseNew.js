"use client";

import { useState, useEffect } from "react";
import { fetchData, fetchUnitDetails } from "@/lib/data-service";
import Image from "next/image";
import TextExpander from "./TextExpander";
import PieChartAnswers from "./PieChartAnswers";
import { useLanguage } from "@/lib/contexts/LanguageContext";
// import { useMockProgress } from "../hooks/useMockProgress";

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
  const [portugueseTranslation, setPortugueseTranslation] = useState("");
  const [spanishTranslation, setSpanishTranslation] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("no"); // Default: English
  // const [progress, updateProgress] = useMockProgress();

  const { lang } = useLanguage();

  const t = {
    en: {
      showFullTextButton: "Show Full Text",
      showGapFillButton: "Show Gap Fill",
      translationButton: "Translation",
      submitAnswersButton: "Submit Answers",
    },
    pt: {
      showFullTextButton: "Ver Texto Completo",
      showGapFillButton: "Ver Exercício",
      translationButton: "Tradução",
      submitAnswersButton: "Enviar Respostas",
    },
  };

  const copy = t[lang];

  const percentage = (score / questions.length) * 100;
  let message;

  const xpPerCorrectAswer = 10;

  if (percentage === 100) {
    message = `Perfect score! Fantastic work! You have added ${
      score * xpPerCorrectAswer + 20
    } points to your progress!`;
  } else if (percentage >= 80) {
    message = `Great job! You have added You have added ${
      score * xpPerCorrectAswer
    } points to your progress!`;
  } else if (percentage >= 60) {
    message = `Good effort! You have added You have added ${
      score * xpPerCorrectAswer
    } points to your progress!`;
  } else if (percentage >= 40) {
    message = `Not bad! You have added You have added ${
      score * xpPerCorrectAswer
    } points to your progress!`;
  } else {
    message = `Keep going! Practice makes perfect! You have added ${
      score * xpPerCorrectAswer
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
          questions,
        } = await fetchData(unitId);

        setUnitData(unitDetails);
        setTextId(textId);
        setFullText(fullText);
        setGapText(gapText);
        setPortugueseTranslation(portugueseTranslation);
        setSpanishTranslation(spanishTranslation);
        setQuestions(questions);
      } catch (err) {
        console.error("Error loading unit data:", err);
      }
    }

    if (unitId) loadData();
  }, [unitId]);

  const handleChange = (questionId, selectedAnswer) => {
    setUserAnswers({ ...userAnswers, [questionId]: selectedAnswer });
  };

  const handleSubmit = async () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (userAnswers[`${unitId}-${q.gap_number}`] === q.correct_answer)
        correctCount++;
    });
    setScore(correctCount);
    setIsSubmitted(true);

    // === XP Calculation and LocalStorage Progress Update ===
    const xpPerCorrect = 10;
    const bonusForPerfect = 20;

    const totalQuestions = questions.length;
    let earnedXP = correctCount * xpPerCorrect;

    if (correctCount === totalQuestions) {
      earnedXP += bonusForPerfect;
    }

    // Load previous progress or set defaults
    const stored = localStorage.getItem("mockProgress");
    let progress = stored
      ? JSON.parse(stored)
      : { xp: 0, level: 1, streak: 1, achievements: [] };

    // XP leveling logic
    const XP_PER_LEVEL = 500;
    const MAX_LEVEL = 8;

    let newXP = progress.xp + earnedXP;
    let newLevel = progress.level;
    let newAchievements = [];

    while (newXP >= XP_PER_LEVEL && newLevel < MAX_LEVEL) {
      newXP -= XP_PER_LEVEL;
      newLevel++;
      newAchievements.push({
        title: `Level ${newLevel}!`,
        description: `You reached level ${newLevel}`,
      });
    }

    if (correctCount === totalQuestions) {
      newAchievements.push({
        title: "Perfect Score!",
        description: "You answered all questions correctly!",
      });
    }

    // Save updated progress to localStorage
    const updatedProgress = {
      xp: newXP,
      level: newLevel,
      streak: progress.streak,
      achievements: [...(progress.achievements || []), ...newAchievements],
    };

    localStorage.setItem("mockProgress", JSON.stringify(updatedProgress));

    alert(`🎯 You earned ${earnedXP} XP!`);

    const xpToast = document.createElement("div");
    xpToast.textContent = `+${pointsEarned} XP! You’re now level ${newLevel}!`;
    xpToast.className =
      "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-accent-400 text-primary-900 px-4 py-2 rounded shadow-lg font-josefin z-50";
    document.body.appendChild(xpToast);

    setTimeout(() => {
      xpToast.remove();
    }, 3000); // Remove after 3 seconds

    // === Optional: Send to backend for syncing ===
    try {
      const response = await fetch("/api/update-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: correctCount,
          total: totalQuestions,
          mockUserId: "demo-user-123",
        }),
      });

      const result = await response.json();
      console.log("Progress updated:", result);

      if (result.achievements?.length > 0) {
        alert(`🎉 Achievement unlocked: ${result.achievements.join(", ")}`);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  return (
    <main className="flex flex-col mx-10 lg:mx-20 my-6">
      <div className="flex flex-col">
        <div className="flex flex-col  lg:grid lg:grid-cols-2">
          <div className="col-span-1 flex items-center justify-center align-middle  md:px-2 lg:align-top lg:justify-items-start lg:px-4 xl:px-8">
            {/* Render Image Dynamically */}
            {unitData?.image && (
              <Image
                src={unitData.image}
                // src={heroImage}
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
            {/* Render Title & Description Dynamically */}
            <h1 className="font-orbitron font-bold text-center lg:text-left text-2xl sm:text3xl md:text-4xl lg:text-4xl text-gray-800 dark:text-white mx-3">
              {unitData?.title || "Loading Title..."}
            </h1>
            <h2 className="font-orbitron font-bold text-center lg:text-left text-lg lg:text-xl text-gray-700 dark:text-white mx-3">
              {unitData?.description || "Loading Description..."}
            </h2>

            {/* Toggle Button */}

            <button
              className="w-fit text-[16px] rounded-lg px-2 hover:text-accent-600 hover:border-b-1 hover:border-accent-600"
              onClick={() => setShowFullText(!showFullText)}
            >
              {showFullText ? copy.showGapFillButton : copy.showFullTextButton}
            </button>

            {/* Display Full Text or Gap-Fill Exercise */}
            {showFullText ? (
              <p className="col-span-6 lg:col-span-4 font-orbitron font-normal text-md text-primary-900 bg-accent-50 dark:text-accent-50 dark:bg-primary-800 p-4 border-solid rounded-lg border-accent-50">
                <TextExpander>{fullText}</TextExpander>
              </p>
            ) : (
              <div className="col-span-6 lg:col-span-4 font-orbitron font-normal text-md text-primary-900 bg-accent-50 dark:text-accent-50 dark:bg-primary-800  p-4 border-solid rounded-lg border-accent-50">
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
                      ); // Ensure unique key
                    }

                    return (
                      <select
                        key={`${unitId}-gap-${question.gap_number}`} // UNIQUE KEY
                        className={` font-josefin mx-2 border rounded px-2 py-0.5 transition-colors duration-200 ${
                          isSubmitted
                            ? userAnswers[
                                `${unitId}-${question.gap_number}`
                              ] === question.correct_answer
                              ? "bg-teal-800"
                              : "bg-rose-800"
                            : userAnswers[`${unitId}-${question.gap_number}`]
                            ? "bg-primary-500  text-accent-50 hover:bg-accent-200  hover:text-accent-900"
                            : "bg-accent-100  hover:bg-accent-200 text-accent-900"
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
            <option value="pt">Português</option>
            <option value="es">Español</option>
          </select>
        </div>

        {selectedLanguage !== "no" && (
          <p className="col-span-6 lg:col-span-4 font-orbitron font-normal text-md text-primary-900 bg-accent-50 dark:text-accent-50 dark:bg-primary-800 p-4 border-solid rounded-lg border-accent-50">
            <TextExpander>
              {selectedLanguage === "pt"
                ? portugueseTranslation
                : spanishTranslation}
            </TextExpander>
          </p>
        )}

        {/* Submit Button */}
        <div className="mx-3 p-3 col-span-2 flex flex-row flex-wrap gap-4 align-middle justify-center font-orbitron">
          {!showFullText && (
            <button
              className="text-[16px] rounded-b-lg border-b-1 border-primary-600 px-2 hover:text-accent-600 hover:border-b-1 hover:border-accent-600"
              onClick={handleSubmit}
              disabled={isSubmitted}
            >
              Submit Answers
            </button>
          )}
        </div>

        {/* Score Display */}
        {isSubmitted && (
          <div className="flex flex-col items-center">
            <h3 className="font-orbitron text-center lg:text-left text-2xl lg:text-xl text-accent-50 mx-3">
              You got {score} out of {questions.length} correct!
            </h3>
            <p className="mt-2 font-orbitron text-center lg:text-left text-lg lg:text-xl text-teal-300 mx-3">
              {message}
            </p>
            <PieChartAnswers
              totalCorrect={score}
              totalQuestions={questions.length}
            />
          </div>
        )}
      </div>
      {/* <ProgressDashboard /> */}
    </main>
  );
}
