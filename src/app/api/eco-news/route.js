import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

export async function GET(request) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit")) || 50;

    console.log("Fetching eco-news with params:", {
      category,
      type,
      featured,
      limit,
    });

    let query = supabase
      .from("eco_news_posts")
      .select("*")
      .eq("status", "published")
      .order("published_date", { ascending: false })
      .limit(limit);

    // Apply filters
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (type) {
      query = query.eq("type", type);
    }

    if (featured) {
      query = query.eq("featured", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error fetching eco-news:", error);
      return new NextResponse("Database Error", { status: 500 });
    }

    console.log(`Successfully fetched ${data?.length || 0} eco-news posts`);
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Unexpected error in GET /api/eco-news:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log("POST /api/eco-news - Starting...");

    const session = await auth();
    console.log("Session:", session ? "Found" : "Not found");

    if (!session?.user?.email) {
      console.log("No session or email found");
      return new NextResponse("Unauthorized - Please log in", { status: 401 });
    }

    console.log("User email:", session.user.email);

    const supabase = getSupabaseAdmin();
    const body = await request.json();
    console.log("Request body received:", Object.keys(body));

    // Get user ID from email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError) {
      console.error("Error finding user:", userError);
      return new NextResponse(`User lookup error: ${userError.message}`, {
        status: 404,
      });
    }

    if (!userData) {
      console.log("User not found in database");
      return new NextResponse("User not found in database", { status: 404 });
    }

    console.log("User found:", userData.id);

    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Estimate read time (rough calculation: 200 words per minute)
    const wordCount = body.content ? body.content.split(" ").length : 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    const postData = {
      title: body.title,
      summary: body.summary,
      content: body.content || null,
      type: body.type,
      category: body.category,
      author_name: body.author_name || null,
      source_name: body.source_name || null,
      source_url: body.source_url || null,
      region_code: body.region_code || null,
      featured: body.featured || false,
      slug: slug,
      read_time_minutes: readTime,
      created_by: userData.id,
      published_date: new Date().toISOString().split("T")[0], // Today's date
    };

    console.log("Inserting post data:", Object.keys(postData));

    const { data, error } = await supabase
      .from("eco_news_posts")
      .insert([postData])
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating post:", error);
      return new NextResponse(`Database error: ${error.message}`, {
        status: 500,
      });
    }

    console.log("Post created successfully:", data.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error in POST /api/eco-news:", error);
    return new NextResponse(`Server error: ${error.message}`, { status: 500 });
  }
}
