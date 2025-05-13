import Link from "next/link";
import { auth } from "../../lib/auth";
import SignOutButton from "./signoutButton";
import SignInButton from "./SigninButton";

export default async function Navigation() {
  const session = await auth();
  console.log(session);

  return (
    <nav className="flex z-10 text-base items-center">
      <ul className=" flex gap-12 items-center content-around">
        <li>
          <Link
            href="/about"
            className="py-3 px-5 font-josefin text-center text-accent-50 hover:text-accent-500 transition-colors"
          >
            About
          </Link>
        </li>
        <li>
          <Link
            href="/units"
            className="py-3 px-5 font-josefin text-center text-accent-50 hover:text-accent-500 transition-colors"
          >
            Units
          </Link>
        </li>
        <li>
          <Link
            href="/challenges"
            className="py-3 px-5 font-josefin text-center text-accent-50 hover:text-accent-500 transition-colors"
          >
            Challenges
          </Link>
        </li>
        <li>
          {session?.user?.image ? (
            <Link
              href="/dashboard"
              className="py-3 px-5 font-josefin text-center text-accent-50 hover:text-accent-500 transition-colors flex items-center gap-2 lg:gap-4"
            >
              <img
                className="h-8 rounded-full"
                src={session.user.image}
                alt={session.user.name}
                referrerPolicy="no-referrer"
              />
              <span>Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="py-3 px-5 font-josefin text-center text-accent-50 hover:text-accent-500 transition-colors"
            >
              Dashboard
            </Link>
          )}
        </li>
      </ul>

      {session ? (
        <SignOutButton className="flex justify-end items-center" />
      ) : (
        <Link
          href="/login"
          className="flex justify-end items-center py-0.5 px-5 font-josefin text-center bg-primary-50 rounded-2xl text-primary-900 hover:bg-primary-300 transition-colors"
        >
          Sign In
        </Link>
      )}
    </nav>
  );
}
