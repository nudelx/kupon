import { supabase } from './supabaseClient';

const BUCKET = 'coupon-images';

export const uploadCouponImage = async (file: File, userId: string) => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'png';
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type
  });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return publicUrl;
};
