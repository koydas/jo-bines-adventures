/// @description Run / Dies

is_attacking = current_action == character_action.attack;

prevent_exit_screen();

#region death
    if hp <= 0 dies();
#endregion

character_controls_update();
    
punch_movement()

//character_camera_update()

on_change_sprite_set_image_to_zero();

if global.room_loaded {
    x = respawn_position_x;
    global.room_loaded = false;
}