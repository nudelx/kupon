import { useState, useEffect } from 'react';
import { Input, Textarea, Button, Alert } from '@/components/ui';
import type { CouponRecord } from '@/features/coupons/types';

export interface CouponFormProps {
  coupon?: CouponRecord | null;
  onSubmit: (data: {
    title: string;
    description: string;
    codeText: string;
    imageUrl: string;
    expirationDate: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const CouponForm = ({ 
  coupon, 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  error 
}: CouponFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [codeText, setCodeText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (coupon) {
      setTitle(coupon.title || '');
      setDescription(coupon.description || '');
      setCodeText(coupon.code_text || '');
      setImageUrl(coupon.image_url || '');
      setExpirationDate(coupon.expiration_date || '');
    }
  }, [coupon]);

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const { url } = await response.json();
      setImageUrl(url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      codeText: codeText.trim(),
      imageUrl: imageUrl.trim(),
      expirationDate: expirationDate.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert type="error">
          {error}
        </Alert>
      )}

      <Input
        label="Title *"
        type="text"
        placeholder="Enter coupon title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <Textarea
        label="Description"
        placeholder="Enter coupon description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />

      <Input
        label="Coupon Code"
        type="text"
        placeholder="Enter coupon code"
        value={codeText}
        onChange={(e) => setCodeText(e.target.value)}
      />

      <div className="space-y-2">
        <label className="label">
          <span className="label-text font-medium">Image</span>
        </label>
        
        {imageUrl && (
          <div className="relative">
            <img 
              src={imageUrl} 
              alt="Coupon preview" 
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              type="button"
              className="btn btn-sm btn-error absolute top-2 right-2"
              onClick={() => setImageUrl('')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <input
          type="file"
          accept="image/*"
          className="file-input file-input-bordered w-full"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setImageFile(file);
              handleImageUpload(file);
            }
          }}
          disabled={isUploading}
        />
        
        {isUploading && (
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <span className="loading loading-spinner loading-sm"></span>
            Uploading image...
          </div>
        )}
      </div>

      <Input
        label="Expiration Date"
        type="date"
        value={expirationDate}
        onChange={(e) => setExpirationDate(e.target.value)}
      />

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
        >
          {coupon ? 'Update Coupon' : 'Create Coupon'}
        </Button>
      </div>
    </form>
  );
};
