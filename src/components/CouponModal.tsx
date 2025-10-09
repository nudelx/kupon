import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import type { GroupRecord } from '@/features/groups/api';
import { uploadCouponImage } from '@/lib/storage';
import { useAuth } from '@/features/auth/useAuth';
import { ImagePreview } from '@/components/ui';
import type { CouponPayload, CouponRecord } from '@/features/coupons/types';

export type CouponModalProps = {
  isOpen: boolean;
  onClose: () => void;
  groups: GroupRecord[];
  defaultGroupId?: string | null;
  initialCoupon?: CouponRecord | null;
  onSubmit: (payload: CouponPayload) => Promise<void>;
  isSaving: boolean;
};

const initialState = {
  title: '',
  description: '',
  codeText: '',
  expirationDate: '',
  groupId: 'personal' as string | 'personal'
};

export const CouponModal = ({
  isOpen,
  onClose,
  groups,
  defaultGroupId,
  initialCoupon,
  onSubmit,
  isSaving
}: CouponModalProps) => {
  const { user } = useAuth();
  const [formState, setFormState] = useState(initialState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; alt: string } | null>(null);

  const mode = initialCoupon ? 'edit' : 'create';

  useEffect(() => {
    if (initialCoupon) {
      setFormState({
        title: initialCoupon.title,
        description: initialCoupon.description ?? '',
        codeText: initialCoupon.code_text ?? '',
        expirationDate: initialCoupon.expiration_date?.split('T')[0] ?? '',
        groupId: initialCoupon.group_id ?? 'personal'
      });
    } else {
      setFormState(() => ({
        ...initialState,
        groupId: defaultGroupId ?? 'personal'
      }));
    }
    setImageFile(null);
    setError(null);
    setSuccess(null);
  }, [defaultGroupId, initialCoupon, isOpen]);

  const availableGroups = useMemo(
    () => [{ id: 'personal', name: 'Personal', join_code: '', owner_id: user?.id ?? '', created_at: '' }, ...groups],
    [groups, user?.id]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.title.trim()) {
      setError('A title helps everyone recognise this coupon.');
      return;
    }

    setError(null);
    try {
      let uploadedImageUrl: string | undefined;
      if (imageFile && user) {
        uploadedImageUrl = await uploadCouponImage(imageFile, user.id);
      }

      const imageUrl = uploadedImageUrl ?? initialCoupon?.image_url ?? null;

      await onSubmit({
        title: formState.title.trim(),
        description: formState.description.trim() || null,
        code_text: formState.codeText.trim() || null,
        expiration_date: formState.expirationDate || null,
        group_id: formState.groupId === 'personal' ? null : formState.groupId,
        image_url: imageUrl
      });

      setSuccess(mode === 'create' ? 'Coupon saved.' : 'Coupon updated.');
      if (mode === 'create') {
        setFormState({ ...initialState, groupId: defaultGroupId ?? 'personal' });
        setImageFile(null);
        // Close modal after successful creation
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Could not save coupon.');
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageFile(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported.');
      return;
    }

    setImageFile(file);
  };

  const handleClose = () => {
    setFormState(initialState);
    setImageFile(null);
    setError(null);
    setSuccess(null);
    setPreviewImage(null);
    onClose();
  };

  const handleImagePreview = (imageUrl: string, alt: string) => {
    setPreviewImage({ url: imageUrl, alt });
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto bg-base-100 border border-base-300 shadow-soft-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-base-content flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {mode === 'create' ? 'Add new coupon' : 'Edit coupon'}
          </h3>
          <button 
            type="button" 
            className="btn btn-sm btn-circle btn-ghost touch-target" 
            onClick={handleClose}
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Alerts */}
        {success ? (
          <div role="alert" className="alert alert-success mb-4">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
        ) : null}
        
        {error ? (
          <div role="alert" className="alert alert-error mb-4">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        ) : null}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Title *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Grocery store coupon"
              className="input input-bordered input-mobile w-full"
              value={formState.title}
              onChange={(event) => setFormState((state) => ({ ...state, title: event.target.value }))}
              required
            />
          </div>

          {/* Description */}
          <div className="form-control w-full flex flex-col gap-2">
            <label className="label">
              <span className="label-text font-medium">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-20 input-mobile"
              placeholder="Add any details for the family…"
              value={formState.description}
              onChange={(event) => setFormState((state) => ({ ...state, description: event.target.value }))}
            ></textarea>
          </div>

          {/* Coupon Code */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Coupon text / code</span>
            </label>
            <input
              type="text"
              placeholder="Optional code"
              className="input input-bordered input-mobile w-full"
              value={formState.codeText}
              onChange={(event) => setFormState((state) => ({ ...state, codeText: event.target.value }))}
            />
          </div>

          {/* Expiration Date */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Expiration date</span>
            </label>
            <input
              type="date"
              className="input input-bordered input-mobile w-full"
              value={formState.expirationDate}
              onChange={(event) => setFormState((state) => ({ ...state, expirationDate: event.target.value }))}
            />
          </div>

          {/* Share With */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Share with</span>
            </label>
            <select
              className="select select-bordered input-mobile w-full"
              value={formState.groupId}
              onChange={(event) => setFormState((state) => ({ ...state, groupId: event.target.value }))}
            >
              {availableGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.id === 'personal' ? 'Personal list' : group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Image (optional)</span>
            </label>
            <input 
              type="file" 
              className="file-input file-input-bordered w-full" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
             {imageFile ? (
               <div className="mt-4 relative">
                 <img 
                   src={URL.createObjectURL(imageFile)} 
                   alt="Coupon preview" 
                   className="w-full h-32 object-cover rounded-lg border border-base-300 cursor-pointer hover:opacity-90 transition-opacity duration-200" 
                   onClick={() => handleImagePreview(URL.createObjectURL(imageFile), 'Coupon preview')}
                 />
                 <div className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors duration-200">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                   </svg>
                 </div>
               </div>
             ) : initialCoupon?.image_url ? (
               <div className="mt-4 relative">
                 <img 
                   src={initialCoupon.image_url} 
                   alt="Coupon image" 
                   className="w-full h-32 object-cover rounded-lg border border-base-300 cursor-pointer hover:opacity-90 transition-opacity duration-200" 
                   onClick={() => handleImagePreview(initialCoupon.image_url!, 'Coupon image')}
                 />
                 <div className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors duration-200">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                   </svg>
                 </div>
               </div>
             ) : null}
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button 
              type="button" 
              className="btn btn-ghost" 
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-friendly btn-mobile" 
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving…
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {mode === 'create' ? 'Add coupon' : 'Update coupon'}
                </>
              )}
            </button>
          </div>
         </form>
       </div>
       <div className="modal-backdrop" onClick={handleClose}></div>
     </div>
     
     {/* Image Preview Modal */}
     {previewImage && (
       <ImagePreview
         isOpen={!!previewImage}
         onClose={closePreview}
         imageUrl={previewImage.url}
         alt={previewImage.alt}
       />
     )}
   </>
   );
 };
