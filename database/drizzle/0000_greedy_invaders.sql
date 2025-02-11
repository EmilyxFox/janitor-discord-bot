CREATE TABLE `spoiler_enforced_channels` (
	`channel_id` text PRIMARY KEY NOT NULL,
	`set_by` text NOT NULL,
	`set_at` integer NOT NULL
);
