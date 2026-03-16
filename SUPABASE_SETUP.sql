-- AURA MVP - Complete Supabase SQL Setup Script
-- Copy and paste this entire script into your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (if re-running script)
-- ============================================
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS action_reactions CASCADE;
DROP TABLE IF EXISTS action_confirmations CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS actions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- CREATE TABLES
-- ============================================

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT UNIQUE NOT NULL,
  avatar_emoji TEXT,
  bio TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  is_private BOOLEAN NOT NULL DEFAULT false,
  aura_total INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  label_key TEXT NOT NULL,
  base_points INTEGER NOT NULL,
  sort_order INTEGER NOT NULL
);

-- Actions table
CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  body TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public',
  status TEXT NOT NULL DEFAULT 'active',
  confirmation_count INTEGER NOT NULL DEFAULT 0,
  aura_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  scored_at TIMESTAMPTZ
);

-- Action confirmations table
CREATE TABLE action_confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(action_id, user_id)
);

-- Action reactions table
CREATE TABLE action_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(action_id, user_id, reaction_type)
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Follows table
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'accepted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inviter_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  aura_bonus INTEGER NOT NULL DEFAULT 50,
  awarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  awarded_at TIMESTAMPTZ
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX idx_profiles_nickname ON profiles(nickname);
CREATE INDEX idx_profiles_aura_total ON profiles(aura_total DESC);

CREATE INDEX idx_actions_user_id ON actions(user_id);
CREATE INDEX idx_actions_category_id ON actions(category_id);
CREATE INDEX idx_actions_created_at ON actions(created_at DESC);
CREATE INDEX idx_actions_expires_at ON actions(expires_at);
CREATE INDEX idx_actions_status ON actions(status);
CREATE INDEX idx_actions_visibility ON actions(visibility);
CREATE INDEX idx_actions_scored_at ON actions(scored_at DESC);

CREATE INDEX idx_action_confirmations_action_id ON action_confirmations(action_id);
CREATE INDEX idx_action_confirmations_user_id ON action_confirmations(user_id);

CREATE INDEX idx_action_reactions_action_id ON action_reactions(action_id);
CREATE INDEX idx_action_reactions_user_id ON action_reactions(user_id);

CREATE INDEX idx_comments_action_id ON comments(action_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_follows_status ON follows(status);

CREATE INDEX idx_referrals_inviter ON referrals(inviter_user_id);
CREATE INDEX idx_referrals_invitee ON referrals(invitee_user_id);
CREATE INDEX idx_referrals_awarded ON referrals(awarded);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);

-- ============================================
-- SEED CATEGORIES
-- ============================================

INSERT INTO categories (slug, label_key, base_points, sort_order) VALUES
  ('help_someone', 'cat_help_someone', 20, 1),
  ('self_improvement', 'cat_self_improvement', 15, 2),
  ('health', 'cat_health', 20, 3),
  ('environment', 'cat_environment', 25, 4),
  ('knowledge', 'cat_knowledge', 15, 5),
  ('kindness', 'cat_kindness', 10, 6);

-- ============================================
-- CREATE FUNCTIONS
-- ============================================

-- Function to increment user aura
CREATE OR REPLACE FUNCTION increment_aura(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET aura_total = aura_total + amount,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to award referral bonus
CREATE OR REPLACE FUNCTION award_referral_bonus(p_inviter_id UUID, p_invitee_id UUID)
RETURNS VOID AS $$
DECLARE
  v_aura_bonus INTEGER := 50;
BEGIN
  -- Update referral record
  UPDATE referrals
  SET awarded = true,
      awarded_at = NOW()
  WHERE inviter_user_id = p_inviter_id
    AND invitee_user_id = p_invitee_id
    AND awarded = false;
  
  -- Award aura to inviter
  IF FOUND THEN
    UPDATE profiles
    SET aura_total = aura_total + v_aura_bonus,
        updated_at = NOW()
    WHERE id = p_inviter_id;
    
    -- Create notification for inviter
    INSERT INTO notifications (user_id, type, data)
    VALUES (
      p_inviter_id,
      'referral_bonus',
      jsonb_build_object('message', 'You earned +50 aura from a referral!', 'bonus', v_aura_bonus)
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update confirmation count when confirmation is added
CREATE OR REPLACE FUNCTION update_confirmation_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action_owner UUID;
  v_category_id UUID;
  v_base_points INTEGER;
BEGIN
  UPDATE actions
  SET confirmation_count = confirmation_count + 1
  WHERE id = NEW.action_id
  RETURNING user_id, category_id INTO v_action_owner, v_category_id;

  SELECT base_points
  INTO v_base_points
  FROM categories
  WHERE id = v_category_id;

  IF v_action_owner IS NOT NULL
     AND v_base_points IS NOT NULL
     AND v_base_points > 0
     AND v_action_owner != NEW.user_id THEN
    UPDATE profiles
    SET aura_total = aura_total + v_base_points,
        updated_at = NOW()
    WHERE id = v_action_owner;
  END IF;
  
  -- Create notification for action owner
  INSERT INTO notifications (user_id, type, data)
  SELECT 
    a.user_id,
    'action_confirmed',
    jsonb_build_object(
      'message', p.nickname || ' confirmed your action',
      'action_id', NEW.action_id,
      'confirmer_id', NEW.user_id
    )
  FROM actions a
  JOIN profiles p ON p.id = NEW.user_id
  WHERE a.id = NEW.action_id
    AND a.user_id != NEW.user_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_confirmation_count
AFTER INSERT ON action_confirmations
FOR EACH ROW
EXECUTE FUNCTION update_confirmation_count();

-- Function to update confirmation count when confirmation is removed
CREATE OR REPLACE FUNCTION decrease_confirmation_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action_owner UUID;
  v_category_id UUID;
  v_base_points INTEGER;
BEGIN
  UPDATE actions
  SET confirmation_count = GREATEST(0, confirmation_count - 1)
  WHERE id = OLD.action_id
  RETURNING user_id, category_id INTO v_action_owner, v_category_id;

  SELECT base_points
  INTO v_base_points
  FROM categories
  WHERE id = v_category_id;

  IF v_action_owner IS NOT NULL
     AND v_base_points IS NOT NULL
     AND v_base_points > 0
     AND v_action_owner != OLD.user_id THEN
    UPDATE profiles
    SET aura_total = GREATEST(0, aura_total - v_base_points),
        updated_at = NOW()
    WHERE id = v_action_owner;
  END IF;
  
  RETURN OLD;
END;
$$;

CREATE TRIGGER trigger_decrease_confirmation_count
AFTER DELETE ON action_confirmations
FOR EACH ROW
EXECUTE FUNCTION decrease_confirmation_count();

-- Function to create notification on new comment
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, data)
  SELECT 
    a.user_id,
    'comment',
    jsonb_build_object(
      'message', p.nickname || ' commented on your action',
      'action_id', NEW.action_id,
      'comment_id', NEW.id
    )
  FROM actions a
  JOIN profiles p ON p.id = NEW.user_id
  WHERE a.id = NEW.action_id
    AND a.user_id != NEW.user_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_on_comment
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION notify_on_comment();

-- Function to create notification on new follow
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, data)
  SELECT 
    NEW.following_id,
    CASE 
      WHEN NEW.status = 'pending' THEN 'follow_request'
      ELSE 'new_follower'
    END,
    jsonb_build_object(
      'message', 
      CASE 
        WHEN NEW.status = 'pending' THEN p.nickname || ' requested to follow you'
        ELSE p.nickname || ' started following you'
      END,
      'follower_id', NEW.follower_id
    )
  FROM profiles p
  WHERE p.id = NEW.follower_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_on_follow
AFTER INSERT ON follows
FOR EACH ROW
EXECUTE FUNCTION notify_on_follow();

-- Function to notify when follow request is accepted
CREATE OR REPLACE FUNCTION notify_on_follow_accept()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    INSERT INTO notifications (user_id, type, data)
    SELECT 
      NEW.follower_id,
      'follow_accepted',
      jsonb_build_object(
        'message', p.nickname || ' accepted your follow request',
        'user_id', NEW.following_id
      )
    FROM profiles p
    WHERE p.id = NEW.following_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_on_follow_accept
AFTER UPDATE ON follows
FOR EACH ROW
EXECUTE FUNCTION notify_on_follow_accept();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Categories policies (read-only for all authenticated users)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Actions policies
CREATE POLICY "Public actions are viewable by everyone"
  ON actions FOR SELECT
  USING (
    visibility = 'public'
    OR user_id = auth.uid()
    OR (
      visibility = 'followers'
      AND EXISTS (
        SELECT 1 FROM follows
        WHERE follower_id = auth.uid()
          AND following_id = actions.user_id
          AND status = 'accepted'
      )
    )
  );

CREATE POLICY "Users can insert own actions"
  ON actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own actions"
  ON actions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own actions"
  ON actions FOR DELETE
  USING (auth.uid() = user_id);

-- Action confirmations policies
CREATE POLICY "Confirmations viewable by everyone"
  ON action_confirmations FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own confirmations"
  ON action_confirmations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own confirmations"
  ON action_confirmations FOR DELETE
  USING (auth.uid() = user_id);

-- Action reactions policies
CREATE POLICY "Reactions viewable by everyone"
  ON action_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own reactions"
  ON action_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON action_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows viewable by everyone"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own follows"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can update own follows"
  ON follows FOR UPDATE
  USING (auth.uid() = following_id OR auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Referrals policies
CREATE POLICY "Referrals viewable by involved users"
  ON referrals FOR SELECT
  USING (auth.uid() = inviter_user_id OR auth.uid() = invitee_user_id);

CREATE POLICY "Users can insert referrals"
  ON referrals FOR INSERT
  WITH CHECK (auth.uid() = invitee_user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Aura MVP database setup complete!';
  RAISE NOTICE 'Categories seeded: 6';
  RAISE NOTICE 'All tables, indexes, and RLS policies created.';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Enable Email Auth in Supabase Dashboard > Authentication > Providers';
  RAISE NOTICE '2. Copy your Supabase URL and anon key';
  RAISE NOTICE '3. Add them to your .env file or deployment environment';
END $$;
