import { signOutAction } from "../../lib/actions";

const { ArrowRightOnRectangleIcon } = require("@heroicons/react/24/solid");

function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button className="py-0.5 px-5 rounded-2xl  transition-colors flex items-center gap-3 text-primary-900 hover:text-accent-600 hover:border-b-1 hover:border-accent-600 dark:text-accent-50 dark:hover:text-accent-400 dark:hover:border-accent-400 w-full">
        <ArrowRightOnRectangleIcon className="h-5 w-5" />
        <span>Sign Out</span>
      </button>
    </form>
  );
}

export default SignOutButton;
