export type Category = {
  id: string
  slug: string
  type: 'clothing' | 'shoes'
  parent_id: string | null
  name_el: string
  name_en: string
  description_el: string | null
  description_en: string | null
  created_at: string
  updated_at: string
}

export type Color = {
  id: string
  name_el: string
  name_en: string
  hex_value: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  sku: string
  category_id: string | null
  price: number
  is_active: boolean
  status: 'active' | 'archived' | 'sold_out'
  archived_at: string | null
  sizes: string[]
  colors: string[]
  images: string[]
  name_el: string
  name_en: string
  description_el: string | null
  description_en: string | null
  created_at: string
  updated_at: string
}

export type ProductVariant = {
  id: string
  product_id: string
  size: string
  color: string
  stock: number
  sold_count: number
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  user_id: string | null
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  total: number
  discount_amount: number
  discount_code_id: string | null
  viva_order_code: string | null
  viva_transaction_id: string | null
  shipping_address: {
    name: string
    address: string
    city: string
    postal_code: string
    region?: string
    country: string
    phone: string
    delivery_method?: 'boxnow' | 'home'
  }
  boxnow_locker_id: string | null
  boxnow_tracking_code: string | null
  customer_email: string
  customer_name: string
  customer_phone: string | null
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  quantity: number
  price: number
  size: string | null
  color: string | null
  product_name: string
  created_at: string
}

export type GalleryItem = {
  id: string
  category: 'baptism' | 'decoration'
  image: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type AdminUser = {
  id: string
  user_id: string
  role: 'admin' | 'super_admin'
  permissions: string[]
  onesignal_player_id: string[] | string | null // JSONB array of Player IDs (one per device), or legacy single string
  created_at: string
  updated_at: string
}

export type DiscountCode = {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  starts_at: string | null
  expires_at: string | null
  is_active: boolean
  can_combine_with_productdiscount: boolean
  can_combine_with_codediscount: boolean
  usage_count: number
  max_uses: number | null
  created_at: string
  updated_at: string
}

export type ProductDiscount = {
  id: string
  product_id: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  can_combine_with_codediscount: boolean
  created_at: string
  updated_at: string
}

export type OrderDiscount = {
  id: string
  order_id: string
  discount_code_id: string | null
  product_discount_id: string | null
  discount_amount: number
  created_at: string
}

