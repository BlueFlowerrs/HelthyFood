import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const {
    name_vi,
    name_en,
    calories,
    protein,
    carbs,
    fat,
    nutrition_tags,
    category,
  } = await req.json()

  const prompt = `You are a professional copywriter for a premium fitness nutrition e-commerce store in Vietnam.

Product: ${name_vi || name_en}
${category ? `Category: ${category}` : ''}
Nutrition: ${calories || 0} cal, ${protein || 0}g protein, ${carbs || 0}g carbs, ${fat || 0}g fat
${nutrition_tags?.length ? `Tags: ${nutrition_tags.join(', ')}` : ''}

Write compelling product descriptions in both Vietnamese and English.
Return ONLY valid JSON:
{
  "short_vi": "1-sentence tagline in Vietnamese (max 80 chars)",
  "short_en": "1-sentence tagline in English (max 80 chars)",
  "desc_vi": "Full description in Vietnamese (2-3 paragraphs)",
  "desc_en": "Full description in English (2-3 paragraphs)"
}`

  const res = await fetch(
    `${process.env.OPENAI_BASE_URL || 'https://opencode.ai/v1'}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V4-Flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1024,
      }),
    }
  )

  const data = await res.json()
  let text = data?.choices?.[0]?.message?.content?.trim() ?? ''
  if (text.startsWith('```')) text = text.replace(/```json?\n?/g, '').replace(/```\n?/g, '')

  try {
    const result = JSON.parse(text)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 })
  }
}
