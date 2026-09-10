-- Media files (avatars, inline article images) stored directly in D1 instead of R2, to avoid R2's
-- mandatory billing/checkout-flow requirement (unlike D1/Workers, R2 needs a payment method on file
-- even for free-tier usage). D1's own limit is 2,000,000 bytes (2MB) per row/BLOB - upload size limits
-- in the app are kept comfortably under that.
CREATE TABLE media_files (
	id TEXT PRIMARY KEY,
	content_type TEXT NOT NULL,
	data BLOB NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
