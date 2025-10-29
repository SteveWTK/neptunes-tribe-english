import { createClient } from "./client";

const supabase = createClient();

export async function getAllLessonsForCMS() {
  try {
    const { data, error } = await supabase
      .from("lessons")
      .select(
        `
        *,
        pillar:pillars(*)
      `
      )
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching lessons:", error);
    throw error;
  }
}

export async function getLessonByIdForCMS(lessonId) {
  try {
    const { data, error } = await supabase
      .from("lessons")
      .select(
        `
        *,
        pillar:pillars(*)
      `
      )
      .eq("id", lessonId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching lesson:", error);
    throw error;
  }
}

export async function createLesson(lessonData) {
  try {
    const allowedFields = [
      "title",
      "description",
      "description_pt",
      "pillar_id",
      "difficulty",
      "xp_reward",
      "content",
      "image_url",
      "audio_url",
      "estimated_duration",
      "is_active",
      "sort_order",
      "audio_assets",
      "visual_assets",
      "interactive_config",
      "lesson_code",
      "unit_number",
      "lesson_number",
      "level_name",
      "under_construction",
      "target_audience",
      "world",
      "theme_tags",
    ];

    const cleanedData = {};
    allowedFields.forEach((field) => {
      if (field in lessonData) {
        if (field === "pillar_id") {
          cleanedData[field] = lessonData[field]
            ? parseInt(lessonData[field])
            : null;
        } else {
          cleanedData[field] = lessonData[field];
        }
      }
    });

    const { data, error } = await supabase
      .from("lessons")
      .insert([cleanedData])
      .select()
      .single();

    if (error) {
      console.error("Supabase error details:", error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Error creating lesson:", error);
    throw error;
  }
}

export async function updateLesson(lessonId, lessonData) {
  try {
    const allowedFields = [
      "title",
      "description",
      "description_pt",
      "pillar_id",
      "difficulty",
      "xp_reward",
      "content",
      "image_url",
      "audio_url",
      "estimated_duration",
      "is_active",
      "sort_order",
      "audio_assets",
      "visual_assets",
      "interactive_config",
      "lesson_code",
      "unit_number",
      "lesson_number",
      "level_name",
      "under_construction",
      "target_audience",
      "world",
      "theme_tags",
    ];

    const cleanedData = {};
    allowedFields.forEach((field) => {
      if (field in lessonData) {
        if (field === "pillar_id") {
          cleanedData[field] = lessonData[field]
            ? parseInt(lessonData[field])
            : null;
        } else {
          cleanedData[field] = lessonData[field];
        }
      }
    });

    const { data, error } = await supabase
      .from("lessons")
      .update(cleanedData)
      .eq("id", lessonId)
      .select()
      .single();

    if (error) {
      console.error("Supabase error details:", error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Error updating lesson:", error);
    throw error;
  }
}

export async function deleteLesson(lessonId) {
  try {
    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lessonId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting lesson:", error);
    throw error;
  }
}

export async function cloneLesson(lessonId) {
  try {
    const original = await getLessonByIdForCMS(lessonId);

    const cloneData = {
      ...original,
      id: undefined,
      pillar: undefined,
      pillar_id: original.pillar_id,
      title: `${original.title} (Copy)`,
      is_active: false,
      created_at: undefined,
      updated_at: undefined,
    };

    return await createLesson(cloneData);
  } catch (error) {
    console.error("Error cloning lesson:", error);
    throw error;
  }
}

export async function uploadMedia(file, folder = "lesson-media") {
  try {
    console.log("uploadMedia called with:", { fileName: file.name, folder });

    const fileExt = file.name.split(".").pop().toLowerCase();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Determine bucket based on file type
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    const videoExtensions = ["mp4", "webm", "ogg", "mov"];
    const audioExtensions = ["mp3", "wav", "ogg", "m4a"];

    let bucketName = "unit-images"; // Default to images bucket

    if (videoExtensions.includes(fileExt)) {
      bucketName = "videos";
    } else if (audioExtensions.includes(fileExt)) {
      bucketName = "audio";
    }

    console.log("Uploading to bucket:", bucketName, "path:", filePath);

    // Upload to appropriate bucket
    const { data: uploadData, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error(`Upload error details:`, {
        error,
        errorMessage: error.message,
        errorName: error.name,
        statusCode: error.statusCode,
        bucketName,
        filePath,
        fileExt,
        fileSize: file.size,
        fileType: file.type,
      });

      // Provide helpful error messages based on common issues
      if (error.message?.includes("new row violates row-level security")) {
        throw new Error(
          `Permission denied: The bucket "${bucketName}" exists but your user doesn't have permission to upload. Check RLS policies in Supabase.`
        );
      } else if (error.message?.includes("Bucket not found")) {
        throw new Error(
          `Bucket "${bucketName}" does not exist. Please create it in Supabase Storage and make it public.`
        );
      } else {
        throw new Error(
          `Failed to upload to ${bucketName}: ${error.message || "Unknown error"}`
        );
      }
    }

    console.log("Upload successful:", uploadData);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    console.log("Public URL generated:", publicUrl);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading media:", error);
    throw error;
  }
}

export async function getAllPillarsForCMS() {
  try {
    const { data, error } = await supabase
      .from("pillars")
      .select("*")
      .order("sort_order");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching pillars:", error);
    throw error;
  }
}

export async function getLessonsForUnit(unitId) {
  try {
    const { data, error } = await supabase
      .from("lessons")
      .select("id, title, description, difficulty, xp_reward, is_active")
      .eq("is_active", true)
      .filter("content", "cs", `{"unit_id":${unitId}}`)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching lessons for unit:", error);
    return [];
  }
}

export async function getLessonById(lessonId) {
  try {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching lesson:", error);
    throw error;
  }
}
