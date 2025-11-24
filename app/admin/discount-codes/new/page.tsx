"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewDiscountCodePage() {
  const router = useRouter()
  const locale = useLocale()
  const [isLoading, setIsLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload: any = {
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create discount code')
      }

      toast.success(locale === 'el' ? 'Ο εκπτωτικός κωδικός δημιουργήθηκε' : 'Discount code created')
      router.push('/admin/discount-codes')
    } catch (error: any) {
      console.error('Error creating discount code:', error)
      toast.error(error.message || (locale === 'el' ? 'Αποτυχία δημιουργίας' : 'Failed to create'))
    } finally {
      setIsLoading(false)
    }
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
            {locale === 'el' ? 'Νέος Εκπτωτικός Κωδικός' : 'New Discount Code'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'el' ? 'Δημιουργία νέου εκπτωτικού κωδικού' : 'Create a new discount code'}
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

