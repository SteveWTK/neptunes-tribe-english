// app/dashboard/page.js

import ProgressDashboard from "@/app/components/ProgressDashboard";
import { auth } from "@/lib/auth";
import LoginMessage from "@/app/components/LoginMessage";

export default async function DashboardPage() {
  const session = await auth();
  console.log(session);

  return (
    <div className="p-6 mt-18">
      {session?.user ? (
        <ProgressDashboard user={session.user} />
      ) : (
        <LoginMessage />
      )}
    </div>
  );
}
