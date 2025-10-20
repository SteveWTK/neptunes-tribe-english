import Link from "next/link";

export default function UnitsTest() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
        Units Test Page
      </h1>
      <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
        If you can see this, the units routing is working.
      </p>
      <div className="text-center mt-8">
        <Link
          href="/units"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Go to Units
        </Link>
      </div>
    </div>
  );
}
