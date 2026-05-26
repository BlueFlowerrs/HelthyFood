import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const supabase = createClient()
  const { searchParams } = new URL(req.url)

  let query = supabase
    .from('products')
    .select('*, category:categories(id, slug, name_vi, name_en)')
    .eq('active', true)

  const category = searchParams.get('category')
  if (category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  const search = searchParams.get('search')
  if (search) {
    query = query.or(`name_vi.ilike.%${search}%,name_en.ilike.%${search}%`)
  }

  const featured = searchParams.get('featured')
  if (featured === 'true') query = query.eq('featured', true)

  const sort = searchParams.get('sort') || 'newest'
  if (sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const limit = parseInt(searchParams.get('limit') ?? '20')
  query = query.limit(limit)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ products: data ?? [] })
}
