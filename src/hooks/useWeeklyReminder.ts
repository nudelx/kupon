import { useEffect, useMemo, useState } from 'react';
import { differenceInDays, isWithinInterval, parseISO } from 'date-fns';
import type { CouponRecord } from '@/features/coupons/types';

const STORAGE_KEY = 'kupon:lastReminder';

const isExpiringSoon = (coupon: CouponRecord) => {
  if (!coupon.expiration_date || coupon.is_used) {
    return false;
  }

  const expiration = parseISO(coupon.expiration_date);
  const now = new Date();

  return isWithinInterval(expiration, {
    start: now,
    end: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  });
};

export const useWeeklyReminder = (coupons: CouponRecord[] | undefined) => {
  const soonExpiring = useMemo(() => (coupons ?? []).filter(isExpiringSoon), [coupons]);
  const [shouldRemind, setShouldRemind] = useState(false);

  useEffect(() => {
    if (!soonExpiring.length) {
      return;
    }

    const lastReminderValue = localStorage.getItem(STORAGE_KEY);
    if (!lastReminderValue) {
      setShouldRemind(true);
      return;
    }

    const lastReminder = parseISO(lastReminderValue);
    if (differenceInDays(new Date(), lastReminder) >= 7) {
      setShouldRemind(true);
    }
  }, [soonExpiring]);

  const acknowledge = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setShouldRemind(false);
  };

  return {
    shouldRemind,
    acknowledge,
    soonExpiring
  };
};
