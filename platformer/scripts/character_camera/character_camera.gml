function character_camera_create() {
    camera_locked = true;
    
    camera = view_camera[0];
    camera_speed = 30;
    
    camera_left_offset  = 400;
    camera_right_offset = window_get_width() + 100;
    
    character_set_camera_default_position();
    
    camera_border_x = camera_get_view_border_x(camera);
    camera_border_y = camera_get_view_border_y(camera);
}

function character_camera_update() {
    camera_locked = is_in_combat() || is_in_house() && camera_locked;
    
    var border_x = camera_locked 
                    ? 0
                    :camera_border_x;
        
    camera_set_view_border(camera,
                            border_x,
                            camera_border_y);
    
    
    return;
    
    // SH camera custom : ne fonctionne pas bien
    var char_x_with_offset_right = x - camera_left_offset;
    var char_x_with_offset_left  = x - camera_right_offset;
    
    var move_cam_right = camera_x < char_x_with_offset_right  && current_direction == movement_direction.right;
    var move_cam_left  = camera_x > char_x_with_offset_left   && current_direction == movement_direction.left;
    
    if !move_cam_right && !move_cam_left { return;}
    
    var cam_diff = abs(camera_x - x);
    
    if move_cam_right {
        if cam_diff <= camera_left_offset + camera_speed { camera_x = char_x_with_offset_right; }
        else                                             { camera_x += camera_speed;            }
    }

    if move_cam_left {
        if cam_diff >= camera_right_offset - camera_speed { 
            camera_x = char_x_with_offset_left; 
            }
        else                                              {
            camera_x -= camera_speed;         
            }
    }
    
    camera_set_view_pos(camera, camera_x, camera_y)
}

function character_set_camera_default_position() {
    camera_y = 0;
    camera_x = x - camera_left_offset;
    
    camera_set_view_pos(camera, camera_x, camera_y)
}

