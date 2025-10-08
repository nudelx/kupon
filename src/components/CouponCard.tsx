import Image from 'next/image';
import ShareButton from './ShareButton';

// Define the type for a coupon object for type-safety
export type Coupon = {
  id: number;
  title: string;
  image_url: string | null;
  expires_at: string;
  used: boolean;
};

export default function CouponCard({ coupon, onDelete, onEdit, onMarkAsUsed }: { coupon: Coupon, onDelete: (id: number, imageUrl: string | null) => void, onEdit: (coupon: Coupon) => void, onMarkAsUsed: (id: number) => void }) {
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
          <div className="flex items-center gap-2">
            <ShareButton coupon={coupon} />
            <button
              onClick={() => onEdit(coupon)}
              className="p-1 rounded-full hover:bg-gray-200"
              aria-label="Edit coupon"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(coupon.id, coupon.image_url)}
              className="p-1 rounded-full hover:bg-gray-200"
              aria-label="Delete coupon"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Expires on: {new Date(coupon.expires_at).toLocaleDateString()}
        </p>
        {coupon.used ? (
          <p className="text-sm font-bold text-red-500 mt-2">USED</p>
        ) : (
          <button
            onClick={() => onMarkAsUsed(coupon.id)}
            className="mt-4 w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Mark as Used
          </button>
        )}
      </div>
    </div>
  );
}