"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function updateProduct(
  productId: string,
  formData: {
    sku: string
    name_el: string
    name_en: string
    description_el?: string | null
    description_en?: string | null
    price: string
    category_id?: string | null
    sizes?: string
    colors?: string[]
    is_active: boolean
    images: string[]
    variants: Array<{
      size: string
      color: string
      stock: number
    }>
  }
) {
  const supabase = await createClient()

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: adminRecord } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRecord) {
    throw new Error('Forbidden')
  }

  // Get old product to check category changes
  const { data: oldProduct } = await supabase
    .from('products')
    .select('category_id')
    .eq('id', productId)
    .single()

  // Calculate total stock
  const totalStock = formData.variants.reduce((sum, v) => sum + v.stock, 0)
  const productStatus = totalStock > 0 ? 'active' : 'sold_out'

  // Update product
  const { error: productError } = await supabase
    .from('products')
    .update({
      sku: formData.sku,
      name_el: formData.name_el,
      name_en: formData.name_en,
      description_el: formData.description_el || null,
      description_en: formData.description_en || null,
      price: parseFloat(formData.price.replace(',', '.')),
      category_id: formData.category_id || null,
      sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()) : [],
      colors: formData.colors || [],
      is_active: formData.is_active && totalStock > 0,
      status: productStatus,
      images: formData.images,
    })
    .eq('id', productId)

  if (productError) throw productError

  // Get existing variants with sold_count to preserve it
  const { data: existingVariants } = await supabase
    .from('product_variants')
    .select('size, color, sold_count')
    .eq('product_id', productId)

  // Create a map of existing variants by size+color for quick lookup
  const existingVariantsMap = new Map<string, number>()
  existingVariants?.forEach(v => {
    const key = `${v.size}|${v.color}`
    existingVariantsMap.set(key, v.sold_count || 0)
  })

  // Update variants: Delete all existing and insert new ones
  const { error: deleteError } = await supabase
    .from('product_variants')
    .delete()
    .eq('product_id', productId)

  if (deleteError) throw deleteError

  // Insert new variants with preserved sold_count
  if (formData.variants.length > 0) {
    const uniqueVariants = formData.variants.reduce((acc: typeof formData.variants, curr) => {
      const exists = acc.some(v => v.size === curr.size && v.color === curr.color)
      if (!exists) acc.push(curr)
      return acc
    }, [])

    const variantData = uniqueVariants.map(v => {
      const key = `${v.size}|${v.color}`
      const preservedSoldCount = existingVariantsMap.get(key) || 0
      
      return {
        product_id: productId,
        size: v.size,
        color: v.color,
        stock: v.stock,
        sold_count: preservedSoldCount, // Preserve sold_count from existing variant
      }
    })

    const { error: variantError } = await supabase
      .from('product_variants')
      .insert(variantData)

    if (variantError) throw variantError
  }

  // ✅ Cache invalidation - admin sees changes immediately
  // Clear all relevant caches so changes appear instantly
  revalidateTag('catalog-products', 'page')
  revalidateTag(`product-${productId}`, 'page')
  revalidatePath('/shop', 'page')
  revalidatePath('/', 'page')
  revalidatePath('/api/catalog/products')
  revalidatePath('/api/admin/products')
  
  // Revalidate old category if changed
  if (oldProduct?.category_id) {
    revalidatePath(`/shop?category=${oldProduct.category_id}`, 'page')
  }
  
  // Revalidate new category
  if (formData.category_id) {
    revalidatePath(`/shop?category=${formData.category_id}`, 'page')
  }
  
  revalidatePath(`/product/${productId}`, 'page')

  return { success: true }
}

