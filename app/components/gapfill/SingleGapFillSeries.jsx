"use client";

import { useState } from "react";
import { Toaster, toast } from "sonner"; // For nice XP/Feedback toasts
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const SingleGapFillSeries = ({ exercises }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [recentXp, setRecentXp] = useState(0); // to show a floating +10 XP

  const currentExercise = exercises[currentIndex];

  if (!currentExercise) {
    return (
      <>
        <div className="text-center text-gray-800 dark:text-white text-2xl mt-4">
          Well done! You completed all challenges!
          <br />
          Your score: {score * 10} XP
        </div>
        <div className="w-64 h-64 m-8">
          <CircularProgressbar
            className="text-accent-900 dark:text-accent-50"
            value={score}
            maxValue={exercises.length}
            text={`${score}/${exercises.length}`}
            styles={buildStyles({
              pathColor: `#22c55e`, // green
              textColor: "#B78343",
              trailColor: "#d6d6d6",
              backgroundColor: "#f0f0f0",
            })}
          />
        </div>
      </>
    );
  }

  const handleCheckAnswer = () => {
    if (selectedOption === currentExercise.correctAnswer) {
      setIsCorrect(true);
      setScore((prev) => prev + 1); // +10 XP
      toast.success("Correct! +10 XP 🎉");
      setXp((prev) => prev + 10);
      setRecentXp(10); // or however many XP you want
      setTimeout(() => setRecentXp(0), 1500);
    } else {
      setIsCorrect(false);
      toast.error("Oops! Try the next one!");
    }
    setIsAnswered(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setSelectedOption("");
    setIsAnswered(false);
    setIsCorrect(null);
  };

  // Function to inject dropdown inside the gap {}
  const renderTextWithDropdown = (text) => {
    const parts = text.split("{}");
    return (
      <>
        {parts[0]}
        <select
          className="bg-accent-100 hover:bg-accent-200 dark:bg-[#3c546c] dark:hover:bg-primary-800 border rounded px-2 py-0.5 mx-2 text-accent-900 dark:text-primary-50 transition-colors duration-200"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          disabled={isAnswered}
        >
          <option className="text-primary-900" value="">
            Select...
          </option>
          {currentExercise.options.map((option) => (
            <option className="text-primary-900" key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {parts[1]}
      </>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center mt-4 px-4">
      {/* <ProgressBar progress={(currentIndex / exercises.length) * 100} /> */}
      <div className="fixed top-4 right-4 bg-white shadow-md rounded-lg px-4 py-1 flex items-center gap-2">
        <span className="font-bold text-green-900 text-lg">{xp} XP</span>
      </div>

      <h1 className="text-2xl text-gray-700 dark:text-primary-50 font-bold mb-4">
        {currentExercise.title}
      </h1>
      {currentExercise.imageUrl && (
        <motion.img
          key={currentExercise.imageUrl} // re-animate when image changes
          src={currentExercise.imageUrl}
          alt="Challenge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md h-64 rounded-xl shadow-lg mb-6"
        />
      )}

      <div className="bg-accent-50 dark:bg-primary-800 text-primary-900 dark:text-accent-50 rounded-2xl p-8 my-8 shadow-xl  max-w-2xl w-full text-xl">
        {renderTextWithDropdown(currentExercise.text)}
      </div>

      {!isAnswered ? (
        <button
          className="bg-primary-700 rounded-md hover:bg-primary-900 px-3 py-0.5 mb-8 text-accent-50"
          onClick={handleCheckAnswer}
          disabled={!selectedOption}
        >
          Check Answer
        </button>
      ) : (
        <button
          className="bg-primary-700 rounded-md hover:bg-primary-900 px-3 py-0.5 mb-8 text-accent-50"
          onClick={handleNext}
        >
          Next
        </button>
      )}
      {recentXp > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -40 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: 1 }}
          className="absolute text-green-500 font-bold text-xl"
        >
          +{recentXp} XP
        </motion.div>
      )}

      {/* <Toaster richColors position="bottom-center" /> */}
      <div className="w-64 h-64">
        <CircularProgressbar
          value={score}
          maxValue={exercises.length}
          text={`${score}/${exercises.length}`}
          styles={buildStyles({
            pathColor: `#22c55e`, // green
            textColor: "#B78343",
            trailColor: "#d6d6d6",
            backgroundColor: "#f0f0f0",
          })}
        />
      </div>
    </div>
  );
};

export default SingleGapFillSeries;

// const ParagraphCard = styled.div`
//   background-color: theme(--colors-primary-900);
//   border-radius: 1rem;
//   padding: 2rem;
//   margin: 2rem 0;
//   box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
// `;

// const StyledSelect = styled.select`
//   background: #3c546c;
//   /* color: var(--colors-primary-900); */
//   border: 2px solid var(--colors-primary-400);
//   padding: 0.2rem 0.5rem;
//   border-radius: 0.5rem;
//   margin: 0 0.5rem;
// `;
