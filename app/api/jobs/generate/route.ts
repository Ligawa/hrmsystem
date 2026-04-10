import { streamText } from 'ai'
import { xai } from '@ai-sdk/xai'
import type { NextRequest } from 'next/server'

interface GenerateJobRequest {
  title: string
  level: string
  location: string
  department?: string
}

export async function POST(request: NextRequest) {
  try {
    const { title, level, location, department }: GenerateJobRequest = await request.json()

    if (!title || !level || !location) {
      return new Response('Title, level, and location are required', { status: 400 })
    }

    const prompt = `You are an expert HR professional at World Vision International (WVI), a global humanitarian organization focused on protecting vulnerable children and fighting poverty.

Generate comprehensive job details for the following position:
- Job Title: ${title}
- Level: ${level}
- Location: ${location}
${department ? `- Department: ${department}` : ''}

Please generate ONLY valid JSON (no markdown code blocks, just raw JSON) with the following structure:
{
  "description": "A compelling 2-3 paragraph description of the role, emphasizing its impact on vulnerable children and communities. Focus on WVI's mission of protecting children and fighting poverty.",
  "requirements": ["requirement 1", "requirement 2", ...],
  "responsibilities": ["responsibility 1", "responsibility 2", ...],
  "benefits": ["benefit 1", "benefit 2", ...]
}

Make sure:
- The description aligns with WVI's humanitarian mission
- Requirements are realistic for the job level
- Responsibilities are specific and measurable
- Benefits are appropriate for an international NGO
- All text emphasizes impact on vulnerable populations`

    const result = streamText({
      model: xai('grok-4', {
        apiKey: process.env.XAI_API_KEY,
      }),
      prompt: prompt,
      system: 'You are a helpful HR assistant for World Vision International. Generate only valid JSON responses without any markdown formatting.',
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('[v0] Error generating job details:', error)
    return new Response('Failed to generate job details', { status: 500 })
  }
}
