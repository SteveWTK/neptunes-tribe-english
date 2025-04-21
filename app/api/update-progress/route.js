// app/api/update-progress/route.js

export async function POST(req) {
  try {
    const { score, total, mockUserId } = await req.json();

    // Simulate XP system: 10 XP per correct answer + 50 for completing
    const baseXP = score * 10;
    const bonusXP = total > 0 ? 50 : 0;
    const xpGained = baseXP + bonusXP;

    // Simulate level logic (simple thresholds)
    const userXP = 200 + xpGained; // mock: assume 200 existing XP
    const level = Math.floor(userXP / 300); // level up every 300 XP

    // Simulate streak logic
    const streak = 5; // mock: static streak
    const achievements = score === total ? ["Perfect Score!"] : [];

    return Response.json({
      success: true,
      updatedXP: userXP,
      level,
      streak,
      achievements,
    });
  } catch (err) {
    console.error("Progress update error:", err);
    return Response.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
