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

-- 5. Audit Cache Table (Debounce & anti-spam store)
CREATE TABLE IF NOT EXISTS public.audit_cache (
    id BIGSERIAL PRIMARY KEY,
    cache_key TEXT UNIQUE NOT NULL, -- "username:target_type"
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Follows Snapshots Table (Chronological Snapshot Diff Engine)
CREATE TABLE IF NOT EXISTS public.follows_snapshots (
    id BIGSERIAL PRIMARY KEY,
    target_username TEXT NOT NULL,
    target_type TEXT NOT NULL, -- 'following' | 'followers'
    usernames TEXT[] NOT NULL,
    snapshot_count INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tracked Targets (24/7 Automated Radar Monitoring)
CREATE TABLE IF NOT EXISTS public.tracked_targets (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    target_username TEXT NOT NULL,
    target_type TEXT NOT NULL DEFAULT 'following',
    status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'paused'
    frequency_hours INTEGER NOT NULL DEFAULT 12,
    last_scanned_at TIMESTAMP WITH TIME ZONE,
    next_scan_at TIMESTAMP WITH TIME ZONE NOT NULL,
    total_new_follows INTEGER NOT NULL DEFAULT 0,
    total_unfollows INTEGER NOT NULL DEFAULT 0,
    avatar_url TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_tracked_target UNIQUE (user_email, target_username)
);

-- 8. Activity Events (Detected New Follows / Unfollows)
CREATE TABLE IF NOT EXISTS public.activity_events (
    id TEXT PRIMARY KEY,
    target_username TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'NEW_FOLLOW' | 'UNFOLLOW' | 'MUTUAL_CHANGE'
    subject_username TEXT NOT NULL,
    subject_name TEXT,
    subject_avatar TEXT,
    subject_gender TEXT,
    is_brand BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_window_formatted TEXT
);

-- 9. Indexes for ultra-fast Lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_unlocked_audits_user ON public.unlocked_audits(user_email);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON public.search_history(user_email, searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_cache_key ON public.audit_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_follows_snapshots_target ON public.follows_snapshots(target_username, target_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_tracked_targets_due ON public.tracked_targets(status, next_scan_at ASC);
CREATE INDEX IF NOT EXISTS idx_activity_events_target ON public.activity_events(target_username, detected_at DESC);
