ALTER TABLE `post_images` ADD `is_cover` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `post_images_one_cover_per_post_idx` ON `post_images` (`post_id`) WHERE "post_images"."is_cover" = 1;--> statement-breakpoint
ALTER TABLE `posts` DROP COLUMN `cover_image_id`;