-- Add free-form notes to beans.

ALTER TABLE beans
  ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
