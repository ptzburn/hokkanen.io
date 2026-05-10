ALTER TABLE `posts` ADD `word_count` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
-- Backfill word_count for existing rows. SQLite has no native word-count
-- function; this approximates words = whitespace_runs + 1 by counting
-- whitespace chars (spaces, tabs, newlines) on trimmed content. Re-saving
-- a post recomputes precisely via the JS path (countWords).
UPDATE `posts`
SET `word_count` = max(
  1,
  length(trim(`content`))
    - length(
        replace(
          replace(
            replace(trim(`content`), x'0a', ''),
            x'09',
            ''
          ),
          ' ',
          ''
        )
      )
    + 1
);
