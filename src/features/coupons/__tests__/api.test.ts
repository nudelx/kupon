import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import type { PostgrestError } from '@supabase/supabase-js';

vi.mock('@/lib/supabaseClient', () => {
  const from = vi.fn();
  const channel = vi.fn();
  const removeChannel = vi.fn();
  return { supabase: { from, channel, removeChannel } };
});

import { supabase } from '@/lib/supabaseClient';
import {
  createCoupon,
  ensureShareSlug,
  fetchCoupons
} from '../api';
import type { CouponPayload } from '../types';

type QueryBuilder<T> = {
  select: Mock;
  order: Mock;
  eq: Mock;
  is: Mock;
  insert: Mock;
  update: Mock;
  delete: Mock;
  single: Mock;
  then: (resolve: (value: { data: T; error: PostgrestError | null }) => unknown) => unknown;
};

const createQueryBuilder = <T>({ data, error }: { data: T; error: PostgrestError | null }): QueryBuilder<T> => {
  const builder: QueryBuilder<T> = {
    select: vi.fn(),
    order: vi.fn(),
    eq: vi.fn(),
    is: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    single: vi.fn(),
    then: (resolve) => resolve({ data, error })
  };

  builder.select.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.is.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.delete.mockReturnValue(builder);
  builder.single.mockReturnValue(builder);

  return builder;
};

describe('coupon API', () => {
  const supabaseFrom = supabase.from as unknown as Mock;

  beforeEach(() => {
    supabaseFrom.mockReset();
  });

  it('fetches personal coupons for the owner when no group is provided', async () => {
    const expected = [{ id: '1' }];
    const builder = createQueryBuilder({ data: expected, error: null });
    supabaseFrom.mockReturnValue(builder);

    const result = await fetchCoupons({ ownerId: 'user-1', groupId: null });

    expect(supabaseFrom).toHaveBeenCalledWith('coupons');
    expect(builder.eq).toHaveBeenCalledWith('owner_id', 'user-1');
    expect(builder.is).toHaveBeenCalledWith('group_id', null);
    expect(result).toEqual(expected);
  });

  it('fetches shared coupons for a specific group', async () => {
    const builder = createQueryBuilder({ data: [], error: null });
    supabaseFrom.mockReturnValue(builder);

    await fetchCoupons({ ownerId: 'user-1', groupId: 'group-1' });

    expect(builder.eq).toHaveBeenCalledWith('group_id', 'group-1');
    expect(builder.eq).toHaveBeenCalledTimes(1);
    expect(builder.is).not.toHaveBeenCalled();
  });

  it('throws when Supabase responds with an error', async () => {
    const builder = createQueryBuilder({ data: [], error: { message: 'fail' } as PostgrestError });
    supabaseFrom.mockReturnValue(builder);

    await expect(fetchCoupons({ ownerId: 'user-1', groupId: null })).rejects.toThrow('fail');
  });

  it('creates a coupon with a generated share slug', async () => {
    const builder = createQueryBuilder({ data: { id: 'coupon-id', share_slug: 'slug' }, error: null });
    supabaseFrom.mockReturnValue(builder);

    const payload: CouponPayload & { owner_id: string } = {
      title: 'Coupon',
      owner_id: 'user-1'
    };

    const result = await createCoupon(payload);

    expect(builder.insert).toHaveBeenCalledTimes(1);
    const inserted = builder.insert.mock.calls[0][0];
    expect(inserted.owner_id).toBe('user-1');
    expect(inserted.is_used).toBe(false);
    expect(inserted.share_slug).toHaveLength(12);
    expect(result).toEqual({ id: 'coupon-id', share_slug: 'slug' });
  });

  it('ensures a new share slug is issued', async () => {
    const builder = createQueryBuilder({ data: { share_slug: 'new-slug' }, error: null });
    supabaseFrom.mockReturnValue(builder);

    const slug = await ensureShareSlug('coupon-1');

    expect(builder.update).toHaveBeenCalledWith(expect.objectContaining({ share_slug: expect.any(String) }));
    expect(builder.eq).toHaveBeenCalledWith('id', 'coupon-1');
    expect(slug).toBe('new-slug');
  });
});
