import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log(" Image Analysis: Starting image analysis")

  try {
    const formData = await request.formData()
    const imageFile = formData.get("image")

    console.log(" Image Analysis: Image file received:", !!imageFile)

    if (!imageFile) {
      console.error(" Image Analysis: No image provided")
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    console.log(" Image Analysis: Image type:", (imageFile as File).type)
    console.log(" Image Analysis: Image size:", (imageFile as File).size, "bytes")

    // Convert file to base64
    console.log(" Image Analysis: Converting image to base64...")
    const bytes = await (imageFile as File).arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = `data:${(imageFile as File).type};base64,${buffer.toString("base64")}`

    console.log(" Image Analysis: Base64 conversion complete, length:", base64Image.length)

    const prompt = `You are a professional fashion stylist analyzing body proportions.

Analyze this photo and determine:

1. BODY SHAPE (choose ONE):
   - hourglass: Balanced shoulders and hips, defined waist
   - pear: Narrow shoulders, wider hips
   - apple: Broader shoulders and bust, less defined waist
   - rectangle: Shoulders, waist, and hips similar width
   - athletic: Broad shoulders, muscular build

2. HEIGHT CATEGORY:
   - petite: Appears shorter proportionally
   - average: Medium height proportions
   - tall: Appears taller proportionally

3. CONFIDENCE (0-100):
   How confident are you in this analysis?

4. RECOMMENDATIONS:
   3 specific fit recommendations based on body shape

RULES:
- Be body-positive and respectful
- Focus on proportions, not weight
- If photo quality is poor, set confidence below 50

Return ONLY valid JSON:
{
  "bodyShape": "hourglass",
  "bodyShapeConfidence": 85,
  "heightCategory": "average",
  "heightConfidence": 70,
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2", 
    "Recommendation 3"
  ],
  "overallConfidence": 75
}`

    console.log(" Image Analysis: Sending request to OpenAI Vision API...")

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: base64Image } },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      }),
    })

    console.log(" Image Analysis: OpenAI response status:", response.status)

    if (!response.ok) {
      const error = await response.json()
      console.error(" Image Analysis: OpenAI error:", JSON.stringify(error, null, 2))
      throw new Error(error.error?.message || "OpenAI API error")
    }

    const data = await response.json()
    console.log(" Image Analysis: OpenAI response received")
    console.log(" Image Analysis: Usage:", JSON.stringify(data.usage, null, 2))

    const analysis = JSON.parse(data.choices[0].message.content)
    console.log(" Image Analysis: Analysis result:", JSON.stringify(analysis, null, 2))

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error: any) {
    console.error(" Image Analysis: Error occurred:", error)
    console.error(" Image Analysis: Error stack:", error.stack)
    return NextResponse.json({ error: "Image analysis failed", details: error.message }, { status: 500 })
  }
}
