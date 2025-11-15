import type {
  Category,
  Color,
  Product,
  ProductVariant,
} from '@/lib/types/database'

export type CatalogProduct = Product & {
  product_variants?: ProductVariant[]
  categories?: Category | null
}

export type CatalogCategory = Category

export type CatalogColor = Color


