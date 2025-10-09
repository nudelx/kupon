import { randomUUID } from 'crypto';
import { renderHook, act, waitFor } from '@testing-library/react';
import { addDays, subDays } from 'date-fns';
import { describe, beforeEach, expect, it } from 'vitest';
import { useWeeklyReminder } from '../useWeeklyReminder';
import type { CouponRecord } from '@/features/coupons/types';

const createCoupon = (overrides: Partial<CouponRecord> = {}): CouponRecord => ({
  id: overrides.id ?? randomUUID(),
  title: overrides.title ?? 'Test coupon',
  description: overrides.description ?? null,
  code_text: overrides.code_text ?? null,
  image_url: overrides.image_url ?? null,
  expiration_date: overrides.expiration_date ?? null,
  is_used: overrides.is_used ?? false,
  owner_id: overrides.owner_id ?? 'user-1',
  group_id: overrides.group_id ?? null,
  share_slug: overrides.share_slug ?? null,
  created_at: overrides.created_at ?? new Date().toISOString(),
  updated_at: overrides.updated_at ?? new Date().toISOString(),
  used_at: overrides.used_at ?? null
});

describe('useWeeklyReminder', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not remind when there are no coupons', () => {
    const { result } = renderHook(() => useWeeklyReminder([]));
    expect(result.current.shouldRemind).toBe(false);
    expect(result.current.soonExpiring).toHaveLength(0);
  });

  it('reminds when a coupon expires within seven days', async () => {
    const upcoming = createCoupon({ expiration_date: addDays(new Date(), 2).toISOString() });
    const { result } = renderHook(() => useWeeklyReminder([upcoming]));

    await waitFor(() => expect(result.current.shouldRemind).toBe(true));
    expect(result.current.soonExpiring).toHaveLength(1);
  });

  it('respects last reminder timestamp', async () => {
    const previousReminder = subDays(new Date(), 3).toISOString();
    localStorage.setItem('kupon:lastReminder', previousReminder);

    const upcoming = createCoupon({ expiration_date: addDays(new Date(), 2).toISOString() });
    const { result } = renderHook(() => useWeeklyReminder([upcoming]));

    await waitFor(() => expect(result.current.shouldRemind).toBe(false));
    expect(result.current.soonExpiring).toHaveLength(1);
  });

  it('acknowledges reminders and writes to localStorage', async () => {
    const upcoming = createCoupon({ expiration_date: addDays(new Date(), 1).toISOString() });
    const { result } = renderHook(() => useWeeklyReminder([upcoming]));

    await waitFor(() => expect(result.current.shouldRemind).toBe(true));

    await act(async () => {
      result.current.acknowledge();
    });

    expect(result.current.shouldRemind).toBe(false);
    const stored = localStorage.getItem('kupon:lastReminder');
    expect(stored).toBeTruthy();
  });
});
