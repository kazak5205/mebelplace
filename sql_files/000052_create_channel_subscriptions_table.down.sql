-- Drop channel_subscriptions table

DROP INDEX IF EXISTS idx_channel_subscriptions_channel_level;
DROP INDEX IF EXISTS idx_channel_subscriptions_level;
DROP INDEX IF EXISTS idx_channel_subscriptions_channel_id;
DROP INDEX IF EXISTS idx_channel_subscriptions_user_id;

DROP TABLE IF EXISTS channel_subscriptions;

