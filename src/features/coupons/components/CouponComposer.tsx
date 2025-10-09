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
    <section className="card">
      <header className="card__header">
        <h2>{mode === 'create' ? 'Add new coupon' : 'Edit coupon'}</h2>
        {mode === 'edit' && onCancelEdit ? (
          <button type="button" className="text-button" onClick={onCancelEdit}>
            Cancel
          </button>
        ) : null}
      </header>
      <form className="coupon-form" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            value={formState.title}
            onChange={(event) => setFormState((state) => ({ ...state, title: event.target.value }))}
            placeholder="e.g. Grocery store coupon"
            required
          />
        </label>
        <label>
          Description
          <textarea
            value={formState.description}
            onChange={(event) => setFormState((state) => ({ ...state, description: event.target.value }))}
            placeholder="Add any details for the family…"
            rows={3}
          />
        </label>
        <label>
          Coupon text / code
          <input
            value={formState.codeText}
            onChange={(event) => setFormState((state) => ({ ...state, codeText: event.target.value }))}
            placeholder="Optional code"
          />
        </label>
        <label>
          Expiration date
          <input
            type="date"
            value={formState.expirationDate}
            onChange={(event) => setFormState((state) => ({ ...state, expirationDate: event.target.value }))}
          />
        </label>
        <label>
          Share with
          <select
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
        <label>
          Image (optional)
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>
        <button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving…' : mode === 'create' ? 'Add coupon' : 'Update coupon'}
        </button>
        {success ? <p className="feedback success">{success}</p> : null}
        {error ? <p className="feedback error">{error}</p> : null}
      </form>
    </section>
  );
};
