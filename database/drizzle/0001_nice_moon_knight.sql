CREATE TABLE `guild_default_roles` (
	`guild_id` text PRIMARY KEY NOT NULL,
	`role_id` text NOT NULL,
	`set_by` text NOT NULL,
	`set_at` integer NOT NULL
);
