"use client";
import { useState, useEffect } from "react";

const words = [
  { en: "whale", pt: "baleia" },
  { en: "rainforest", pt: "floresta tropical" },
  { en: "frog", pt: "rã" },
  { en: "ocean", pt: "oceano" },
  { en: "bee", pt: "abelha" },
  { en: "desert", pt: "deserto" },
];

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

export default function MemoryMatch() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  useEffect(() => {
    const pairs = words.flatMap((w) => [
      { id: w.en, text: w.en, lang: "en" },
      { id: w.en, text: w.pt, lang: "pt" },
    ]);
    setCards(shuffle(pairs));
  }, []);

  const handleFlip = (index) => {
    if (flipped.length === 2 || flipped.includes(index)) return;
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped.map((i) => cards[i]);
      if (first.id === second.id && first.lang !== second.lang) {
        setMatched((m) => [...m, first.id]);
      }
      setTimeout(() => setFlipped([]), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-2xl font-bold">🌿 Eco Memory Match</h2>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || matched.includes(card.id);
          return (
            <button
              key={i}
              onClick={() => handleFlip(i)}
              className={`w-28 h-20 flex items-center justify-center rounded-2xl shadow-md font-medium text-lg transition 
                ${
                  isFlipped
                    ? "bg-green-200 text-gray-800"
                    : "bg-gray-700 text-white"
                }`}
            >
              {isFlipped ? card.text : "❓"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
