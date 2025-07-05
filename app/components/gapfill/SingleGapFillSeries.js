"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import supabase from "@/lib/supabase-browser";

const SingleGapFillSeries = ({ exercises }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [recentXp, setRecentXp] = useState(0); // to show a floating +10 XP
  const [isLoading, setIsLoading] = useState(false);
  const [hasUpdatedProgress, setHasUpdatedProgress] = useState(false);

  const { data: session } = useSession();
  const currentExercise = exercises[currentIndex];

  // XP calculation constants
  const xpPerCorrectAnswer = 10;
  const bonusForPerfect = 20;

  // Move function definitions BEFORE they're used
  const updateUserProgressInDB = async (email, earnedXP) => {
    try {
      // Get the user ID from the users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (userError || !userData) {
        throw new Error("User not found in database");
      }

      const userId = userData.id;

      // Get current user progress
      const { data: existingProgress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .single();

      const currentPoints = existingProgress?.total_points || 0;
      const currentLevel = existingProgress?.current_level || 1;
      const currentCompleted = existingProgress?.completed_exercises || 0;

      // Calculate new values
      const newPoints = currentPoints + earnedXP;
      const newLevel = Math.floor(newPoints / 500) + 1; // Every 500 points = 1 level
      const newCompletedCount = currentCompleted + 1; // Increment completed exercises

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
        throw progressError;
      }

      console.log("User progress updated successfully:", {
        earnedXP,
        newPoints,
        newLevel,
        newCompletedCount,
      });
    } catch (error) {
      console.error("Error in updateUserProgressInDB:", error);
      throw error;
    }
  };

  const showCompletionToast = (earnedXP, isPerfectScore) => {
    const message = isPerfectScore
      ? `🎉 Perfect Score! +${earnedXP} XP earned! (includes ${bonusForPerfect} bonus!)`
      : `✨ Challenge Complete! +${earnedXP} XP earned!`;

    const completionToast = document.createElement("div");
    completionToast.textContent = message;
    completionToast.className =
      "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-4 rounded-lg shadow-lg font-bold z-50 transition-all duration-300 max-w-sm text-center";
    document.body.appendChild(completionToast);

    setTimeout(() => {
      completionToast.style.opacity = "0";
      setTimeout(() => {
        if (document.body.contains(completionToast)) {
          document.body.removeChild(completionToast);
        }
      }, 300);
    }, 5000); // Show longer for completion message
  };

  const updateFinalProgress = async () => {
    if (!session?.user?.email || hasUpdatedProgress) return;

    try {
      setIsLoading(true);
      setHasUpdatedProgress(true);

      const totalQuestions = exercises.length;
      const percentage = (score / totalQuestions) * 100;

      // Calculate total XP earned
      let earnedXP = score * xpPerCorrectAnswer;
      if (score === totalQuestions) {
        earnedXP += bonusForPerfect;
      }

      // Only update if user earned some XP
      if (earnedXP > 0) {
        await updateUserProgressInDB(session.user.email, earnedXP);
        showCompletionToast(earnedXP, score === totalQuestions);
      }
    } catch (error) {
      console.error("Error updating final progress:", error);
      setHasUpdatedProgress(false); // Reset so it can be tried again
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentExercise) {
    // Challenge completed - update progress if not already done
    if (session?.user?.email && !hasUpdatedProgress) {
      updateFinalProgress();
    }

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
      setScore((prev) => prev + 1);
      toast.success("Correct! +10 XP 🎉");
      setXp((prev) => prev + 10);
      setRecentXp(10);
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

  // Show login prompt if user is not logged in
  const handleCheckAnswerWithAuth = () => {
    if (!session?.user?.email) {
      toast.error("Please log in to track your progress and earn XP! 🔐");
      return;
    }
    handleCheckAnswer();
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
          <option className="text-primary-900 dark:text-primary-50" value="">
            Select...
          </option>
          {currentExercise.options.map((option) => (
            <option
              className="text-primary-900 dark:text-primary-50"
              key={option}
              value={option}
            >
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
      {/* XP Display */}
      <div className="fixed top-4 right-4 bg-white shadow-md rounded-lg px-4 py-1 flex items-center gap-2">
        <span className="font-bold text-green-900 text-lg">{xp} XP</span>
        {!session?.user?.email && (
          <span className="text-xs text-gray-500">(Login to save)</span>
        )}
      </div>

      <h1 className="text-2xl text-gray-700 dark:text-primary-50 font-bold mb-4">
        {currentExercise.challengeTitle}
      </h1>
      <h2 className="text-xl text-gray-600 dark:text-primary-50 font-normal mb-4">
        {currentExercise.title}
      </h2>
      {currentExercise.imageUrl && (
        <motion.img
          key={currentExercise.imageUrl} // re-animate when image changes
          src={currentExercise.imageUrl}
          alt="Challenge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md h-72 object-cover object-[50%_20%] rounded-xl shadow-lg mb-2"
        />
      )}

      <div className="bg-accent-50 dark:bg-primary-800 text-primary-900 dark:text-accent-50 rounded-2xl p-8 my-8 shadow-xl  max-w-2xl w-full text-xl">
        {renderTextWithDropdown(currentExercise.text)}
      </div>

      {!isAnswered ? (
        <button
          className={`bg-primary-700 rounded-md hover:bg-primary-900 px-3 py-0.5 mb-8 text-accent-50 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleCheckAnswerWithAuth}
          disabled={!selectedOption || isLoading}
        >
          {isLoading ? "Checking..." : "Check Answer"}
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

// "use client";

// import { useState } from "react";
// import { useSession } from "next-auth/react";
// import { Toaster, toast } from "sonner"; // For nice XP/Feedback toasts
// import { motion } from "framer-motion";
// import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
// import "react-circular-progressbar/dist/styles.css";
// import supabase from "@/lib/supabase-browser";

// const SingleGapFillSeries = ({ exercises }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [selectedOption, setSelectedOption] = useState("");
//   const [isAnswered, setIsAnswered] = useState(false);
//   const [isCorrect, setIsCorrect] = useState(null);
//   const [score, setScore] = useState(0);
//   const [xp, setXp] = useState(0);
//   const [recentXp, setRecentXp] = useState(0); // to show a floating +10 XP
//   const [isLoading, setIsLoading] = useState(false);
//   const [hasUpdatedProgress, setHasUpdatedProgress] = useState(false);

//   const { data: session } = useSession();
//   const currentExercise = exercises[currentIndex];

//   // XP calculation constants
//   const xpPerCorrectAnswer = 10;
//   const bonusForPerfect = 20;

//   if (!currentExercise) {
//     // Challenge completed - update progress if not already done
//     if (session?.user?.email && !hasUpdatedProgress) {
//       updateFinalProgress();
//     }

//     return (
//       <>
//         <div className="text-center text-gray-800 dark:text-white text-2xl mt-4">
//           Well done! You completed all challenges!
//           <br />
//           Your score: {score * 10} XP
//         </div>
//         <div className="w-64 h-64 m-8">
//           <CircularProgressbar
//             className="text-accent-900 dark:text-accent-50"
//             value={score}
//             maxValue={exercises.length}
//             text={`${score}/${exercises.length}`}
//             styles={buildStyles({
//               pathColor: `#22c55e`, // green
//               textColor: "#B78343",
//               trailColor: "#d6d6d6",
//               backgroundColor: "#f0f0f0",
//             })}
//           />
//         </div>
//       </>
//     );
//   }

//   const updateFinalProgress = async () => {
//     if (!session?.user?.email || hasUpdatedProgress) return;

//     try {
//       setIsLoading(true);
//       setHasUpdatedProgress(true);

//       const totalQuestions = exercises.length;
//       const percentage = (score / totalQuestions) * 100;

//       // Calculate total XP earned
//       let earnedXP = score * xpPerCorrectAnswer;
//       if (score === totalQuestions) {
//         earnedXP += bonusForPerfect;
//       }

//       // Only update if user earned some XP
//       if (earnedXP > 0) {
//         await updateUserProgressInDB(session.user.email, earnedXP);
//         showCompletionToast(earnedXP, score === totalQuestions);
//       }
//     } catch (error) {
//       console.error("Error updating final progress:", error);
//       setHasUpdatedProgress(false); // Reset so it can be tried again
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const updateUserProgressInDB = async (email, earnedXP) => {
//     try {
//       // Get the user ID from the users table
//       const { data: userData, error: userError } = await supabase
//         .from("users")
//         .select("id")
//         .eq("email", email)
//         .single();

//       if (userError || !userData) {
//         throw new Error("User not found in database");
//       }

//       const userId = userData.id;

//       // Get current user progress
//       const { data: existingProgress } = await supabase
//         .from("user_progress")
//         .select("*")
//         .eq("user_id", userId)
//         .single();

//       const currentPoints = existingProgress?.total_points || 0;
//       const currentLevel = existingProgress?.current_level || 1;
//       const currentCompleted = existingProgress?.completed_exercises || 0;

//       // Calculate new values
//       const newPoints = currentPoints + earnedXP;
//       const newLevel = Math.floor(newPoints / 500) + 1; // Every 500 points = 1 level
//       const newCompletedCount = currentCompleted + 1; // Increment completed exercises

//       const progressData = {
//         user_id: userId,
//         total_points: newPoints,
//         current_level: newLevel,
//         last_active: new Date().toISOString(),
//         completed_exercises: newCompletedCount,
//       };

//       const { error: progressError } = await supabase
//         .from("user_progress")
//         .upsert(progressData, { onConflict: "user_id" });

//       if (progressError) {
//         console.error("Error updating user progress:", progressError);
//         throw progressError;
//       }

//       console.log("User progress updated successfully", {
//         earnedXP,
//         newPoints,
//         newLevel,
//         newCompletedCount,
//       });
//     } catch (error) {
//       console.error("Error in updateUserProgressInDB:", error);
//       throw error;
//     }
//   };

//   const showCompletionToast = (earnedXP, isPerfectScore) => {
//     const message = isPerfectScore
//       ? `🎉 Perfect Score! +${earnedXP} XP earned! (includes ${bonusForPerfect} bonus!)`
//       : `✨ Challenge Complete! +${earnedXP} XP earned!`;

//     const completionToast = document.createElement("div");
//     completionToast.textContent = message;
//     completionToast.className =
//       "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-4 rounded-lg shadow-lg font-bold z-50 transition-all duration-300 max-w-sm text-center";
//     document.body.appendChild(completionToast);

//     setTimeout(() => {
//       completionToast.style.opacity = "0";
//       setTimeout(() => {
//         if (document.body.contains(completionToast)) {
//           document.body.removeChild(completionToast);
//         }
//       }, 300);
//     }, 5000); // Show longer for completion message
//   };

//   const handleCheckAnswer = () => {
//     if (selectedOption === currentExercise.correctAnswer) {
//       setIsCorrect(true);
//       setScore((prev) => prev + 1); // +10 XP
//       toast.success("Correct! +10 XP 🎉");
//       setXp((prev) => prev + 10);
//       setRecentXp(10); // or however many XP you want
//       setTimeout(() => setRecentXp(0), 1500);
//     } else {
//       setIsCorrect(false);
//       toast.error("Oops! Try the next one!");
//     }
//     setIsAnswered(true);
//   };

//   const handleNext = () => {
//     setCurrentIndex((prev) => prev + 1);
//     setSelectedOption("");
//     setIsAnswered(false);
//     setIsCorrect(null);
//   };

//   // Show login prompt if user is not logged in
//   const handleCheckAnswerWithAuth = () => {
//     if (!session?.user?.email) {
//       toast.error("Please log in to track your progress and earn XP! 🔐");
//       return;
//     }
//     handleCheckAnswer();
//   };

//   // Function to inject dropdown inside the gap {}
//   const renderTextWithDropdown = (text) => {
//     const parts = text.split("{}");
//     return (
//       <>
//         {parts[0]}
//         <select
//           className="bg-accent-100 hover:bg-accent-200 dark:bg-[#3c546c] dark:hover:bg-primary-800 border rounded px-2 py-0.5 mx-2 text-accent-900 dark:text-primary-50 transition-colors duration-200"
//           value={selectedOption}
//           onChange={(e) => setSelectedOption(e.target.value)}
//           disabled={isAnswered}
//         >
//           <option className="text-primary-900 dark:text-primary-50" value="">
//             Select...
//           </option>
//           {currentExercise.options.map((option) => (
//             <option
//               className="text-primary-900 dark:text-primary-50"
//               key={option}
//               value={option}
//             >
//               {option}
//             </option>
//           ))}
//         </select>
//         {parts[1]}
//       </>
//     );
//   };

//   return (
//     <div className="flex flex-col items-center justify-center mt-4 px-4">
//       {/* XP Display */}
//       <div className="fixed top-4 right-4 bg-white shadow-md rounded-lg px-4 py-1 flex items-center gap-2">
//         <span className="font-bold text-green-900 text-lg">{xp} XP</span>
//         {!session?.user?.email && (
//           <span className="text-xs text-gray-500">(Login to save)</span>
//         )}
//       </div>

//       <h1 className="text-2xl text-gray-700 dark:text-primary-50 font-bold mb-4">
//         {currentExercise.challengeTitle}
//       </h1>
//       <h2 className="text-xl text-gray-600 dark:text-primary-50 font-normal mb-4">
//         {currentExercise.title}
//       </h2>
//       {currentExercise.imageUrl && (
//         <motion.img
//           key={currentExercise.imageUrl} // re-animate when image changes
//           src={currentExercise.imageUrl}
//           alt="Challenge"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="w-full max-w-md h-72 object-cover object-[50%_20%] rounded-xl shadow-lg mb-2"
//         />
//       )}

//       <div className="bg-accent-50 dark:bg-primary-800 text-primary-900 dark:text-accent-50 rounded-2xl p-8 my-8 shadow-xl  max-w-2xl w-full text-xl">
//         {renderTextWithDropdown(currentExercise.text)}
//       </div>

//       {!isAnswered ? (
//         <button
//           className={`bg-primary-700 rounded-md hover:bg-primary-900 px-3 py-0.5 mb-8 text-accent-50 ${
//             isLoading ? "opacity-50 cursor-not-allowed" : ""
//           }`}
//           onClick={handleCheckAnswerWithAuth}
//           disabled={!selectedOption || isLoading}
//         >
//           {isLoading ? "Checking..." : "Check Answer"}
//         </button>
//       ) : (
//         <button
//           className="bg-primary-700 rounded-md hover:bg-primary-900 px-3 py-0.5 mb-8 text-accent-50"
//           onClick={handleNext}
//         >
//           Next
//         </button>
//       )}

//       {recentXp > 0 && (
//         <motion.div
//           initial={{ opacity: 0, y: 0 }}
//           animate={{ opacity: 1, y: -40 }}
//           exit={{ opacity: 0, y: -60 }}
//           transition={{ duration: 1 }}
//           className="absolute text-green-500 font-bold text-xl"
//         >
//           +{recentXp} XP
//         </motion.div>
//       )}

//       <div className="w-64 h-64">
//         <CircularProgressbar
//           value={score}
//           maxValue={exercises.length}
//           text={`${score}/${exercises.length}`}
//           styles={buildStyles({
//             pathColor: `#22c55e`, // green
//             textColor: "#B78343",
//             trailColor: "#d6d6d6",
//             backgroundColor: "#f0f0f0",
//           })}
//         />
//       </div>
//     </div>
//   );
// };

// export default SingleGapFillSeries;
