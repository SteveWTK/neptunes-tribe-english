import { signOutAction } from "../lib/actions";

const { ArrowRightOnRectangleIcon } = require("@heroicons/react/24/solid");

function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button className="py-0.5 px-5 rounded-2xl hover:text-accent-500 transition-colors flex items-center gap-3  text-accent-50 w-full">
        <ArrowRightOnRectangleIcon className="h-5 w-5 text-accent-50" />
        <span>Sign Out</span>
      </button>
    </form>
  );
}

export default SignOutButton;
