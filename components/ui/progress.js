"use client";

export function Progress({ value, className = "" }) {
  return (
    <div
      className={`w-full bg-gray-100 dark:bg-zinc-700 rounded-full ${className}`}
    >
      <div
        className="h-full bg-[#537D5D] rounded-full transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
