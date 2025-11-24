import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const requireAdmin = async () => {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: adminRecord, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (adminError || !adminRecord) {
    return { errorResponse: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { supabase }
}

export async function GET(request: Request) {
  const { supabase, errorResponse } = await requireAdmin()
  if (!supabase) {
    return errorResponse!
  }

  try {
    const { searchParams } = new URL(request.url)
    const timePeriod = searchParams.get('period') || 'month'

    // Calculate date range
    const now = new Date()
    let startDate = new Date(now)

    switch (timePeriod) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setDate(now.getDate() - 30)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        startDate = new Date('2020-01-01')
        break
    }

    const startDateISO = startDate.toISOString()

    // Get all paid orders in period for conversion rate calculation
    const { data: allOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total, created_at, order_discounts(id)')
      .eq('payment_status', 'paid')
      .gte('created_at', startDateISO)

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
    }

    // Calculate conversion metrics
    const totalOrders = allOrders?.length || 0
    const ordersWithDiscounts = allOrders?.filter(order => 
      order.order_discounts && order.order_discounts.length > 0
    ).length || 0
    const conversionRate = totalOrders > 0 ? (ordersWithDiscounts / totalOrders) * 100 : 0

    // Get product discounts analytics
    const { data: productDiscountsData, error: productDiscountsError } = await supabase
      .from('order_discounts')
      .select(`
        product_discount_id,
        discount_amount,
        created_at,
        product_discounts (
          id,
          discount_type,
          discount_value,
          is_active,
          products (
            id,
            name_el,
            name_en,
            sku
          )
        )
      `)
      .not('product_discount_id', 'is', null)
      .gte('created_at', startDateISO)
      .order('created_at', { ascending: false })

    if (productDiscountsError) {
      console.error('Error fetching product discounts:', productDiscountsError)
    }

    // Get discount codes analytics
    const { data: discountCodesData, error: discountCodesError } = await supabase
      .from('order_discounts')
      .select(`
        discount_code_id,
        discount_amount,
        created_at,
        discount_codes (
          id,
          code,
          discount_type,
          discount_value,
          is_active,
          usage_count
        )
      `)
      .not('discount_code_id', 'is', null)
      .gte('created_at', startDateISO)
      .order('created_at', { ascending: false })

    if (discountCodesError) {
      console.error('Error fetching discount codes:', discountCodesError)
    }

    // Get orders with discounts to calculate revenue per discount
    const { data: ordersWithDiscountDetails } = await supabase
      .from('orders')
      .select(`
        id,
        total,
        shipping_address,
        boxnow_locker_id,
        order_items (
          price,
          quantity
        ),
        order_discounts (
          id,
          product_discount_id,
          discount_code_id,
          discount_amount
        )
      `)
      .eq('payment_status', 'paid')
      .gte('created_at', startDateISO)

    const HOME_DELIVERY_COST = 3.50

    // Create maps for revenue before and after discount
    // Each discount counts the FULL revenue from orders that used it
    // Revenue After = Subtotal - This Discount's Amount (not all discounts)
    // IMPORTANT: Each order should count only once per discount ID, even if multiple items use the same discount
    const discountRevenueBeforeMap = new Map<string, number>() // Subtotal without discounts
    const discountRevenueAfterMap = new Map<string, number>()  // Subtotal after THIS discount only
    const processedOrdersPerDiscount = new Map<string, Set<string>>() // Track which orders we've processed for each discount
    
    ordersWithDiscountDetails?.forEach((order: any) => {
      if (!order.order_discounts || order.order_discounts.length === 0) return
      
      // Calculate subtotal without discounts (original prices)
      const orderItems = order.order_items || []
      const subtotalWithoutDiscounts = orderItems.reduce(
        (sum: number, item: any) => sum + (Number(item.price || 0) * Number(item.quantity || 0)),
        0
      )
      
      // If we don't have order_items, skip this order (can't calculate revenue)
      if (subtotalWithoutDiscounts === 0) return
      
      // Track unique discount IDs in this order to avoid double counting
      const uniqueProductDiscounts = new Set<string>()
      const uniqueCodeDiscounts = new Set<string>()
      
      // Collect unique discount IDs and their amounts from this order
      const productDiscountAmounts = new Map<string, number>()
      const codeDiscountAmounts = new Map<string, number>()
      
      order.order_discounts.forEach((od: any) => {
        const discountAmount = Number(od.discount_amount || 0)
        if (od.product_discount_id) {
          uniqueProductDiscounts.add(od.product_discount_id)
          // Sum discount amounts if same discount appears multiple times (multiple items)
          productDiscountAmounts.set(
            od.product_discount_id,
            (productDiscountAmounts.get(od.product_discount_id) || 0) + discountAmount
          )
        }
        if (od.discount_code_id) {
          uniqueCodeDiscounts.add(od.discount_code_id)
          codeDiscountAmounts.set(
            od.discount_code_id,
            (codeDiscountAmounts.get(od.discount_code_id) || 0) + discountAmount
          )
        }
      })
      
      // Calculate subtotal after product discounts (for code discounts calculation)
      const totalProductDiscountAmount = Array.from(productDiscountAmounts.values()).reduce(
        (sum, amount) => sum + amount,
        0
      )
      const subtotalAfterProductDiscounts = Math.max(0, subtotalWithoutDiscounts - totalProductDiscountAmount)
      
      // Process product discounts first
      // Revenue Before = original subtotal
      // Revenue After = subtotal - this product discount
      uniqueProductDiscounts.forEach((discountId) => {
        const orderSet = processedOrdersPerDiscount.get(discountId) || new Set()
        if (!orderSet.has(order.id)) {
          orderSet.add(order.id)
          processedOrdersPerDiscount.set(discountId, orderSet)
          
          const totalDiscountAmount = productDiscountAmounts.get(discountId) || 0
          const revenueAfterThisDiscount = Math.max(0, subtotalWithoutDiscounts - totalDiscountAmount)
          
          const currentBefore = discountRevenueBeforeMap.get(discountId) || 0
          const currentAfter = discountRevenueAfterMap.get(discountId) || 0
          discountRevenueBeforeMap.set(discountId, currentBefore + subtotalWithoutDiscounts)
          discountRevenueAfterMap.set(discountId, currentAfter + revenueAfterThisDiscount)
        }
      })
      
      // Process code discounts
      // Revenue Before = subtotal AFTER product discounts (if any), otherwise original subtotal
      // Revenue After = subtotal after product discounts - this code discount
      uniqueCodeDiscounts.forEach((discountId) => {
        const orderSet = processedOrdersPerDiscount.get(discountId) || new Set()
        if (!orderSet.has(order.id)) {
          orderSet.add(order.id)
          processedOrdersPerDiscount.set(discountId, orderSet)
          
          const totalDiscountAmount = codeDiscountAmounts.get(discountId) || 0
          // Code discount is applied to subtotal AFTER product discounts
          const revenueBeforeThisDiscount = subtotalAfterProductDiscounts // Subtotal after product discounts
          const revenueAfterThisDiscount = Math.max(0, subtotalAfterProductDiscounts - totalDiscountAmount)
          
          const currentBefore = discountRevenueBeforeMap.get(discountId) || 0
          const currentAfter = discountRevenueAfterMap.get(discountId) || 0
          discountRevenueBeforeMap.set(discountId, currentBefore + revenueBeforeThisDiscount)
          discountRevenueAfterMap.set(discountId, currentAfter + revenueAfterThisDiscount)
        }
      })
    })

    // Calculate product discounts stats
    const productDiscountsMap = new Map()
    const productDiscountsByDay = new Map<string, { count: number; amount: number }>()

    productDiscountsData?.forEach((item) => {
      if (!item.product_discount_id || !item.product_discounts) return

      const discountId = item.product_discount_id
      const productDiscount = item.product_discounts as any
      const product = productDiscount.products
      const productName = (product as any)?.name_en || (product as any)?.name_el || 'Unknown'
      
      const discountType = productDiscount.discount_type
      const discountValue = productDiscount.discount_value
      const discountLabel = discountType === 'percentage' 
        ? `${discountValue}%`
        : `${discountValue}€`

      const key = `${discountId}-${productName}-${discountLabel}`
      
      if (!productDiscountsMap.has(key)) {
        productDiscountsMap.set(key, {
          id: discountId,
          productName,
          discountType,
          discountValue,
          discountLabel,
          isActive: productDiscount.is_active,
          usageCount: 0,
          totalAmount: 0,
          revenueBeforeDiscount: 0,
          revenueAfterDiscount: 0,
        })
      }

      const stat = productDiscountsMap.get(key)
      if (stat) {
        stat.usageCount++
        stat.totalAmount += Number(item.discount_amount) || 0
        stat.revenueBeforeDiscount = Math.max(0, Math.round((discountRevenueBeforeMap.get(discountId) || 0) * 100) / 100)
        stat.revenueAfterDiscount = Math.max(0, Math.round((discountRevenueAfterMap.get(discountId) || 0) * 100) / 100)
      }

      // By day
      const dateKey = new Date(item.created_at).toISOString().split('T')[0]
      if (!productDiscountsByDay.has(dateKey)) {
        productDiscountsByDay.set(dateKey, { count: 0, amount: 0 })
      }
      const dayStat = productDiscountsByDay.get(dateKey)
      if (dayStat) {
        dayStat.count++
        dayStat.amount += Number(item.discount_amount) || 0
      }
    })

    const topProductDiscounts = Array.from(productDiscountsMap.values())
      .sort((a, b) => b.revenueAfterDiscount - a.revenueAfterDiscount) // Sort by revenue after discount
      .slice(0, 10)

    // Calculate discount codes stats
    const discountCodesMap = new Map()
    const discountCodesByDay = new Map<string, { count: number; amount: number }>()

    discountCodesData?.forEach((item) => {
      if (!item.discount_code_id || !item.discount_codes) return

      const codeId = item.discount_code_id
      const discountCode = item.discount_codes as any
      const code = discountCode.code
      const discountType = discountCode.discount_type
      const discountValue = discountCode.discount_value
      const discountLabel = discountType === 'percentage' 
        ? `${discountValue}%`
        : `${discountValue}€`

      if (!discountCodesMap.has(codeId)) {
        discountCodesMap.set(codeId, {
          id: codeId,
          code,
          discountType,
          discountValue,
          discountLabel,
          isActive: discountCode.is_active,
          usageCount: 0,
          totalAmount: 0,
          revenueBeforeDiscount: 0,
          revenueAfterDiscount: 0,
        })
      }

      const stat = discountCodesMap.get(codeId)
      if (stat) {
        stat.usageCount++
        stat.totalAmount += Number(item.discount_amount) || 0
        stat.revenueBeforeDiscount = Math.max(0, Math.round((discountRevenueBeforeMap.get(codeId) || 0) * 100) / 100)
        stat.revenueAfterDiscount = Math.max(0, Math.round((discountRevenueAfterMap.get(codeId) || 0) * 100) / 100)
      }

      // By day
      const dateKey = new Date(item.created_at).toISOString().split('T')[0]
      if (!discountCodesByDay.has(dateKey)) {
        discountCodesByDay.set(dateKey, { count: 0, amount: 0 })
      }
      const dayStat = discountCodesByDay.get(dateKey)
      if (dayStat) {
        dayStat.count++
        dayStat.amount += Number(item.discount_amount) || 0
      }
    })

    const topDiscountCodes = Array.from(discountCodesMap.values())
      .sort((a, b) => b.revenueAfterDiscount - a.revenueAfterDiscount) // Sort by revenue after discount
      .slice(0, 10)

    // Total stats
    const totalProductDiscountsAmount = productDiscountsData?.reduce(
      (sum, item) => sum + (Number(item.discount_amount) || 0),
      0
    ) || 0

    const totalDiscountCodesAmount = discountCodesData?.reduce(
      (sum, item) => sum + (Number(item.discount_amount) || 0),
      0
    ) || 0

    const totalDiscountsAmount = totalProductDiscountsAmount + totalDiscountCodesAmount

    // Calculate average discount per order
    const averageDiscountPerOrder = ordersWithDiscounts > 0 
      ? totalDiscountsAmount / ordersWithDiscounts 
      : 0

    // Calculate revenue from discounted orders (subtotal after discounts, WITHOUT shipping)
    // This shows the actual revenue from products after discounts are applied
    // IMPORTANT: We calculate from order_items, NOT from order.total (which includes shipping)
    // Example: Order with 24€ subtotal, -10€ product discount, -2,80€ code discount = 11,20€ revenue
    const revenueFromDiscountedOrders = ordersWithDiscountDetails 
      ? Math.round(
          ordersWithDiscountDetails.reduce((sum, order: any) => {
            if (!order.order_discounts || order.order_discounts.length === 0) return sum
            
            const orderItems = order.order_items || []
            
            // Calculate subtotal from order_items (products only, no shipping)
            const subtotalWithoutDiscounts = orderItems.reduce(
              (itemSum: number, item: any) => itemSum + (Number(item.price || 0) * Number(item.quantity || 0)),
              0
            )
            
            // Skip if no items (can't calculate revenue)
            if (subtotalWithoutDiscounts === 0) return sum
            
            // Calculate total discount amount for this order
            const totalDiscountAmount = order.order_discounts.reduce(
              (discountSum: number, od: any) => discountSum + (Number(od.discount_amount || 0)),
              0
            )
            
            // Revenue = Subtotal after discounts (products only, shipping excluded)
            const subtotalAfterDiscounts = Math.max(0, subtotalWithoutDiscounts - totalDiscountAmount)
            return sum + subtotalAfterDiscounts
          }, 0) * 100
        ) / 100 
      : 0

    // Convert by day maps to arrays
    const productDiscountsByDayArray = Array.from(productDiscountsByDay.entries())
      .map(([date, stats]) => ({
        date,
        count: stats.count,
        amount: stats.amount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const discountCodesByDayArray = Array.from(discountCodesByDay.entries())
      .map(([date, stats]) => ({
        date,
        count: stats.count,
        amount: stats.amount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      totalDiscountsAmount,
      totalProductDiscountsAmount,
      totalDiscountCodesAmount,
      totalProductDiscountsUsage: productDiscountsData?.length || 0,
      totalDiscountCodesUsage: discountCodesData?.length || 0,
      // Conversion metrics
      totalOrders,
      ordersWithDiscounts,
      conversionRate,
      averageDiscountPerOrder,
      revenueFromDiscountedOrders,
      // Top discounts
      topProductDiscounts,
      topDiscountCodes,
      // Time series
      productDiscountsByDay: productDiscountsByDayArray,
      discountCodesByDay: discountCodesByDayArray,
    })
  } catch (error: any) {
    console.error('Failed to fetch discount analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch discount analytics', details: error?.message },
      { status: 500 }
    )
  }
}

