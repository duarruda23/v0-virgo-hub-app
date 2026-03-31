ALTER TABLE users ADD COLUMN IF NOT EXISTS specialty TEXT DEFAULT 'general';
-- specialty values: 'general', 'designer', 'video_editor', 'seller', 'social_media', 'sector_leader'
