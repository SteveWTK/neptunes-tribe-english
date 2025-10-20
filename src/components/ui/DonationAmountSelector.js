"use client";

import { useState } from "react";

const presetAmounts = [5, 10, 15, 25, 50];

export function DonationAmountSelector({ onChange }) {
  const [selected, setSelected] = useState(null);
  const [customAmount, setCustomAmount] = useState("");

  const handlePresetClick = (amount) => {
    setSelected(amount);
    setCustomAmount("");
    onChange(amount);
  };

  const handleCustomChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setSelected(null);
    onChange(value);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        {presetAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => handlePresetClick(amount)}
            className={`rounded-xl border px-4 py-3 text-center font-semibold transition-all ${
              selected == amount
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            }`}
          >
            £{amount}
          </button>
        ))}
      </div>

      <div className="relative">
        <input
          type="number"
          placeholder="Custom amount"
          value={customAmount}
          onChange={handleCustomChange}
          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 pr-14 focus:ring-2 focus:ring-emerald-500"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
          GBP
        </span>
      </div>
    </div>
  );
}
