export type CouponRecord = {
  id: string;
  title: string;
  description: string | null;
  code_text: string | null;
  image_url: string | null;
  expiration_date: string | null;
  is_used: boolean;
  owner_id: string;
  group_id: string | null;
  share_slug: string | null;
  created_at: string;
  updated_at: string;
  used_at?: string | null;
};

export type CouponPayload = {
  title: string;
  description?: string | null;
  code_text?: string | null;
  image_url?: string | null;
  expiration_date?: string | null;
  group_id?: string | null;
};

export type CouponFilters = {
  ownerId: string;
  groupId?: string | null;
  groupIds?: string[];
};
