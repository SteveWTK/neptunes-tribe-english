import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabase } from "@/lib/data-service";

export async function POST(req) {
  const formData = await req.formData();

  const name = formData.get("name");
  const email = formData.get("email");
  const amount = formData.get("amount") || null;
  const file = formData.get("file");

  if (!name || !email) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  let receiptUrl = null;

  if (file && file.name) {
    const fileExt = file.name.split(".").pop();
    const filename = `${randomUUID()}.${fileExt}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { data, error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(`bank-transfers/${filename}`, fileBuffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "File upload failed" },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from("receipts")
      .getPublicUrl(`bank-transfers/${filename}`);

    receiptUrl = urlData?.publicUrl;
  }

  const { error: insertError } = await supabase
    .from("manual_donations")
    .insert([
      {
        name,
        email,
        amount,
        receipt_url: receiptUrl,
      },
    ]);

  if (insertError) {
    console.error("Insert error:", insertError);
    return NextResponse.json(
      { error: "Database insert failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
