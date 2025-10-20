"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function PixCopyBox({ pixKey }) {
  const [copied, setCopied] = useState(false);

  const buttonClass =
    "rounded-2xl px-4 py-1 bg-gradient-to-b from-primary-200 to-primary-400 hover:from-primary-300 hover:to-primary-500 dark:from-primary-50 dark:to-primary-200 dark:hover:from-primary-100 dark:hover:to-primary-300 text-primary-950 dark:text-primary-950";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar a chave PIX:", err);
    }
  };

  return (
    <div className="w-fit flex items-center space-x-2 rounded-2xl px-4 py-1 bg-gradient-to-b from-primary-200 to-primary-400  dark:from-primary-50 dark:to-primary-200 text-primary-950 dark:text-primary-950">
      <span className="font-mono text-lg truncate">{pixKey}</span>
      <button
        onClick={handleCopy}
        className={buttonClass}
        aria-label="Copiar Chave PIX"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-100 dark:text-green-800" />
        ) : (
          <Copy className="h-4 w-4 text-gray-500" />
        )}
      </button>
    </div>
  );
}
