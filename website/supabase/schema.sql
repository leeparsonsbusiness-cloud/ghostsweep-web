-- ==============================================================================
-- GhostSweep Supabase / PostgreSQL Production Schema
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    stripe_customer_id TEXT,
    plan TEXT NOT NULL DEFAULT 'free', -- 'free', 'standard' ($3.99/mo), 'unlimited' ($9.99/mo)
    searches_this_month INTEGER NOT NULL DEFAULT 0,
    searched_accounts TEXT[] DEFAULT '{}',
    search_month_reset TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Unlocked Audits Table
CREATE TABLE IF NOT EXISTS public.unlocked_audits (
    id BIGSERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    target_username TEXT NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_target UNIQUE (user_email, target_username)
);

-- 4. Search & Audit History Table
CREATE TABLE IF NOT EXISTS public.search_history (
    id BIGSERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    target_username TEXT NOT NULL,
    target_avatar TEXT,
    target_name TEXT,
    is_unlocked BOOLEAN DEFAULT FALSE,
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Audit Cache Table (Stores Instagram Scraper responses to save Apify compute)
CREATE TABLE IF NOT EXISTS public.audit_cache (
    id BIGSERIAL PRIMARY KEY,
    cache_key TEXT UNIQUE NOT NULL, -- "username:target_type"
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Indexes for ultra-fast Lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_unlocked_audits_user ON public.unlocked_audits(user_email);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON public.search_history(user_email, searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_cache_key ON public.audit_cache(cache_key);
