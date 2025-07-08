// app/api/eco-news/[id]/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

export async function PUT(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { id } = params;

    // Generate new slug if title changed
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Recalculate read time
    const wordCount = body.content ? body.content.split(" ").length : 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    const updateData = {
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
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("eco_news_posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating post:", error);
      return new NextResponse("Error updating post", { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { id } = params;

    const { error } = await supabase
      .from("eco_news_posts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting post:", error);
      return new NextResponse("Error deleting post", { status: 500 });
    }

    return new NextResponse("Post deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
