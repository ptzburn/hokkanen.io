CREATE TABLE `post_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`post_id` integer NOT NULL,
	`s3_key` text NOT NULL,
	`alt` text,
	`width` integer,
	`height` integer,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_post_images_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`slug` text NOT NULL UNIQUE,
	`title` text NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`cover_image_id` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer,
	`author_id` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_posts_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	CONSTRAINT "posts_status_check" CHECK("status" in ('draft', 'published'))
);
--> statement-breakpoint
CREATE INDEX `post_images_postId_position_idx` ON `post_images` (`post_id`,`position`);--> statement-breakpoint
CREATE INDEX `posts_status_publishedAt_idx` ON `posts` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `posts_authorId_idx` ON `posts` (`author_id`);