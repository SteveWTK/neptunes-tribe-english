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
    const { data, error} = await supabase
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

// ============================================================================
// LEVEL-BASED FILTERING FUNCTIONS
// ============================================================================

/**
 * Get lessons filtered by user's level and type
 * Supports "All Levels" filter for individual users via localStorage
 *
 * @param {string} userId - User ID to get level/type from
 * @param {string} worldId - World ID (e.g., "south_america")
 * @param {string} adventureId - Adventure theme tag (e.g., "amazon_adventure")
 * @returns {Promise<Array>} Filtered lessons matching user's level and type
 */
export async function getLessonsForUser(userId, worldId, adventureId) {
  try {
    console.log("🔍 getLessonsForUser called with:", { userId, worldId, adventureId });

    // Get user's current level and type
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("current_level, user_type, id, email")
      .eq("id", userId)
      .single();

    console.log("👤 User data query result:", { userData, userError });

    if (userError) {
      console.error("❌ Error fetching user data:", userError);
      console.log("⚠️ Falling back to Level 1/individual defaults");
      // Default to Level 1/individual if user fetch fails
      return getLessonsByLevelAndType("Level 1", "individual", worldId, adventureId);
    }

    const userLevel = userData?.current_level || "Level 1";
    const userType = userData?.user_type || "individual";

    // Check if user's database level is set to "All Levels" (admin testing)
    if (userLevel === "All Levels") {
      console.log("🌍 User level is 'All Levels' - fetching all lessons");
      return getLessonsAllLevels(userType, worldId, adventureId);
    }

    // Check localStorage for level filter (individual users only)
    let effectiveLevel = userLevel;
    if (userType === "individual" && typeof window !== 'undefined') {
      const levelFilter = localStorage.getItem("level_filter");
      if (levelFilter === "all") {
        // Return lessons from all levels
        console.log("🌍 localStorage filter is 'all' - fetching all lessons");
        return getLessonsAllLevels(userType, worldId, adventureId);
      } else if (levelFilter && levelFilter !== userLevel) {
        // User has selected a specific level filter
        effectiveLevel = levelFilter;
      }
    }

    console.log("✅ User level data:", { userLevel, userType, effectiveLevel });

    return getLessonsByLevelAndType(effectiveLevel, userType, worldId, adventureId);
  } catch (error) {
    console.error("❌ Error in getLessonsForUser:", error);
    return [];
  }
}

/**
 * Get lessons from all levels (for individual users viewing "All Levels")
 *
 * @param {string} userType - User type ("school" or "individual")
 * @param {string} worldId - World ID
 * @param {string} adventureId - Adventure theme tag
 * @returns {Promise<Array>} Lessons from all levels
 */
export async function getLessonsAllLevels(userType, worldId, adventureId) {
  try {
    const targetAudience = userType === "school" ? "schools" : "users";

    console.log("🌍 getLessonsAllLevels filters:", {
      userType,
      targetAudience,
      worldId,
      adventureId
    });

    // Build the query - no difficulty filter
    let query = supabase
      .from("lessons")
      .select("*")
      .eq("is_active", true)
      .order("difficulty", { ascending: true }) // Order by level first
      .order("sort_order", { ascending: true }); // Then by sort order

    // Filter by world if provided
    if (worldId) {
      query = query.eq("world", worldId);
    }

    // Filter by adventure (theme_tags) if provided
    if (adventureId) {
      query = query.contains("theme_tags", [adventureId]);
    }

    // Filter by target audience
    query = query.in("target_audience", [targetAudience, "both"]);

    const { data, error } = await query;

    console.log("📚 All levels lessons query result:", {
      count: data?.length || 0,
      error: error?.message
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Error in getLessonsAllLevels:", error);
    return [];
  }
}

/**
 * Get lessons by level and user type (internal helper)
 *
 * @param {string} level - Difficulty level (e.g., "Beginner", "Intermediate")
 * @param {string} userType - User type ("school" or "individual")
 * @param {string} worldId - World ID
 * @param {string} adventureId - Adventure theme tag
 * @returns {Promise<Array>} Filtered lessons
 */
export async function getLessonsByLevelAndType(level, userType, worldId, adventureId) {
  try {
    // Map user_type to target_audience values
    // school users see: "schools" and "both"
    // individual users see: "users" and "both"
    const targetAudience = userType === "school" ? "schools" : "users";

    console.log("🔎 getLessonsByLevelAndType filters:", {
      level,
      userType,
      targetAudience,
      worldId,
      adventureId
    });

    // Build the query
    let query = supabase
      .from("lessons")
      .select("*")
      .eq("difficulty", level) // Match user's level
      .eq("is_active", true) // Only active lessons
      .order("sort_order", { ascending: true });

    // Filter by world if provided
    if (worldId) {
      query = query.eq("world", worldId);
    }

    // Filter by adventure (theme_tags) if provided
    if (adventureId) {
      query = query.contains("theme_tags", [adventureId]);
    }

    // Filter by target audience: show lessons for user's type OR "both"
    query = query.in("target_audience", [targetAudience, "both"]);

    const { data, error } = await query;

    console.log("📚 Lessons query result:", {
      count: data?.length || 0,
      error: error?.message,
      samples: data?.slice(0, 2).map(l => ({
        id: l.id,
        title: l.title,
        difficulty: l.difficulty,
        target_audience: l.target_audience
      }))
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Error in getLessonsByLevelAndType:", error);
    return [];
  }
}

/**
 * Get count of lessons for a specific adventure at user's level
 *
 * @param {string} userId - User ID
 * @param {string} worldId - World ID
 * @param {string} adventureId - Adventure theme tag
 * @returns {Promise<number>} Count of available lessons
 */
export async function getLessonCountForUser(userId, worldId, adventureId) {
  try {
    const lessons = await getLessonsForUser(userId, worldId, adventureId);
    return lessons.length;
  } catch (error) {
    console.error("Error getting lesson count:", error);
    return 0;
  }
}

/**
 * Check if an adventure has lessons for user's level
 *
 * @param {string} userId - User ID
 * @param {string} worldId - World ID
 * @param {string} adventureId - Adventure theme tag
 * @returns {Promise<boolean>} True if adventure has lessons for user
 */
export async function adventureHasLessonsForUser(userId, worldId, adventureId) {
  try {
    const count = await getLessonCountForUser(userId, worldId, adventureId);
    return count > 0;
  } catch (error) {
    console.error("Error checking adventure lessons:", error);
    return false;
  }
}

/**
 * Get all adventures in a world that have lessons for user
 * Filters by BOTH user level AND lesson availability
 * Supports "All Levels" view for individual users
 *
 * @param {string} userId - User ID
 * @param {string} worldId - World ID
 * @param {Array} adventures - Array of adventure objects from worldsConfig
 * @returns {Promise<Array>} Filtered adventures with lesson counts
 */
export async function getAvailableAdventures(userId, worldId, adventures) {
  try {
    // Get user's current level and type
    const { data: userData } = await supabase
      .from("users")
      .select("current_level, user_type")
      .eq("id", userId)
      .single();

    const userLevel = userData?.current_level || "Level 1";
    const userType = userData?.user_type || "individual";

    // Check if user is viewing all levels
    let viewingAllLevels = false;

    // Check database level for "All Levels" (admin testing)
    if (userLevel === "All Levels") {
      viewingAllLevels = true;
    } else if (userType === "individual" && typeof window !== 'undefined') {
      // Check localStorage for individual users
      const levelFilter = localStorage.getItem("level_filter");
      viewingAllLevels = (levelFilter === "all" || levelFilter === null);
    }

    console.log("🎮 Filtering adventures:", { userLevel, userType, viewingAllLevels });

    // Filter adventures by user's level (unless viewing all levels)
    let levelFilteredAdventures = adventures;

    if (!viewingAllLevels) {
      levelFilteredAdventures = adventures.filter((adventure) => {
        // If adventure has no levels property, show it for all levels (backward compatible)
        if (!adventure.levels || adventure.levels.length === 0) {
          return true;
        }
        // Otherwise, check if user's level is in the adventure's levels array
        return adventure.levels.includes(userLevel);
      });
    }

    console.log(
      `📊 Filtered ${levelFilteredAdventures.length}/${adventures.length} adventures for ${viewingAllLevels ? 'All Levels' : userLevel}`
    );

    const adventuresWithLessons = await Promise.all(
      levelFilteredAdventures.map(async (adventure) => {
        const lessonCount = await getLessonCountForUser(
          userId,
          worldId,
          adventure.id
        );

        return {
          ...adventure,
          lessonCount,
          hasLessons: lessonCount > 0,
        };
      })
    );

    // Return adventures filtered by level with lesson count info
    return adventuresWithLessons;
  } catch (error) {
    console.error("Error getting available adventures:", error);
    return adventures.map((adv) => ({ ...adv, lessonCount: 0, hasLessons: false }));
  }
}

/**
 * Update user's current level
 *
 * @param {string} userId - User ID
 * @param {string} newLevel - New difficulty level (must match LEVELS.value)
 * @returns {Promise<boolean>} Success status
 */
export async function updateUserLevel(userId, newLevel) {
  try {
    const { error } = await supabase
      .from("users")
      .update({ current_level: newLevel })
      .eq("id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating user level:", error);
    return false;
  }
}

/**
 * Update user's type (school vs individual)
 *
 * @param {string} userId - User ID
 * @param {string} newType - New user type ("school" or "individual")
 * @returns {Promise<boolean>} Success status
 */
export async function updateUserType(userId, newType) {
  try {
    const { error } = await supabase
      .from("users")
      .update({ user_type: newType })
      .eq("id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating user type:", error);
    return false;
  }
}
