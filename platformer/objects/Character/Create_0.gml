/// @description variables & functions

persistent = true;

character_camera_create()

character_actions_create()
character_direction_create()
character_controls_create()
character_timers_create()
character_currencies_create()
character_stats_create()

last_sprite = noone

global.player = self;

house = noone;

is_talking = false;

respawn_position_x = x;

global.room_loaded = false;