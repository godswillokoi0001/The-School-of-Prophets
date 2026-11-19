import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function supabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getServiceRoleKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SERVICE_ROLE_KEY
  );
}

export async function createSupabaseServer(): Promise<SupabaseClient | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
    return null;
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) =>
              store.set(name, value, options),
            );
          } catch {
            // server components cannot set cookies; middleware refreshes
          }
        },
      },
    },
  );
}

let serviceClient: SupabaseClient | null = null;
let lastUsedKey: string | null = null;

export function getServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = getServiceRoleKey();
  const key = serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!serviceClient || lastUsedKey !== key) {
    serviceClient = createClient(
      url,
      key,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    lastUsedKey = key;
  }
  return serviceClient;
}

export async function getAdminClient(): Promise<SupabaseClient | null> {
  // If service role key is available, it has full bypass access
  const serviceKey = getServiceRoleKey();
  if (serviceKey) {
    const svc = getServiceClient();
    if (svc) return svc;
  }

  // Fallback to authenticated user client via request cookies (Next.js 15 Server Components)
  try {
    const userClient = await createSupabaseServer();
    if (userClient) {
      const {
        data: { user },
      } = await userClient.auth.getUser();
      if (user) return userClient;
    }
  } catch {
    // cookies() unavailable in non-request contexts
  }

  return getServiceClient();
}
