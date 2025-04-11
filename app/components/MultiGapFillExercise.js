"use client";

import { useState, useEffect } from "react";
import { fetchData, fetchUnitDetails } from "@/app/lib/data-service";
import Image from "next/image";
import TextExpander from "./TextExpander";
import PieChartAnswers from "./PieChartAnswers";
import heroImage from "@/public/heroes/farwiza-farhan-with-elephant.jpeg";

// import ProgressDashboard from "./ProgressDashboard";

export default function MultiGapFillExercise({ unitId }) {
  const [unitData, setUnitData] = useState(null);
  const [textId, setTextId] = useState(null);
  const [fullText, setFullText] = useState("");
  const [gapText, setGapText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [showFullText, setShowFullText] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [portugueseTranslation, setPortugueseTranslation] = useState("");
  const [spanishTranslation, setSpanishTranslation] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // Default: English

  const percentage = (score / questions.length) * 100;
  let message;

  if (percentage === 100) {
    message = "Perfect score! Fantastic work!";
  } else if (percentage >= 80) {
    message = "Great job! You're really getting the hang of this!";
  } else if (percentage >= 60) {
    message = "Good effort! Keep practicing and you'll improve even more!";
  } else if (percentage >= 40) {
    message = "Not bad! Try reviewing the material and giving it another shot!";
  } else {
    message = "Keep going! Practice makes perfect!";
  }

  useEffect(() => {
    async function loadData() {
      const unitDetails = await fetchUnitDetails(unitId);
      const {
        textId,
        fullText,
        gapText,
        portugueseTranslation,
        spanishTranslation,
        questions,
      } = await fetchData(unitId);

      setUnitData(unitDetails); // Store unit details
      setTextId(textId); // Store text ID
      setFullText(fullText);
      setGapText(gapText);
      setPortugueseTranslation(portugueseTranslation);
      setSpanishTranslation(spanishTranslation);
      setQuestions(questions);

      console.log("Fetched gapText:", gapText);
      console.log("Fetched questions:", questions);
    }

    loadData();
  }, [unitId]);

  const handleChange = (questionId, selectedAnswer) => {
    setUserAnswers({ ...userAnswers, [questionId]: selectedAnswer });
  };

  const handleSubmit = async () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (userAnswers[`${textId}-${q.gap_number}`] === q.correct_answer)
        correctCount++;
    });
    setScore(correctCount);
    setIsSubmitted(true);

    try {
      const response = await fetch("/api/update-streak", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await response.json();
      if (result.newBadge) {
        alert(`Congratulations! You've earnt the $(result.newBadge) badge 🎉`);
      }
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  };

  return (
    <main className="flex flex-col mx-20 my-12">
      <div className="flex flex-col">
        {/* Render Image Dynamically */}
        {unitData?.image && (
          <Image
            src={unitData.image}
            // src={heroImage}
            width={600}
            height={400}
            quality={80}
            className="col-span-4 w-full h-48 sm:h-96 object-cover border-2 rounded-lg
                 border-accent-100 hover:ring-1 hover:ring-primary-950"
            alt={unitData.title || "Unit Image"}
          />
        )}

        <div className="col-span-2 flex flex-col gap-3 ml-3 my-1">
          {/* Render Title & Description Dynamically */}
          <h1 className="font-orbitron font-bold text-center lg:text-left text-2xl sm:text3xl md:text-4xl lg:text-4xl text-accent-300 mx-3">
            {unitData?.title || "Loading Title..."}
          </h1>
          <h2 className="font-orbitron font-bold text-center lg:text-left text-lg lg:text-xl text-accent-100 mx-3">
            {unitData?.description || "Loading Description..."}
          </h2>
        </div>

        {/* Toggle Button */}
        <div className="col-span-2 grid grid-cols-2">
          <div className="mx-3 p-3 col-span-2 flex flex-row flex-wrap gap-4 align-middle justify-center font-orbitron">
            <button
              className="bg-accent-400  hover:bg-accent-500 text-primary-900 font-josefin rounded px-2 py-1"
              onClick={() => setShowFullText(!showFullText)}
            >
              {showFullText ? "Show Gap Fill" : "Show Full Text"}
            </button>
          </div>
        </div>

        {/* Display Full Text or Gap-Fill Exercise */}
        {showFullText ? (
          <p className="col-span-6 lg:col-span-4 font-orbitron font-light text-md text-accent-50 bg-primary-900 p-4 border-solid rounded-lg border-accent-50">
            <TextExpander>{fullText}</TextExpander>
          </p>
        ) : (
          <div className="col-span-6 lg:col-span-4 font-orbitron font-light text-md text-accent-50 bg-primary-900 p-4 border-solid rounded-lg border-accent-50">
            {questions.length > 0 ? (
              gapText.split(/\{\{(\d+)\}\}/g).map((part, index) => {
                if (index % 2 === 0)
                  return <span key={`${textId}-${index}`}>{part}</span>;

                const question = questions.find(
                  (q) => q.gap_number === Number(part) && q.text_id === textId
                );

                if (!question) {
                  console.warn(
                    `Question ID ${part} for text ${textId} not found in questions array.`
                  );
                  return <span key={`${textId}-gap-${index}`}>[error]</span>; // Ensure unique key
                }

                return (
                  <select
                    key={`${unitId}-gap-${question.gap_number}`} // UNIQUE KEY
                    className={` font-josefin mx-2 border rounded px-2 py-[2px] transition-colors duration-200 ${
                      isSubmitted
                        ? userAnswers[`${unitId}-${question.gap_number}`] ===
                          question.correct_answer
                          ? "bg-teal-800"
                          : "bg-rose-800"
                        : userAnswers[`${unitId}-${question.gap_number}`]
                        ? "bg-primary-800  text-accent-50 hover:bg-accent-200  hover:text-accent-900"
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
              <p className="text-accent-50 text-lg font-josefin">Loading...</p>
            )}
          </div>
        )}

        <div className="m-4 flex justify-center">
          <label htmlFor="languageSelect" className="mr-2 text-white">
            Translation:
          </label>
          <select
            id="languageSelect"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="text-primary-900 bg-accent-100 font-josefin border rounded px-2 py-1"
          >
            <option value="no">None</option>
            <option value="pt">Português</option>
            <option value="es">Español</option>
          </select>
        </div>

        {selectedLanguage !== "no" && (
          <p className="col-span-6 lg:col-span-4 font-orbitron font-light text-md text-accent-900 bg-accent-50 p-4 border-solid rounded-lg border-accent-50 mt-2">
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
              className="bg-accent-400 hover:bg-accent-500 text-accent-900 rounded-md px-3 py-1"
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
