// UnitCard.js or .jsx
export default function UnitCardFeatured({ unit, highlight = false }) {
  return (
    <div
      className={`rounded-lg p-6 shadow-md transition hover:shadow-xl ${
        highlight
          ? "col-span-full bg-yellow-100 dark:bg-yellow-900"
          : "bg-white dark:bg-primary-800"
      }`}
    >
      <h2 className={`text-xl font-semibold ${highlight ? "text-3xl" : ""}`}>
        {unit.unit}: {unit.title}
      </h2>
      {/* Add more detail if needed */}
    </div>
  );
}
