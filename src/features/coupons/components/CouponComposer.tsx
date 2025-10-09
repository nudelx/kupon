import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import type { GroupRecord } from '@/features/groups/api';
import { uploadCouponImage } from '@/lib/storage';
import { useAuth } from '@/features/auth/useAuth';
import type { CouponPayload, CouponRecord } from '../types';

export type CouponComposerProps = {
  groups: GroupRecord[];
  defaultGroupId?: string | null;
  initialCoupon?: CouponRecord | null;
  onSubmit: (payload: CouponPayload) => Promise<void>;
  onCancelEdit?: () => void;
  isSaving: boolean;
};

const initialState = {
  title: '',
  description: '',
  codeText: '',
  expirationDate: '',
  groupId: 'personal' as string | 'personal'
};

export const CouponComposer = ({
  groups,
  defaultGroupId,
  initialCoupon,
  onSubmit,
  onCancelEdit,
  isSaving
}: CouponComposerProps) => {
  const { user } = useAuth();
  const [formState, setFormState] = useState(initialState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
  }, [defaultGroupId, initialCoupon]);

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
      }
    } catch (err) {
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

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{mode === 'create' ? 'Add new coupon' : 'Edit coupon'}</h2>
        {mode === 'edit' && onCancelEdit ? (
          <button type="button" className="btn btn-sm btn-ghost absolute top-4 right-4" onClick={onCancelEdit}>
            Cancel
          </button>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Title</span>
            </div>
            <input
              type="text"
              placeholder="e.g. Grocery store coupon"
              className="input input-bordered w-full"
              value={formState.title}
              onChange={(event) => setFormState((state) => ({ ...state, title: event.target.value }))}
              required
            />
          </label>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Description</span>
            </div>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder="Add any details for the family…"
              value={formState.description}
              onChange={(event) => setFormState((state) => ({ ...state, description: event.target.value }))}
            ></textarea>
          </label>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Coupon text / code</span>
            </div>
            <input
              type="text"
              placeholder="Optional code"
              className="input input-bordered w-full"
              value={formState.codeText}
              onChange={(event) => setFormState((state) => ({ ...state, codeText: event.target.value }))}
            />
          </label>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Expiration date</span>
            </div>
            <input
              type="date"
              className="input input-bordered w-full"
              value={formState.expirationDate}
              onChange={(event) => setFormState((state) => ({ ...state, expirationDate: event.target.value }))}
            />
          </label>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Share with</span>
            </div>
            <select
              className="select select-bordered"
              value={formState.groupId}
              onChange={(event) => setFormState((state) => ({ ...state, groupId: event.target.value }))}
            >
              {availableGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.id === 'personal' ? 'Personal list' : group.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Image (optional)</span>
            </div>
            <input type="file" className="file-input file-input-bordered w-full" accept="image/*" onChange={handleFileChange} />
          </label>
          <div className="card-actions justify-end">
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving…' : mode === 'create' ? 'Add coupon' : 'Update coupon'}
            </button>
          </div>
          {success ? <div role="alert" className="alert alert-success"><p>{success}</p></div> : null}
          {error ? <div role="alert" className="alert alert-error"><p>{error}</p></div> : null}
        </form>
      </div>
    </div>
  );
};
