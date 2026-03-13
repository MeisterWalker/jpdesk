-- Add user_id column to notes and canned_responses
ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE canned_responses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user', -- 'admin' or 'user'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: notes — users see only their own
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notes_policy ON notes;
CREATE POLICY notes_policy ON notes
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS: canned_responses — users see only their own
ALTER TABLE canned_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS scripts_policy ON canned_responses;
CREATE POLICY scripts_policy ON canned_responses
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS: brand_info — everyone can read, only admin can write (handled in app)
ALTER TABLE brand_info ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS brand_info_read ON brand_info;
CREATE POLICY brand_info_read ON brand_info FOR SELECT USING (true);
DROP POLICY IF EXISTS brand_info_write ON brand_info;
CREATE POLICY brand_info_write ON brand_info FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS: profiles — users can read all, update own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_read ON profiles;
CREATE POLICY profiles_read ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS profiles_update ON profiles;
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (id = auth.uid());
DROP POLICY IF EXISTS profiles_insert ON profiles;
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add seeded flag to profiles so auto-copy only runs once per user
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS seeded BOOLEAN DEFAULT FALSE;

-- Allow users to update their own seeded flag
DROP POLICY IF EXISTS profiles_update ON profiles;
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (id = auth.uid());
