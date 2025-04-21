import Link from "next/link";

export default function LoginMessage() {
  return (
    <div>
      <p className="text-xl text-accent-50 font-bold mb-4 ml-16">
        Please {""}{" "}
        <Link
          href="api/auth/signin"
          className="border border-primary-50 rounded-2xl px-2 py-0.5 text-primary-900 hover:text-accent-50 bg-accent-50 hover:bg-primary-800"
        >
          login
        </Link>{" "}
        to view your dashboard
      </p>
    </div>
  );
}
