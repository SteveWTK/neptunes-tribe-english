export default function ResultSummary({ exercises, answers }) {
  const CorrectCount = exercises.filter(
    (ex) => ex.correct_answer === answers[ex.id]
  ).length;

  return (
    <div className="text-center mt-10">
      <h2 className="text-2xl font-bold mb-4">Results</h2>
      <p className="mb-6">
        You got {correctCount} out of {exercises.length} correct!
      </p>
      <ul className="space-y-4">
        {exercises.map((ex) => (
          <li key={ex.id} className="border p-4 rounded-md">
            <p>{ex.text.replace("{}", `"${answers[ex.id] || "____"}"`)} </p>
            <p>
              {answer[ex.id] === ex.correct_answer
                ? "✅ Correct!"
                : `❌ Correct Answer: ${ex.correct_answer}`}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
