-- Initial schema: users, sections, issues, articles, subscribers.
-- Run with: npx wrangler d1 execute shemetz-db --file=./migrations/0001_init.sql (add --remote for production)

CREATE TABLE users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	google_sub TEXT NOT NULL UNIQUE,
	email TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	avatar_url TEXT,
	role TEXT NOT NULL DEFAULT 'writer' CHECK (role IN ('writer', 'admin')),
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sections (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	slug TEXT NOT NULL UNIQUE
);

CREATE TABLE issues (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	month INTEGER NOT NULL,
	year INTEGER NOT NULL,
	title TEXT NOT NULL,
	status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'published')),
	published_at TEXT,
	pdf_url TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	UNIQUE (month, year)
);

CREATE TABLE articles (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	issue_id INTEGER NOT NULL REFERENCES issues(id),
	author_id INTEGER NOT NULL REFERENCES users(id),
	section_id INTEGER NOT NULL REFERENCES sections(id),
	title TEXT NOT NULL,
	subtitle TEXT,
	body_content TEXT NOT NULL DEFAULT '',
	word_count INTEGER NOT NULL DEFAULT 0,
	status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'unpublished')),
	rejection_note TEXT,
	cover_image_url TEXT,
	pdf_url TEXT,
	share_image_url TEXT,
	submitted_at TEXT,
	published_at TEXT,
	unpublished_at TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE subscribers (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email TEXT NOT NULL UNIQUE,
	confirmed INTEGER NOT NULL DEFAULT 0,
	confirm_token TEXT,
	unsubscribe_token TEXT NOT NULL,
	subscribed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_articles_issue_id ON articles(issue_id);
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_section_id ON articles(section_id);
CREATE INDEX idx_articles_status ON articles(status);
