-- Optional starter data. Run with: npx wrangler d1 execute shemetz-db --file=./migrations/seed.sql
INSERT INTO sections (name, slug) VALUES
	('קולנוע', 'cinema'),
	('אדריכלות', 'architecture'),
	('פילוסופיה', 'philosophy');
