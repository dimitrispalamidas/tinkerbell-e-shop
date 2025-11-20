"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: {
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
}) {
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

  // Calculate total stock
  const totalStock = formData.variants.reduce((sum, v) => sum + v.stock, 0)
  const productStatus = totalStock > 0 ? 'active' : 'sold_out'

  // Create product
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
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
    .select()
    .single()

  if (productError) throw productError

  // Create variants if any
  if (formData.variants.length > 0 && product) {
    const uniqueVariants = formData.variants.reduce((acc: typeof formData.variants, curr) => {
      const exists = acc.some(v => v.size === curr.size && v.color === curr.color)
      if (!exists) acc.push(curr)
      return acc
    }, [])

    const variantData = uniqueVariants.map(v => ({
      product_id: product.id,
      size: v.size,
      color: v.color,
      stock: v.stock,
    }))

    const { error: variantError } = await supabase
      .from('product_variants')
      .insert(variantData)

    if (variantError) throw variantError
  }

  // ✅ Cache invalidation - admin sees changes immediately
  revalidatePath('/shop')
  revalidatePath('/')
  revalidatePath('/api/catalog/products')
  if (product.category_id) {
    revalidatePath(`/shop?category=${product.category_id}`)
  }
  revalidatePath(`/product/${product.id}`)

  return { product, success: true }
}

