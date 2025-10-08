import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { notFound } from 'next/navigation'

export default async function CouponPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !coupon) {
    notFound()
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {coupon.image_url && (
          <div className="relative h-96 w-full">
            <Image
              src={coupon.image_url}
              alt={`Image for ${coupon.title}`}
              layout="fill"
              objectFit="cover"
            />
          </div>
        )}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800">{coupon.title}</h1>
          <p className="text-lg text-gray-600 mt-2">
            Expires on: {new Date(coupon.expires_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
