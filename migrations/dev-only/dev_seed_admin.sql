-- LOCAL DEV ONLY: adds an admin user for testing the approval queue. Never run this against --remote/production.
-- Run with: npx wrangler d1 execute shemetz-db --local --file=./migrations/dev-only/dev_seed_admin.sql
INSERT INTO users (google_sub, email, name, role) VALUES ('dev-sub-admin', 'admin@example.com', 'עורך ראשי', 'admin');
