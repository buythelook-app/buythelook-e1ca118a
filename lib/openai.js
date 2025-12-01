// OpenAI API Helper
export async function callOpenAI({ model, messages, responseFormat = "json_object", temperature = 0.7 }) {
  console.log(" OpenAI: Starting API call")
  console.log(" OpenAI: Model:", model)

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error(
      "OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables. Get your key from https://platform.openai.com/api-keys",
    )
  }

  console.log(" OpenAI: Temperature:", temperature)
  console.log(" OpenAI: Response format:", responseFormat)
  console.log(" OpenAI: Messages count:", messages.length)

  console.log(" OpenAI: API key validated successfully")

  const MAX_RETRIES = 3
  let lastError = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(` OpenAI: Sending request (Attempt ${attempt}/${MAX_RETRIES})...`)

      const requestBody = {
        model,
        messages,
        response_format: responseFormat ? { type: responseFormat } : undefined,
        temperature,
        max_tokens: 4000,
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 90000)

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log(" OpenAI: Response status:", response.status)
      console.log(" OpenAI: Response ok:", response.ok)

      if (!response.ok) {
        const error = await response.json()
        console.error(" OpenAI: API Error:", JSON.stringify(error, null, 2))

        if (response.status === 401) {
          throw new Error("Invalid OpenAI API key")
        }

        if (response.status >= 500) {
          throw new Error(`OpenAI Server Error: ${response.status}`)
        }

        throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`)
      }

      const data = await response.json()
      console.log(" OpenAI: Response received successfully")
      console.log(" OpenAI: Choices count:", data.choices?.length)
      console.log(" OpenAI: Content length:", data.choices?.[0]?.message?.content?.length)
      console.log(" OpenAI: Usage:", JSON.stringify(data.usage, null, 2))

      const content = data.choices[0].message.content
      console.log(" OpenAI: Returning content")

      return content
    } catch (error) {
      console.error(` OpenAI: Attempt ${attempt} failed:`, error.message)
      lastError = error

      if (error.message.includes("Invalid OpenAI API key")) {
        throw error
      }

      if (attempt < MAX_RETRIES) {
        const delay = attempt * 2000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  console.error(" OpenAI: All attempts failed")
  throw lastError
}
