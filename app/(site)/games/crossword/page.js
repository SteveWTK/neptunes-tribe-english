"use client";
import { useState } from "react";

const crossword = {
  grid: [
    ["b", "a", "l", "e", "i", "a", "", "", "", ""],
    ["", "", "", "", "n", "", "", "", "", ""],
    ["", "", "", "", "h", "", "", "", "", ""],
    ["", "", "", "", "o", "", "", "", "", ""],
    ["", "", "", "", "s", "", "", "", "", ""],
    ["", "", "", "", "t", "", "", "", "", ""],
    ["", "", "", "", "a", "", "", "", "", ""],
  ],
  clues: [
    {
      number: 1,
      clue: "Whale (PT)",
      answer: "baleia",
      direction: "across",
      row: 0,
      col: 0,
    },
    {
      number: 2,
      clue: "Rainforest (PT)",
      answer: "floresta",
      direction: "down",
      row: 0,
      col: 4,
    },
  ],
};

export default function Crossword() {
  const [grid, setGrid] = useState(
    crossword.grid.map((row) => row.map((cell) => (cell === "" ? "" : "")))
  );

  const handleChange = (row, col, value) => {
    const newGrid = [...grid];
    newGrid[row][col] = value.toLowerCase();
    setGrid(newGrid);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🌍 Eco Crossword</h2>
      <div className="grid grid-cols-10 gap-1">
        {crossword.grid.map((row, r) =>
          row.map((cell, c) => (
            <input
              key={`${r}-${c}`}
              maxLength={1}
              value={grid[r][c]}
              onChange={(e) => handleChange(r, c, e.target.value)}
              className={`w-8 h-8 text-center border rounded-md ${
                cell !== "" ? "bg-white" : "bg-gray-300 pointer-events-none"
              }`}
            />
          ))
        )}
      </div>
      <div className="mt-4">
        {crossword.clues.map((c) => (
          <p key={c.number}>
            <strong>{c.number}.</strong> {c.clue}
          </p>
        ))}
      </div>
    </div>
  );
}
