function prevent_exit_screen(){
    var camera = view_camera[0];
    
    var viewport_width = camera_get_view_width(camera)
    
    var min_value = clamp(camera_get_view_x(camera), 0, room_width);
    
    var max_value = clamp(min_value + viewport_width, 0, room_width);
    
    x = clamp(x, min_value, max_value);
}