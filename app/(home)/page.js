"use client";

import Link from "next/link";

export default function landingPageHome() {
  return (
    // <div className="w-full flex justify-center bg-white dark:bg-primary-950">
    //   <img src="/landing/Habitat-landing-slogan.png" alt="Hero" className="" />
    // </div>
    <div className="relative transform-3d">
      <div className="top-1/2 left-1/2 flex justify-center  bg-white dark:bg-primary-950">
        <Link href="/schools">
          <img
            src="/landing/Habitat-landing-slogan.png"
            alt="Hero"
            className="lg:px-32"
            href="/schools"
          />
        </Link>
      </div>
      {/* <Link
        href="/schools"
        className="absolute bottom-3/8 right-1/3 text-accent-50 hover:text-accent-200 border-b-1 px-2 py-1 border-accent-50 hover:border-accent-200 rounded-xl hover:translate-z-192"
      >
        ENTER
      </Link> */}
    </div>
  );
}
