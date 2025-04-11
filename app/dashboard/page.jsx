import { createClient } from "@/utils/supabase/server";
// import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  // if (!user) {
  //   redirect("/login");
  // }

  const mockUser = {
    id: "mock-user-123",
    name: "Test Explorer",
    points: 1450,
    level: 4,
    streak: 5,
    achievements: ["First Login", "Completed 10 Challenges", "3-Day Streak"],
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold">
        Welcome to your Dashboard, {mockUser}
      </h1>
      <p className="mt-4">You are now logged in.</p>
    </div>
  );
}
