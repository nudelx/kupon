import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import CouponList from '@/components/CouponList'
import AddCoupon from '@/components/AddCoupon'

export default async function Home() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .order('expires_at', { ascending: true });

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Coupons</h1>
          <p className="text-gray-500">Welcome, {user.email}</p>
        </div>
        <LogoutButton />
      </header>
      <main>
        <AddCoupon />
        <CouponList coupons={coupons ?? []} />
      </main>
    </div>
  )
}