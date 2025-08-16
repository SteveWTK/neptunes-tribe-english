"use client";

import Link from "next/link";
import Image from "next/image";

export default function ChallengeCard({ challenge }) {
  return (
    <Link href={`/challenges/${challenge.challenge_id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
        {/* Image Section */}
        {challenge.image_url && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={challenge.image_url}
              alt={challenge.challenge_title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          </div>
        )}

        {/* Content Section */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {challenge.challenge_title}
          </h3>

          {/* {challenge.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-3">
              {challenge.description}
            </p>
          )} */}

          {/* Challenge Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              {challenge.exerciseCount || 10} exercises
            </span>

            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
              Challenge #{challenge.challenge_id}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
