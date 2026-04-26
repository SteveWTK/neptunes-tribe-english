import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/schools
 * Lists all schools with stats. Admin only.
 */
export async function GET(request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const supabase = await getSupabaseAdmin();

    // Verify admin role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, role")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData || userData.role !== "platform_admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Parse query params for filtering
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";
    const tier = searchParams.get("tier");

    // Build query
    let query = supabase
      .from("schools")
      .select("*")
      .order("created_at", { ascending: false });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    if (tier) {
      query = query.eq("partnership_tier", tier);
    }

    const { data: schools, error: schoolsError } = await query;

    if (schoolsError) {
      console.error("Error fetching schools:", schoolsError);
      return NextResponse.json(
        { error: "Failed to fetch schools" },
        { status: 500 }
      );
    }

    // Get student counts for each school
    const schoolIds = schools.map((s) => s.id);

    const { data: studentCounts } = await supabase
      .from("users")
      .select("school_id")
      .in("school_id", schoolIds.length > 0 ? schoolIds : ["none"]);

    // Build stats map
    const statsMap = {};
    (studentCounts || []).forEach((u) => {
      if (!statsMap[u.school_id]) {
        statsMap[u.school_id] = 0;
      }
      statsMap[u.school_id]++;
    });

    // Merge stats into schools
    const schoolsWithStats = schools.map((s) => ({
      ...s,
      student_count: statsMap[s.id] || 0,
    }));

    // Summary stats
    const summary = {
      total_schools: schools.length,
      active_schools: schools.filter((s) => s.is_active).length,
      total_students: (studentCounts || []).length,
      by_tier: {
        pilot: schools.filter((s) => s.partnership_tier === "pilot").length,
        basic: schools.filter((s) => s.partnership_tier === "basic").length,
        premium: schools.filter((s) => s.partnership_tier === "premium").length,
        enterprise: schools.filter((s) => s.partnership_tier === "enterprise").length,
      },
    };

    return NextResponse.json({
      schools: schoolsWithStats,
      summary,
    });
  } catch (error) {
    console.error("Error listing schools:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/schools
 * Creates a new school. Admin only.
 */
export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const supabase = await getSupabaseAdmin();

    // Verify admin role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, role")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData || userData.role !== "platform_admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "School name is required" },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    let slug = body.slug?.trim();
    if (!slug) {
      const { data: slugResult } = await supabase.rpc("generate_school_slug", {
        school_name: body.name,
      });
      slug = slugResult || body.name.toLowerCase().replace(/\s+/g, "-");
    }

    // Generate code if not provided
    let code = body.code?.trim();
    if (!code) {
      const { data: codeResult } = await supabase.rpc("generate_school_code");
      code = codeResult || `SCH-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }

    // Create school
    const { data: school, error: createError } = await supabase
      .from("schools")
      .insert({
        name: body.name.trim(),
        slug,
        code,
        group_name: body.group_name?.trim() || null,
        branch_name: body.branch_name?.trim() || null,
        contact_name: body.contact_name?.trim() || null,
        contact_email: body.contact_email?.trim() || null,
        contact_phone: body.contact_phone?.trim() || null,
        city: body.city?.trim() || null,
        state: body.state?.trim() || null,
        country: body.country?.trim() || "Brazil",
        timezone: body.timezone?.trim() || "America/Sao_Paulo",
        partnership_tier: body.partnership_tier || "pilot",
        partnership_start: body.partnership_start || new Date().toISOString().split("T")[0],
        partnership_end: body.partnership_end || null,
        logo_url: body.logo_url?.trim() || null,
        primary_color: body.primary_color?.trim() || "#1e40af",
        welcome_message: body.welcome_message?.trim() || null,
        welcome_message_pt: body.welcome_message_pt?.trim() || null,
        welcome_message_th: body.welcome_message_th?.trim() || null,
        features_config: body.features_config || {},
        auto_premium: body.auto_premium !== false, // Default true
        premium_duration_days: body.premium_duration_days || 365,
        is_active: body.is_active !== false, // Default true
        created_by: userData.id,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating school:", createError);
      if (createError.code === "23505") {
        // Unique constraint violation
        return NextResponse.json(
          { error: "A school with this slug or code already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create school" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, school }, { status: 201 });
  } catch (error) {
    console.error("Error creating school:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
