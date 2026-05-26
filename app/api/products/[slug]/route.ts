import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id, slug, name_vi, name_en)')
    .eq('slug', params.slug)
    .eq('active', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({ product: data })
}
