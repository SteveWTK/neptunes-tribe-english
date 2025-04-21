import SignInButton from "../components/SigninButton";

export const metadata = {
  title: "Login",
};

export default function Page() {
  return (
    <div className="flex flex-col gap-10 mt-10 items-center">
      <h2 className="text-3xl text-accent-50 font-josefin font-semibold">
        Sign in to access your dashboard
      </h2>
      <SignInButton />
    </div>
  );
}
