import { signInAction } from "../../lib/actions";

function SignInButton() {
  return (
    <form action={signInAction}>
      <button className="flex items-center gap-6 text-primary-800 dark:text-accent-50 text-lg border rounded-2xl border-primary-800 dark:border-accent-50 px-10 py-4 font-medium hover:bg-primary-300 dark:hover:bg-primary-700">
        <img
          src="https://authjs.dev/img/providers/google.svg"
          alt="Google logo"
          height="24"
          width="24"
        />
        <span>Sign in with Google</span>
      </button>
    </form>
  );
}

export default SignInButton;
