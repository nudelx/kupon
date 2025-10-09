const resolveEnv = (primary: string | undefined, fallback: string | undefined, name: string) => {
  const value = primary ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const supabaseUrl = resolveEnv(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL,
  'VITE_SUPABASE_URL'
);

export const supabaseAnonKey = resolveEnv(
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'VITE_SUPABASE_ANON_KEY'
);
