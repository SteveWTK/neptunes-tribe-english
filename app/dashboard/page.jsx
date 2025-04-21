import ProgressDashboard from "@/app/components/ProgressDashboard";
import Image from "next/image";
import eco1 from "@/public/heroes/farwiza-farhan-elephant.jpeg";
import { auth } from "../lib/auth";
import LoginMessage from "../components/LoginMessage";

export default async function DashboardPage() {
  const session = await auth();
  console.log(session);

  return (
    <div className="p-6">
      {session?.user ? (
        <ProgressDashboard user={session.user} />
      ) : (
        <LoginMessage />
      )}

      <div className="flex mx-16 my-6">
        <Image
          src={eco1}
          placeholder="blur"
          width={300}
          height={200}
          quality={80}
          className="col-span-4 w-full h-24 sm:h-72 object-cover border-2 rounded-lg
        border-accent-100 hover:ring-1 hover:ring-primary-950"
          alt="Farwiza Farhan"
        />
      </div>
    </div>
  );
}
