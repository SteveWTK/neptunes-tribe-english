// app/api/user/ecosystem-progress/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Get user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Get ecosystem progress
    const { data: ecosystemData, error: ecosystemError } = await supabase
      .from('user_ecosystem_progress')
      .select('*')
      .eq('user_id', userData.id);

    if (ecosystemError) {
      console.error('Error fetching ecosystem progress:', ecosystemError);
      return new NextResponse('Database error', { status: 500 });
    }

    // Get Green Scale level
    const { data: greenScaleData, error: greenScaleError } = await supabase
      .rpc('get_user_green_scale_level', { p_user_id: userData.id });

    if (greenScaleError) {
      console.error('Error fetching Green Scale level:', greenScaleError);
    }

    // Format the response
    const ecosystemProgress = {};
    if (ecosystemData) {
      ecosystemData.forEach(item => {
        ecosystemProgress[item.ecosystem] = {
          units_completed: item.units_completed,
          current_level: item.current_level,
          current_badge: item.current_badge,
          last_activity_date: item.last_activity_date
        };
      });
    }

    // Get most recent activity date
    const lastActivityDate = ecosystemData && ecosystemData.length > 0
      ? Math.max(...ecosystemData.map(item => new Date(item.last_activity_date).getTime()))
      : null;

    return NextResponse.json({
      ecosystemProgress,
      greenScale: greenScaleData?.[0] || { level: 0, name: 'New Recruit', badge: '🌿', total_units: 0 },
      lastActivityDate: lastActivityDate ? new Date(lastActivityDate).toISOString() : null
    });

  } catch (error) {
    console.error('Unexpected error in ecosystem progress API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}