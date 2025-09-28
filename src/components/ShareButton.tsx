'use client'

import { useState } from 'react'
import { type Coupon } from './CouponCard'

export default function ShareButton({ coupon }: { coupon: Coupon }) {
  const [isOpen, setIsOpen] = useState(false)

  const shareText = `Check out this coupon: ${coupon.title}! You can view it here: ${coupon.image_url}`
  const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`
  const emailUrl = `mailto:?subject=Check out this coupon: ${coupon.title}&body=${encodeURIComponent(shareText)}`

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
        {/* A simple share icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8m-4-6l-4-4m0 0L8 6m4-4v12" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Share on WhatsApp
          </a>
          <a
            href={emailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Share via Email
          </a>
        </div>
      )}
    </div>
  )
}
