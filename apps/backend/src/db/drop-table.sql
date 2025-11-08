-- Delete all tables
DROP TABLE IF EXISTS aptos_attestations;
DROP TABLE IF EXISTS aptos_schemas;
DROP TABLE IF EXISTS sui_attestations;
DROP TABLE IF EXISTS sui_schemas;
DROP TABLE IF EXISTS movement_attestations;
DROP TABLE IF EXISTS movement_schemas;
DROP TABLE IF EXISTS aptos_users;
DROP TABLE IF EXISTS sui_users;
DROP TABLE IF EXISTS movement_users;
DROP TABLE IF EXISTS passport_scores;
DROP TABLE IF EXISTS passport_score_history;
DROP TABLE IF EXISTS user_activities;
DROP TABLE IF EXISTS user_protocols;
DROP TABLE IF EXISTS user_transactions;
DROP TABLE IF EXISTS user_social_data;
DROP TABLE IF EXISTS user_badges;
DROP TABLE IF EXISTS protocols;
DROP TABLE IF EXISTS user_attestations;
DROP TABLE IF EXISTS score_cache;
DROP TABLE IF EXISTS data_sync_status;

-- Achievement System Tables
DROP TABLE IF EXISTS data_sync_logs;
DROP TABLE IF EXISTS point_transactions;
DROP TABLE IF EXISTS task_completions;
DROP TABLE IF EXISTS user_task_progress;
DROP TABLE IF EXISTS user_points;
DROP TABLE IF EXISTS data_sources;
DROP TABLE IF EXISTS scheduled_tasks;
DROP TABLE IF EXISTS tasks;
