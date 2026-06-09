-- BeanVault: wishlist_items table for wishlist beans.

CREATE TABLE IF NOT EXISTS wishlist_items (
  id            UUID PRIMARY KEY,
  user_id       UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  roaster       TEXT DEFAULT '',
  country       TEXT NOT NULL DEFAULT '',
  country_code  TEXT NOT NULL DEFAULT '',
  estate        TEXT DEFAULT '',
  variety       TEXT DEFAULT '',
  process       TEXT,
  roast_level   TEXT,
  flavor_notes  TEXT[] DEFAULT '{}',
  price         TEXT DEFAULT '',
  purchase_url  TEXT DEFAULT '',
  reason        TEXT DEFAULT '',
  priority      TEXT NOT NULL DEFAULT 'normal',
  is_deleted    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_updated_at ON wishlist_items(updated_at DESC);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist items"
  ON wishlist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items"
  ON wishlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlist items"
  ON wishlist_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items"
  ON wishlist_items FOR DELETE
  USING (auth.uid() = user_id);
