"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#115e59", "#9f1239"]; // Green for correct, red for incorrect

const getAnswerData = (totalCorrect, totalQuestions) => [
  { name: "Correct", value: totalCorrect },
  { name: "Incorrect", value: totalQuestions - totalCorrect },
];

export default function PieChartAnswers({ totalCorrect, totalQuestions }) {
  const data = getAnswerData(totalCorrect, totalQuestions);

  return (
    <PieChart width={240} height={240}>
      <Pie
        data={data}
        cx={120}
        cy={105}
        labelLine={false}
        innerRadius={45}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
        paddingAngle={0}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
}
