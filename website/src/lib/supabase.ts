/**
 * Supabase Database Client & Sync Helper
 * Automatically active if NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY are set.
 */

export interface SupabaseConfig {
  url?: string;
  key?: string;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && url.startsWith("https://"));
}

/**
 * Execute Supabase REST query using standard fetch (serverless-compatible, zero heavy dependencies)
 */
export async function supabaseQuery<T = any>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<{ data: T | null; error: string | null }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { data: null, error: "Supabase not configured in environment variables" };
  }

  try {
    const fullUrl = `${url.replace(/\/$/, "")}/rest/v1/${endpoint.replace(/^\//, "")}`;
    const res = await fetch(fullUrl, {
      method: options.method || "GET",
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!res.ok) {
      const errText = await res.text();
      return { data: null, error: `Supabase error (${res.status}): ${errText}` };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || "Network error querying Supabase" };
  }
}
