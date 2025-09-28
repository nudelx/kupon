import Image from 'next/image';
import ShareButton from './ShareButton';

// Define the type for a coupon object for type-safety
export type Coupon = {
  id: number;
  title: string;
  image_url: string | null;
  expires_at: string;
};

export default function CouponCard({ coupon }: { coupon: Coupon }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full max-w-sm">
      {coupon.image_url && (
        <div className="relative h-48 w-full">
          <Image
            src={coupon.image_url}
            alt={`Image for ${coupon.title}`}
            layout="fill"
            objectFit="cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-800">{coupon.title}</h3>
          <ShareButton coupon={coupon} />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Expires on: {new Date(coupon.expires_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}