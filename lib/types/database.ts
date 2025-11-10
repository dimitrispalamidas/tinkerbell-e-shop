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
  created_at: string
  updated_at: string
}

