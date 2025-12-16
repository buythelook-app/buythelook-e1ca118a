import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // NOT anon key
)

export async function POST(req) {
  try {
    const body = await req.json()
    const records = body.records || body // Bright Data format varies
    
    if (!records || records.length === 0) {
      return Response.json({ error: 'No records' }, { status: 400 })
    }

    // Transform Bright Data format to your DB format
    const products = records.map(item => ({
      product_id: item.product_id || item.id,
      name: item.name || item.title,
      brand: item.brand || 'ZARA',
      price: parseFloat(item.price) || null,
      currency: item.currency || 'USD',
      final_price: parseFloat(item.final_price || item.price) || null,
      availability: item.availability || item.stock_status,
      sizes: item.sizes || item.available_sizes || [],
      colors: item.colors || item.available_colors || [],
      description: item.description,
      category: item.category,
      url: item.url || item.product_url,
      images: item.images || item.image_urls || [],
      updated_at: new Date().toISOString()
    }))

    // Upsert in batches (max 1000 per batch for Supabase)
    const batchSize = 1000
    let inserted = 0
    let updated = 0

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('zara_products')
        .upsert(batch, { 
          onConflict: 'product_id',
          ignoreDuplicates: false 
        })
      
      if (error) {
        console.error('Upsert error:', error)
        return Response.json({ 
          error: error.message,
          batch: i 
        }, { status: 500 })
      }
      
      inserted += batch.length
    }

    console.log(`✅ Synced ${products.length} products`)

    return Response.json({ 
      success: true,
      records_received: records.length,
      records_synced: products.length
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json({ 
      error: error.message 
    }, { status: 500 })
  }
}