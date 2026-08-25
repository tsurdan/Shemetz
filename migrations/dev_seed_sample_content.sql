-- LOCAL DEV ONLY sample content, so the homepage has something to show. Not meant for production.
-- Run with: npx wrangler d1 execute shemetz-db --local --file=./migrations/dev_seed_sample_content.sql

INSERT INTO issues (month, year, title, status) VALUES (8, 2026, 'גיליון אוגוסט 2026', 'open');

INSERT INTO users (google_sub, email, name, role) VALUES ('dev-sub-1', 'writer@example.com', 'כותב לדוגמה', 'writer');

INSERT INTO articles (issue_id, author_id, section_id, title, subtitle, body_content, word_count, status, published_at)
VALUES (
	(SELECT id FROM issues ORDER BY id DESC LIMIT 1),
	(SELECT id FROM users WHERE email = 'writer@example.com'),
	(SELECT id FROM sections WHERE slug = 'cinema'),
	'על הקולנוע הישראלי החדש',
	'מבט על השנה האחרונה',
	'<p>זהו תוכן לדוגמה של מאמר בנושא קולנוע, שנועד להדגים איך ייראה מאמר אמיתי בעתיד.</p>',
	42,
	'published',
	datetime('now')
);

INSERT INTO articles (issue_id, author_id, section_id, title, subtitle, body_content, word_count, status, published_at)
VALUES (
	(SELECT id FROM issues ORDER BY id DESC LIMIT 1),
	(SELECT id FROM users WHERE email = 'writer@example.com'),
	(SELECT id FROM sections WHERE slug = 'philosophy'),
	'מהי אמת?',
	NULL,
	'<p>זהו תוכן לדוגמה של מאמר בנושא פילוסופיה.</p>',
	38,
	'published',
	datetime('now')
);
