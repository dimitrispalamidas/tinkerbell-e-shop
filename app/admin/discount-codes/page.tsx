"use client"

import { useState, useEffect, useMemo } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { SearchInput } from '@/components/ui/search-input'
import type { DiscountCode } from '@/lib/types/database'

export default function AdminDiscountCodesPage() {
  const locale = useLocale()

  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchDiscountCodes()
  }, [])

  const fetchDiscountCodes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/discount-codes', {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch discount codes')
      }

      const data = await response.json()
      setDiscountCodes(data.discountCodes || [])
    } catch (error) {
      console.error('Error fetching discount codes:', error)
      toast.error(locale === 'el' ? 'Αποτυχία φόρτωσης εκπτωτικών κωδικών' : 'Failed to fetch discount codes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'el' ? 'Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον εκπτωτικό κωδικό;' : 'Are you sure you want to delete this discount code?')) return

    try {
      const response = await fetch(`/api/admin/discount-codes?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete discount code')
      }

      toast.success(locale === 'el' ? 'Ο εκπτωτικός κωδικός διαγράφηκε' : 'Discount code deleted')
      fetchDiscountCodes()
    } catch (error) {
      console.error('Error deleting discount code:', error)
      toast.error(locale === 'el' ? 'Αποτυχία διαγραφής' : 'Failed to delete')
    }
  }

  const filteredDiscountCodes = useMemo(() => {
    if (!searchQuery.trim()) return discountCodes

    const query = searchQuery.toLowerCase()
    return discountCodes.filter((code) => {
      const codeStr = (code.code || '').toLowerCase()
      return codeStr.includes(query)
    })
  }, [discountCodes, searchQuery])

  const formatDiscountValue = (code: DiscountCode) => {
    if (code.discount_type === 'percentage') {
      return `${code.discount_value}%`
    }
    return formatPrice(Number(code.discount_value), locale)
  }

  const isNotStarted = (code: DiscountCode) => {
    if (!code.starts_at) return false
    return new Date(code.starts_at) > new Date()
  }

  const isExpired = (code: DiscountCode) => {
    if (!code.expires_at) return false
    return new Date(code.expires_at) < new Date()
  }

  const isMaxUsesReached = (code: DiscountCode) => {
    if (code.max_uses === null) return false
    return code.usage_count >= code.max_uses
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {locale === 'el' ? 'Εκπτωτικοί Κωδικοί' : 'Discount Codes'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'el' ? 'Φόρτωση...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {locale === 'el' ? 'Εκπτωτικοί Κωδικοί' : 'Discount Codes'}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {locale === 'el' ? 'Διαχείριση εκπτωτικών κωδικών' : 'Manage discount codes'}
          </p>
        </div>
        <Link href="/admin/discount-codes/new">
          <Button className="w-full sm:w-auto h-11 md:h-10 text-sm md:text-base touch-manipulation">
            <Plus className="mr-2 h-4 w-4" />
            {locale === 'el' ? 'Προσθήκη Κωδικού' : 'Add Code'}
          </Button>
        </Link>
      </div>

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={locale === 'el' ? 'Αναζήτηση κωδικών...' : 'Search codes...'}
      />

      {filteredDiscountCodes.length > 0 ? (
        <div className="grid gap-4">
          {filteredDiscountCodes.map((code) => (
            <Card key={code.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-4">
                <div className="flex gap-3 md:gap-4 items-start justify-between">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-base md:text-lg">{code.code}</h3>
                      <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                        code.is_active && !isNotStarted(code) && !isExpired(code) && !isMaxUsesReached(code)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {code.is_active && !isNotStarted(code) && !isExpired(code) && !isMaxUsesReached(code)
                          ? (locale === 'el' ? 'Ενεργό' : 'Active')
                          : (locale === 'el' ? 'Ανενεργό' : 'Inactive')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {formatDiscountValue(code)}
                      </span>
                      <span>•</span>
                      <span>
                        {locale === 'el' ? 'Χρήσεις' : 'Uses'}: {code.usage_count}
                        {code.max_uses !== null && ` / ${code.max_uses}`}
                      </span>
                      {code.starts_at && (
                        <>
                          <span>•</span>
                          <span>
                            {locale === 'el' ? 'Ξεκινάει' : 'Starts'}: {new Date(code.starts_at).toLocaleDateString(locale === 'el' ? 'el-GR' : 'en-US')}
                          </span>
                        </>
                      )}
                      {code.expires_at && (
                        <>
                          <span>•</span>
                          <span>
                            {locale === 'el' ? 'Λήγει' : 'Expires'}: {new Date(code.expires_at).toLocaleDateString(locale === 'el' ? 'el-GR' : 'en-US')}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      {code.can_combine_with_productdiscount && (
                        <>
                          <span className="text-green-600">
                            {locale === 'el' ? '✓ Συνδυάζεται με προϊόντα' : '✓ Combines with products'}
                          </span>
                        </>
                      )}
                      {code.can_combine_with_codediscount && (
                        <>
                          {code.can_combine_with_productdiscount && <span className="text-muted-foreground"> • </span>}
                          <span className="text-blue-600">
                            {locale === 'el' ? '✓ Συνδυάζεται με κωδικούς' : '✓ Combines with codes'}
                          </span>
                        </>
                      )}
                      {!code.can_combine_with_productdiscount && !code.can_combine_with_codediscount && (
                        <span className="text-gray-500">
                          {locale === 'el' ? '✗ Δεν συνδυάζεται' : '✗ Cannot combine'}
                        </span>
                      )}
                    </div>
                    {isNotStarted(code) && (
                      <p className="text-xs text-blue-600">
                        {locale === 'el' ? '⏳ Δεν έχει ξεκινήσει ακόμα' : '⏳ Not started yet'}
                      </p>
                    )}
                    {isExpired(code) && (
                      <p className="text-xs text-red-600">
                        {locale === 'el' ? '⚠️ Έληξε' : '⚠️ Expired'}
                      </p>
                    )}
                    {isMaxUsesReached(code) && (
                      <p className="text-xs text-orange-600">
                        {locale === 'el' ? '⚠️ Έφτασε το όριο χρήσεων' : '⚠️ Max uses reached'}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/admin/discount-codes/${code.id}`}>
                      <Button variant="outline" size="sm" title={locale === 'el' ? 'Επεξεργασία' : 'Edit'} className="h-9 w-9 md:h-8 md:w-8 p-0 touch-manipulation">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(code.id)}
                      title={locale === 'el' ? 'Διαγραφή' : 'Delete'}
                      className="h-9 w-9 md:h-8 md:w-8 p-0 touch-manipulation text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 md:p-12 text-center">
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              {locale === 'el' ? 'Δεν υπάρχουν εκπτωτικοί κωδικοί' : 'No discount codes'}
            </p>
            <Link href="/admin/discount-codes/new">
              <Button className="w-full sm:w-auto h-11 md:h-10 text-sm md:text-base touch-manipulation">
                <Plus className="mr-2 h-4 w-4" />
                {locale === 'el' ? 'Προσθήκη Κωδικού' : 'Add Code'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

