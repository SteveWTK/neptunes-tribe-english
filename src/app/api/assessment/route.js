// app/api/assessment/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  console.log("[Assessment] Starting assessment analysis...");

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");
    const email = formData.get("email");
    const expectedText = formData.get("expectedText");
    const language = formData.get("language") || "en";

    console.log("[Assessment] Received params:", {
      hasAudio: !!audioFile,
      email,
      language,
      audioSize: audioFile?.size,
    });

    if (!audioFile || !email) {
      return NextResponse.json(
        { error: "Audio file and email are required" },
        { status: 400 }
      );
    }

    // Transcribe audio using Whisper
    console.log("[Assessment] Sending to Whisper API...");

    let transcript;
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "en",
        response_format: "json",
      });

      transcript = transcription.text;
      console.log("[Assessment] Transcription received:", transcript);
    } catch (whisperError) {
      console.error("[Assessment] Whisper API error:", whisperError);
      return NextResponse.json(
        { error: "Failed to transcribe audio. Please try again." },
        { status: 500 }
      );
    }

    // Analyze English level
    const analysisPrompt = createAssessmentPrompt(
      transcript,
      expectedText,
      language
    );

    console.log("[Assessment] Getting AI assessment...");

    let feedback;
    try {
      const analysis = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an expert English teacher specializing in CEFR level assessment and environmental English education. You evaluate spoken English for conversation class placement.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const rawResponse = analysis.choices[0].message.content;
      console.log("[Assessment] Raw AI response:", rawResponse);

      // Clean up and parse JSON response
      let cleanedResponse = rawResponse.trim();
      cleanedResponse = cleanedResponse
        .replace(/```json\s*/g, "")
        .replace(/```\s*$/g, "");

      const firstBrace = cleanedResponse.indexOf("{");
      const lastBrace = cleanedResponse.lastIndexOf("}");

      if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
        cleanedResponse = cleanedResponse.substring(firstBrace, lastBrace + 1);
      }

      feedback = JSON.parse(cleanedResponse);
      console.log("[Assessment] Parsed feedback:", feedback);
    } catch (gptError) {
      console.error("[Assessment] GPT analysis error:", gptError);
      // Provide fallback assessment
      feedback = createFallbackAssessment(transcript, expectedText);
    }

    // Validate and normalize feedback
    feedback = validateFeedback(feedback);

    // Store assessment result
    const assessmentRecord = {
      email: email,
      transcript: transcript,
      expected_text: expectedText,
      overall_score: feedback.overall_score,
      pronunciation_score: feedback.pronunciation_score,
      fluency_score: feedback.fluency_score,
      recommended_tier: feedback.recommended_tier,
      feedback: feedback,
      language: language,
      created_at: new Date().toISOString(),
    };

    console.log("[Assessment] Storing in database...");

    // Store in assessments table
    const { error: dbError } = await supabase
      .from("assessments")
      .insert(assessmentRecord);

    if (dbError) {
      console.error("[Assessment] Database error:", dbError);
      // Continue anyway - don't fail assessment due to DB issues
    } else {
      console.log("[Assessment] Successfully stored in database");
    }

    const response = {
      success: true,
      recommendedTier: feedback.recommended_tier,
      scores: {
        overall: feedback.overall_score,
        pronunciation: feedback.pronunciation_score,
        fluency: feedback.fluency_score,
      },
      feedback: {
        strengths: feedback.strengths || [],
        improvements: feedback.improvements || [],
        encouragement: feedback.encouragement || "Keep practicing!",
      },
      transcript: transcript,
    };

    console.log("[Assessment] Returning success response");
    return NextResponse.json(response);
  } catch (error) {
    console.error("[Assessment] Unexpected error:", error);
    return NextResponse.json(
      { error: "Assessment analysis failed", details: error.message },
      { status: 500 }
    );
  }
}

function createAssessmentPrompt(transcript, expectedText, language) {
  const feedbackLanguage = language === "pt" ? "Portuguese" : "English";

  return `
Assess this English speaking sample for conversation class placement in an environmental English learning platform:

Expected text: "${expectedText}"
What they said: "${transcript}"

Analyze their English level considering:
- Pronunciation accuracy and clarity
- Fluency and natural rhythm  
- Grammar and vocabulary usage
- Overall comprehension demonstrated
- Readiness for live conversation classes

Based on this assessment, recommend one of these tiers:
- "explorer": Basic/Pre-intermediate (A2-B1) - should listen to classes first, access learning materials
- "pro": Intermediate+ (B2) - ready for conversation participation with guidance
- "premium": Upper-intermediate/Advanced (B2+-C1) - can lead discussions and help others

Provide feedback in ${feedbackLanguage} and return ONLY valid JSON:

{
  "overall_score": 75,
  "pronunciation_score": 70,
  "fluency_score": 80,
  "recommended_tier": "pro",
  "cefr_level": "B2",
  "strengths": ["Clear pronunciation of environmental vocabulary", "Good pace and rhythm"],
  "improvements": ["Work on connecting ideas smoothly", "Practice complex sentence structures"],
  "encouragement": "Great progress! You're ready for conversation practice with environmental topics.",
  "reasoning": "Student demonstrates solid B2 level skills with good environmental vocabulary comprehension"
}

Be encouraging but accurate. Conservative recommendations ensure better learning experiences.
`;
}

function createFallbackAssessment(transcript, expectedText) {
  console.log("[Assessment] Creating fallback assessment");

  const transcriptWords = transcript
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const expectedWords = expectedText
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0);

  // Calculate coverage
  const coverage = transcriptWords.length / expectedWords.length;

  // Check for key environmental vocabulary
  const envWords = [
    "marine",
    "protected",
    "conservation",
    "biodiversity",
    "ecosystems",
  ];
  const envWordsUsed = envWords.filter((word) =>
    transcript.toLowerCase().includes(word.toLowerCase())
  ).length;

  let tier = "explorer";
  let overallScore = 55;

  // Determine tier based on coverage and vocabulary
  if (coverage > 0.7 && envWordsUsed >= 3) {
    tier = "pro";
    overallScore = 70;
  }
  if (coverage > 0.85 && envWordsUsed >= 4 && transcriptWords.length > 45) {
    tier = "premium";
    overallScore = 82;
  }

  return {
    overall_score: overallScore,
    pronunciation_score: Math.max(50, overallScore - 8),
    fluency_score: Math.min(95, overallScore + 5),
    recommended_tier: tier,
    cefr_level:
      tier === "explorer" ? "A2-B1" : tier === "pro" ? "B2" : "B2+-C1",
    strengths: [
      "Attempted to read the complete text",
      "Demonstrated understanding of environmental topics",
    ],
    improvements: [
      "Continue practicing pronunciation",
      "Work on speaking fluency",
      "Practice environmental vocabulary",
    ],
    encouragement:
      "Keep practicing! Your English is developing well and you're making good progress.",
    reasoning: "Assessment based on speech analysis and vocabulary usage",
  };
}

function validateFeedback(feedback) {
  // Ensure all required fields exist with reasonable defaults
  const validated = {
    overall_score: Math.max(30, Math.min(100, feedback.overall_score || 60)),
    pronunciation_score: Math.max(
      30,
      Math.min(100, feedback.pronunciation_score || 60)
    ),
    fluency_score: Math.max(30, Math.min(100, feedback.fluency_score || 60)),
    recommended_tier: ["explorer", "pro", "premium"].includes(
      feedback.recommended_tier
    )
      ? feedback.recommended_tier
      : "explorer",
    cefr_level: feedback.cefr_level || "A2-B1",
    strengths: Array.isArray(feedback.strengths)
      ? feedback.strengths
      : ["Good effort"],
    improvements: Array.isArray(feedback.improvements)
      ? feedback.improvements
      : ["Keep practicing"],
    encouragement: feedback.encouragement || "Great job! Keep learning!",
    reasoning: feedback.reasoning || "Assessment completed",
  };

  // Ensure tier matches score ranges
  if (
    validated.overall_score < 65 &&
    validated.recommended_tier !== "explorer"
  ) {
    validated.recommended_tier = "explorer";
  } else if (
    validated.overall_score >= 65 &&
    validated.overall_score < 80 &&
    validated.recommended_tier === "premium"
  ) {
    validated.recommended_tier = "pro";
  }

  return validated;
}

// // app/api/assessment/route.js
// import { NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";
// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// export async function POST(request) {
//   console.log("[Assessment] Starting assessment analysis...");

//   try {
//     const formData = await request.formData();
//     const audioFile = formData.get("audio");
//     const email = formData.get("email");
//     const expectedText = formData.get("expectedText");
//     const language = formData.get("language") || "en";

//     if (!audioFile || !email) {
//       return NextResponse.json(
//         { error: "Audio file and email are required" },
//         { status: 400 }
//       );
//     }

//     // Transcribe audio using Whisper
//     const transcription = await openai.audio.transcriptions.create({
//       file: audioFile,
//       model: "whisper-1",
//       language: "en",
//       response_format: "json",
//     });

//     const transcript = transcription.text;
//     console.log("[Assessment] Transcription:", transcript);

//     // Analyze English level
//     const analysisPrompt = createAssessmentPrompt(
//       transcript,
//       expectedText,
//       language
//     );

//     const analysis = await openai.chat.completions.create({
//       model: "gpt-4",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are an expert English teacher specializing in CEFR level assessment and environmental English education. You evaluate spoken English for conversation class placement.",
//         },
//         {
//           role: "user",
//           content: analysisPrompt,
//         },
//       ],
//       temperature: 0.3,
//     });

//     let feedback;
//     try {
//       feedback = JSON.parse(analysis.choices[0].message.content);
//     } catch (parseError) {
//       console.error("Failed to parse AI response:", parseError);
//       // Fallback assessment
//       feedback = createFallbackAssessment(transcript, expectedText);
//     }

//     // Store assessment result
//     const assessmentRecord = {
//       email: email,
//       transcript: transcript,
//       expected_text: expectedText,
//       overall_score: feedback.overall_score,
//       pronunciation_score: feedback.pronunciation_score,
//       fluency_score: feedback.fluency_score,
//       recommended_tier: feedback.recommended_tier,
//       feedback: feedback,
//       language: language,
//       created_at: new Date().toISOString(),
//     };

//     // Store in assessments table
//     const { error: dbError } = await supabase
//       .from("assessments")
//       .insert(assessmentRecord);

//     if (dbError) {
//       console.error("Database error:", dbError);
//       // Continue anyway - don't fail assessment due to DB issues
//     }

//     return NextResponse.json({
//       success: true,
//       recommendedTier: feedback.recommended_tier,
//       scores: {
//         overall: feedback.overall_score,
//         pronunciation: feedback.pronunciation_score,
//         fluency: feedback.fluency_score,
//       },
//       feedback: {
//         strengths: feedback.strengths,
//         improvements: feedback.improvements,
//         encouragement: feedback.encouragement,
//       },
//       transcript: transcript,
//     });
//   } catch (error) {
//     console.error("[Assessment] Error:", error);
//     return NextResponse.json(
//       { error: "Assessment analysis failed" },
//       { status: 500 }
//     );
//   }
// }

// function createAssessmentPrompt(transcript, expectedText, language) {
//   const feedbackLanguage = language === "pt" ? "Portuguese" : "English";

//   return `
// Assess this English speaking sample for conversation class placement:

// Expected text: "${expectedText}"
// What they said: "${transcript}"

// Analyze their English level and provide feedback in ${feedbackLanguage}. Consider:
// - Pronunciation accuracy and clarity
// - Fluency and natural rhythm
// - Grammar and vocabulary usage
// - Overall comprehension demonstrated

// Based on this assessment, recommend one of these tiers:
// - "explorer": Basic/Pre-intermediate (A2-B1) - should listen to classes first
// - "pro": Intermediate+ (B2) - ready for conversation participation
// - "premium": Upper-intermediate/Advanced (B2+-C1) - can lead discussions

// Return your analysis as JSON:
// {
//   "overall_score": 75,
//   "pronunciation_score": 70,
//   "fluency_score": 80,
//   "recommended_tier": "pro",
//   "cefr_level": "B2",
//   "strengths": ["Clear pronunciation", "Good pace"],
//   "improvements": ["Work on 'th' sounds", "Practice word stress"],
//   "encouragement": "Great progress! You're ready for conversation practice.",
//   "reasoning": "Brief explanation of tier recommendation"
// }

// Be encouraging but accurate. Conservative recommendations are better than overly optimistic ones.
// `;
// }

// function createFallbackAssessment(transcript, expectedText) {
//   // Simple fallback based on transcript length and basic analysis
//   const wordCount = transcript.split(" ").length;
//   const expectedWordCount = expectedText.split(" ").length;
//   const coverage = wordCount / expectedWordCount;

//   let tier = "explorer";
//   let overallScore = 60;

//   if (coverage > 0.8 && wordCount > 40) {
//     tier = "pro";
//     overallScore = 75;
//   }
//   if (coverage > 0.9 && wordCount > 50) {
//     tier = "premium";
//     overallScore = 85;
//   }

//   return {
//     overall_score: overallScore,
//     pronunciation_score: overallScore - 5,
//     fluency_score: overallScore + 5,
//     recommended_tier: tier,
//     cefr_level:
//       tier === "explorer" ? "A2-B1" : tier === "pro" ? "B2" : "B2+-C1",
//     strengths: [
//       "Good effort at reading the complete text",
//       "Demonstrated understanding",
//     ],
//     improvements: [
//       "Continue practicing pronunciation",
//       "Work on speaking fluency",
//     ],
//     encouragement: "Keep practicing! Your English is developing well.",
//     reasoning: "Assessment based on speech analysis",
//   };
// }
