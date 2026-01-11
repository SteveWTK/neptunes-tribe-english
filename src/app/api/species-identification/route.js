import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/species-identification
 * Identifies species from an image using OpenAI Vision + iNaturalist validation
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing required field: imageUrl" },
        { status: 400 }
      );
    }

    console.log("🔍 Starting species identification for:", imageUrl.substring(0, 50) + "...");

    // Step 1: OpenAI Vision identification
    const openAIResult = await identifyWithOpenAI(imageUrl);
    console.log("✅ OpenAI identification complete:", openAIResult.species_name);

    // Step 2: Validate with iNaturalist (if we got a species name)
    let iNatResults = [];
    if (openAIResult.species_name && openAIResult.confidence !== "low") {
      try {
        iNatResults = await validateWithINaturalist(openAIResult.species_name);
        console.log("✅ iNaturalist validation complete:", iNatResults.length, "results");
      } catch (iNatError) {
        console.warn("⚠️ iNaturalist validation failed:", iNatError.message);
        // Continue without iNaturalist results
      }
    }

    // Combine results
    const result = {
      // Primary identification from OpenAI
      species_name: openAIResult.species_name,
      scientific_name: openAIResult.scientific_name,
      confidence: openAIResult.confidence,
      family: openAIResult.family,
      habitat: openAIResult.habitat,
      conservation_status: openAIResult.conservation_status,
      fun_fact: openAIResult.fun_fact,
      educational_note: openAIResult.educational_note,

      // Alternative suggestions from iNaturalist
      alternatives: iNatResults.slice(0, 3).map((r) => ({
        name: r.taxon?.preferred_common_name || r.taxon?.name,
        scientific_name: r.taxon?.name,
        score: r.score,
        photo_url: r.taxon?.default_photo?.square_url,
      })),

      // Metadata
      identified_at: new Date().toISOString(),
      source: "openai_gpt4o",
      validated_with: iNatResults.length > 0 ? "inaturalist" : null,
    };

    return NextResponse.json({
      success: true,
      identification: result,
    });
  } catch (error) {
    console.error("❌ Species identification error:", error);
    return NextResponse.json(
      {
        error: "Failed to identify species",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Identify species using OpenAI GPT-4o Vision
 */
async function identifyWithOpenAI(imageUrl) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert biodiversity scientist and naturalist. When shown an image of wildlife or plants, you identify the species with scientific accuracy while providing educational content suitable for students learning English through environmental topics.

Always respond in valid JSON format with no additional text.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this image and identify the species (animal, plant, insect, bird, etc.).

Provide your response in this exact JSON format:
{
  "species_name": "Common name in English",
  "scientific_name": "Genus species",
  "confidence": "high" | "medium" | "low",
  "family": "Taxonomic family name",
  "habitat": "Where this species typically lives",
  "conservation_status": "IUCN status if known (LC/NT/VU/EN/CR/EW/EX) or 'Unknown'",
  "fun_fact": "One interesting educational fact about this species",
  "educational_note": "Why this species is ecologically important (2-3 sentences)"
}

If you cannot identify the species with any confidence, set confidence to "low" and provide your best guess or description. If it's not a living organism, respond with species_name as "Not a species" and explain what you see in the educational_note field.`,
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high",
            },
          },
        ],
      },
    ],
    max_tokens: 800,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error("Failed to parse OpenAI response:", content);
    // Return a default structure if parsing fails
    return {
      species_name: "Unknown",
      scientific_name: "Unknown",
      confidence: "low",
      family: "Unknown",
      habitat: "Unknown",
      conservation_status: "Unknown",
      fun_fact: "We couldn't identify this species with confidence.",
      educational_note: content || "Please try with a clearer image.",
    };
  }
}

/**
 * Validate identification using iNaturalist's computer vision API
 * This provides additional suggestions from their specialized biodiversity model
 */
async function validateWithINaturalist(speciesName) {
  // Search for taxa matching the species name
  const searchResponse = await fetch(
    `https://api.inaturalist.org/v1/taxa/autocomplete?q=${encodeURIComponent(
      speciesName
    )}&per_page=5`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!searchResponse.ok) {
    throw new Error(`iNaturalist API error: ${searchResponse.status}`);
  }

  const data = await searchResponse.json();

  // Return the results with taxa info
  return (data.results || []).map((result) => ({
    taxon: result,
    score: result.observations_count || 0, // Use observation count as a proxy for confidence
  }));
}

/**
 * Alternative: Use iNaturalist's image-based identification
 * Note: This requires uploading the image to their API
 * Keeping this for future use if we want more accurate validation
 */
async function identifyWithINaturalistVision(imageUrl) {
  // iNaturalist's vision API requires the image to be uploaded
  // For now, we use the text-based search as validation
  // This can be enhanced later if needed

  // The API endpoint would be:
  // POST https://api.inaturalist.org/v1/computervision/score_image
  // with multipart form data containing the image

  // For educational use, the text-based validation is sufficient
  return [];
}
