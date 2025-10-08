'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import CouponCard, { type Coupon } from './CouponCard'
import EditCoupon from './EditCoupon'

export default function CouponList() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchCoupons = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('user_id', user.id)
        .order('expires_at', { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setCoupons(data as Coupon[])
      }
      setLoading(false)
    }

    fetchCoupons()

    const channel = supabase
      .channel('coupons')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'coupons' },
        (payload) => {
          setCoupons((prevCoupons) =>
            prevCoupons.map((c) =>
              c.id === payload.new.id ? (payload.new as Coupon) : c
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleDelete = async (couponId: number, imageUrl: string | null) => {
    const { error: deleteError } = await supabase
      .from('coupons')
      .delete()
      .eq('id', couponId)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    if (imageUrl) {
      const fileName = imageUrl.split('/').pop()
      if (fileName) {
        await supabase.storage.from('coupons').remove([`public/${fileName}`])
      }
    }

    setCoupons(coupons.filter((c) => c.id !== couponId))
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
  }

  const handleCloseEdit = () => {
    setEditingCoupon(null)
  }

  const handleMarkAsUsed = async (couponId: number) => {
    const { error } = await supabase
      .from('coupons')
      .update({ used: true })
      .eq('id', couponId)

    if (error) {
      setError(error.message)
    }
  }

  const expiringSoonCoupons = coupons.filter((coupon) => {
    const expiresAt = new Date(coupon.expires_at)
    const now = new Date()
    const sevenDaysFromNow = new Date(now.setDate(now.getDate() + 7))
    return expiresAt > new Date() && expiresAt <= sevenDaysFromNow && !coupon.used
  })

  const otherCoupons = coupons.filter((coupon) => !expiringSoonCoupons.includes(coupon))

  if (loading) {
    return <div className="text-center mt-8">Loading coupons...</div>
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Error: {error}</div>
  }

  if (!coupons || coupons.length === 0) {
    return (
      <div className="text-center mt-8">
        <p className="text-gray-500">You have no coupons yet. Add one to get started!</p>
      </div>
    )
  }

  return (
    <>
      {expiringSoonCoupons.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Expiring Soon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {expiringSoonCoupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onMarkAsUsed={handleMarkAsUsed}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Your Coupons</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {otherCoupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onMarkAsUsed={handleMarkAsUsed}
            />
          ))}
        </div>
      </div>

      {editingCoupon && (
        <EditCoupon coupon={editingCoupon} onClose={handleCloseEdit} />
      )}
    </>
  )
}
