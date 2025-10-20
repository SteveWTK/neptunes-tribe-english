"use client";
import { useState, useEffect } from "react";

const words = [
  // { en: "whale", pt: "baleia" },
  // { en: "rainforest", pt: "floresta tropical" },
  // { en: "frog", pt: "rã" },
  // { en: "ocean", pt: "oceano" },
  // { en: "bee", pt: "abelha" },
  // { en: "desert", pt: "deserto" },
  { en: "river", pt: "rio" },
  { en: "beach", pt: "praia" },
  { en: "crab", pt: "caranguejo" },
  { en: "dolphin", pt: "golfinho" },
  { en: "eagle", pt: "águia" },
  { en: "anteater", pt: "tamanduá" },
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
    <div className="flex flex-col items-center gap-4 p-4 my-12">
      <h2 className="text-2xl font-bold mb-12">🌿 Eco Memory Match</h2>
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

// "use client";
// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";

// // Mock data for now (later, fetch from Supabase)
// const mockWords = [
//   { id: "1", en: "whale", pt: "baleia" },
//   { id: "2", en: "rainforest", pt: "floresta tropical" },
//   { id: "3", en: "frog", pt: "rã" },
//   { id: "4", en: "ocean", pt: "oceano" },
//   { id: "5", en: "bee", pt: "abelha" },
//   { id: "6", en: "desert", pt: "deserto" },
// ];

// // Shuffle helper
// function shuffle(array) {
//   return array.sort(() => Math.random() - 0.5);
// }

// export default function MemoryMatch() {
//   const [cards, setCards] = useState([]);
//   const [flipped, setFlipped] = useState([]);
//   const [matched, setMatched] = useState([]);
//   const [won, setWon] = useState(false);

//   useEffect(() => {
//     const pairs = mockWords.flatMap((w) => [
//       { id: w.id, text: w.en, lang: "en" },
//       { id: w.id, text: w.pt, lang: "pt" },
//     ]);
//     setCards(shuffle(pairs));
//   }, []);

//   useEffect(() => {
//     if (matched.length === mockWords.length) {
//       setWon(true);
//     }
//   }, [matched]);

//   const handleFlip = (index) => {
//     if (flipped.length === 2 || flipped.includes(index)) return;
//     const newFlipped = [...flipped, index];
//     setFlipped(newFlipped);

//     if (newFlipped.length === 2) {
//       const [first, second] = newFlipped.map((i) => cards[i]);
//       if (first.id === second.id && first.lang !== second.lang) {
//         setMatched((m) => [...m, first.id]);
//       }
//       setTimeout(() => setFlipped([]), 1000);
//     }
//   };

//   const handleRestart = () => {
//     const pairs = mockWords.flatMap((w) => [
//       { id: w.id, text: w.en, lang: "en" },
//       { id: w.id, text: w.pt, lang: "pt" },
//     ]);
//     setCards(shuffle(pairs));
//     setMatched([]);
//     setFlipped([]);
//     setWon(false);
//   };

//   return (
//     <div className="flex flex-col items-center gap-6 p-6">
//       <h2 className="text-3xl font-bold text-green-700 dark:text-green-300">
//         🌿 Eco Memory Match
//       </h2>

//       {won ? (
//         <div className="flex flex-col items-center gap-4">
//           <p className="text-xl font-semibold text-green-600 dark:text-green-300">
//             🎉 You matched them all!
//           </p>
//           <button
//             onClick={handleRestart}
//             className="px-6 py-3 rounded-xl bg-green-600 text-white font-medium shadow-md hover:bg-green-700 transition"
//           >
//             Play Again
//           </button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//           {cards.map((card, i) => {
//             const isFlipped = flipped.includes(i) || matched.includes(card.id);
//             return (
//               <motion.button
//                 key={i}
//                 onClick={() => handleFlip(i)}
//                 className="w-28 h-20 rounded-2xl shadow-lg font-medium text-lg"
//                 initial={false}
//                 animate={{ rotateY: isFlipped ? 180 : 0 }}
//                 transition={{ duration: 0.5 }}
//               >
//                 <div
//                   className={`w-full h-full flex items-center justify-center rounded-2xl backface-hidden ${
//                     isFlipped
//                       ? "bg-green-200 text-gray-800"
//                       : "bg-gray-700 text-white"
//                   }`}
//                 >
//                   {isFlipped ? card.text : "❓"}
//                 </div>
//               </motion.button>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }
