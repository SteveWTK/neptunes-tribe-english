"use client";

import SelectOption from "./SelectOption";
import { useState } from "react";
import styled from "styled-components";

const ExerciseCard = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;

  @media (prefers-color-scheme: dark) {
    background-color: #1f2937;
    color: white;
  }
`;

const Sentence = styled.p`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;

const Feedback = styled.div`
  margin-top: 1rem;
  font-weight: bold;
  color: ${({ correct }) => (correct ? "green" : "red")};
`;

const NextButton = styled.button`
  margin-top: 1.5rem;
  background-color: #4f46e5; /* Indigo */
  color: white;
  font-weight: bold;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 1.125rem;
  transition: background 0.3s;

  &:hover {
    background-color: #4338ca;
  }
`;

export default function Exercise({
  sentence,
  correctAnswer,
  options,
  onAnswer,
}) {
  const [selectedOption, setSelectedOption] = useState("");
  const [answered, setAnswered] = useState(false);

  const handleSelect = (e) => {
    const value = e.target.value;
    setSelectedOption(value);
    setAnswered(true);
  };

  const handleNext = () => {
    if (selectedOption) {
      onAnswer(selectedOption); // Pass the answer up to parent
      setSelectedOption(""); // Reset for next question
      setAnswered(false);
    }
  };

  const isCorrect = selectedOption === correctAnswer;

  return (
    <ExerciseCard>
      <Sentence>{sentence}</Sentence>

      <SelectOption
        options={options}
        selectedOption={selectedOption}
        onSelect={handleSelect}
        disabled={answered} // Pass disabled prop
      />

      {answered && (
        <>
          <Feedback correct={isCorrect}>
            {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
          </Feedback>
          <NextButton onClick={handleNext}>Next</NextButton>
        </>
      )}
    </ExerciseCard>
  );
}
