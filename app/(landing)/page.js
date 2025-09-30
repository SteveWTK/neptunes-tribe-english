"use client";

// import Link from "next/link";

export default function landingPageHome() {
  return (
    // <div className="w-full flex justify-center bg-white dark:bg-primary-950">
    //   <img src="/landing/Habitat-landing-slogan.png" alt="Hero" className="" />
    // </div>
    <div className="relative transform-3d">
      <div className="top-1/2 left-1/2 flex justify-center  bg-white dark:bg-primary-950">
        <img
          src="/landing/Habitat-landing-slogan.png"
          alt="Hero"
          className="hidden sm:block lg:px-32"
          href="/schools"
        />
        <img
          src="/landing/Habitat-landing-mobile.png"
          alt="Hero"
          className="sm:hidden"
          href="/schools"
        />
      </div>
      {/* <Link href="/schools">
        <p className="absolute bottom-3/8 right-7/20 lg:right-2/5 invisible md:visible md:text-[10px] xl:text-sm text-accent-50 hover:text-accent-200 border-b-1 px-2 py-1 border-accent-50 hover:border-accent-200 rounded-xl hover:translate-z-192">
          {" "}
          SCHOOLS
        </p>
      </Link>
      <Link href="/schools">
        <p className="absolute bottom-3/8 right-11/50 lg:right-1/4 invisible md:visible md:text-[10px] xl:text-sm text-accent-50 hover:text-accent-200 border-b-1 px-2 py-1 border-accent-50 hover:border-accent-200 rounded-xl hover:translate-z-192">
          {" "}
          SOLO EXPLORERS
        </p>
      </Link> */}
    </div>
  );
}
