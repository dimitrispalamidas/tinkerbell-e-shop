"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { DiscountCode } from '@/lib/types/database'

export default function EditDiscountCodePage() {
  const router = useRouter()
  const params = useParams()
  const locale = useLocale()
  const id = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    starts_at: '',
    expires_at: '',
    is_active: true,
    can_combine_with_productdiscount: false,
    can_combine_with_codediscount: false,
    max_uses: '',
  })

  useEffect(() => {
    fetchDiscountCode()
  }, [id])

  const fetchDiscountCode = async () => {
    try {
      const response = await fetch('/api/admin/discount-codes', {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch discount code')
      }

      const data = await response.json()
      const code = (data.discountCodes || []).find((c: DiscountCode) => c.id === id)

      if (!code) {
        toast.error(locale === 'el' ? 'Ο εκπτωτικός κωδικός δεν βρέθηκε' : 'Discount code not found')
        router.push('/admin/discount-codes')
        return
      }

      setFormData({
        code: code.code,
        discount_type: code.discount_type,
        discount_value: String(code.discount_value),
        starts_at: code.starts_at ? new Date(code.starts_at).toISOString().slice(0, 16) : '',
        expires_at: code.expires_at ? new Date(code.expires_at).toISOString().slice(0, 16) : '',
        is_active: code.is_active,
        can_combine_with_productdiscount: code.can_combine_with_productdiscount ?? false,
        can_combine_with_codediscount: code.can_combine_with_codediscount ?? false,
        max_uses: code.max_uses ? String(code.max_uses) : '',
      })
    } catch (error) {
      console.error('Error fetching discount code:', error)
      toast.error(locale === 'el' ? 'Αποτυχία φόρτωσης' : 'Failed to load')
      router.push('/admin/discount-codes')
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload: any = {
        id,
        code: formData.code.trim().toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        starts_at: formData.starts_at || null,
        expires_at: formData.expires_at || null,
        is_active: formData.is_active,
        can_combine_with_productdiscount: formData.can_combine_with_productdiscount,
        can_combine_with_codediscount: formData.can_combine_with_codediscount,
        max_uses: formData.max_uses ? Number(formData.max_uses) : null,
      }

      // Validate dates
      if (payload.starts_at && payload.expires_at && new Date(payload.starts_at) > new Date(payload.expires_at)) {
        toast.error(locale === 'el' ? 'Η ημερομηνία λήξης πρέπει να είναι μετά την ημερομηνία έναρξης' : 'Expiration date must be after start date')
        setIsLoading(false)
        return
      }

      // Validate percentage
      if (formData.discount_type === 'percentage' && (payload.discount_value < 0 || payload.discount_value > 100)) {
        toast.error(locale === 'el' ? 'Το ποσοστό πρέπει να είναι μεταξύ 0 και 100' : 'Percentage must be between 0 and 100')
        setIsLoading(false)
        return
      }

      // Validate fixed amount
      if (formData.discount_type === 'fixed' && payload.discount_value < 0) {
        toast.error(locale === 'el' ? 'Το ποσό πρέπει να είναι θετικό' : 'Amount must be positive')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/admin/discount-codes', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update discount code')
      }

      toast.success(locale === 'el' ? 'Ο εκπτωτικός κωδικός ενημερώθηκε' : 'Discount code updated')
      router.push('/admin/discount-codes')
    } catch (error: any) {
      console.error('Error updating discount code:', error)
      toast.error(error.message || (locale === 'el' ? 'Αποτυχία ενημέρωσης' : 'Failed to update'))
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {locale === 'el' ? 'Επεξεργασία Εκπτωτικού Κωδικού' : 'Edit Discount Code'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'el' ? 'Φόρτωση...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/discount-codes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {locale === 'el' ? 'Πίσω' : 'Back'}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {locale === 'el' ? 'Επεξεργασία Εκπτωτικού Κωδικού' : 'Edit Discount Code'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'el' ? 'Επεξεργασία εκπτωτικού κωδικού' : 'Edit discount code'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{locale === 'el' ? 'Στοιχεία Κωδικού' : 'Code Details'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="code">
                {locale === 'el' ? 'Κωδικός' : 'Code'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder={locale === 'el' ? 'π.χ. SUMMER20' : 'e.g. SUMMER20'}
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="discount_type">
                {locale === 'el' ? 'Τύπος Έκπτωσης' : 'Discount Type'} <span className="text-red-500">*</span>
              </Label>
              <select
                id="discount_type"
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                className="mt-2 w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="percentage">{locale === 'el' ? 'Ποσοστό (%)' : 'Percentage (%)'}</option>
                <option value="fixed">{locale === 'el' ? 'Σταθερό Ποσό (€)' : 'Fixed Amount (€)'}</option>
              </select>
            </div>

            <div>
              <Label htmlFor="discount_value">
                {formData.discount_type === 'percentage'
                  ? (locale === 'el' ? 'Ποσοστό (%)' : 'Percentage (%)')
                  : (locale === 'el' ? 'Ποσό (€)' : 'Amount (€)')}{' '}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="discount_value"
                type="number"
                step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                min="0"
                max={formData.discount_type === 'percentage' ? '100' : undefined}
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                placeholder={formData.discount_type === 'percentage' ? '0-100' : '0.00'}
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="starts_at">
                {locale === 'el' ? 'Ημερομηνία Έναρξης' : 'Start Date'} (optional)
              </Label>
              <Input
                id="starts_at"
                type="datetime-local"
                value={formData.starts_at}
                onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="expires_at">
                {locale === 'el' ? 'Ημερομηνία Λήξης' : 'Expiration Date'} (optional)
              </Label>
              <Input
                id="expires_at"
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="max_uses">
                {locale === 'el' ? 'Μέγιστος Αριθμός Χρήσεων' : 'Max Uses'} (optional)
              </Label>
              <Input
                id="max_uses"
                type="number"
                min="1"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                placeholder={locale === 'el' ? 'Άπειρο αν αφεθεί κενό' : 'Unlimited if left empty'}
                className="mt-2"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked === true })}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                {locale === 'el' ? 'Ενεργό' : 'Active'}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="can_combine_with_productdiscount"
                checked={formData.can_combine_with_productdiscount}
                onCheckedChange={(checked) => setFormData({ ...formData, can_combine_with_productdiscount: checked === true })}
              />
              <Label htmlFor="can_combine_with_productdiscount" className="cursor-pointer">
                {locale === 'el' ? 'Μπορεί να συνδυαστεί με εκπτώσεις προϊόντων' : 'Can combine with product discounts'}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="can_combine_with_codediscount"
                checked={formData.can_combine_with_codediscount}
                onCheckedChange={(checked) => setFormData({ ...formData, can_combine_with_codediscount: checked === true })}
              />
              <Label htmlFor="can_combine_with_codediscount" className="cursor-pointer">
                {locale === 'el' ? 'Μπορεί να συνδυαστεί με άλλους εκπτωτικούς κωδικούς' : 'Can combine with other discount codes'}
              </Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading
                  ? (locale === 'el' ? 'Αποθήκευση...' : 'Saving...')
                  : (locale === 'el' ? 'Αποθήκευση' : 'Save')}
              </Button>
              <Link href="/admin/discount-codes">
                <Button type="button" variant="outline">
                  {locale === 'el' ? 'Ακύρωση' : 'Cancel'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

