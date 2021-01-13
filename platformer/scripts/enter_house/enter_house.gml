function enter_house() {
    if !player_inside && keyboard_check_pressed(vk_up)
    {
       enter_house2();
    }
    
    if player_inside && keyboard_check_pressed(vk_down)
    {
        leave_house();
    }
}

function enter_house2()
{
    player_inside = true;
    player.house = self;
    player.camera_locked = true;
        
    camera_set_view_pos(camera, x - 300, 0)
}

function leave_house()
{
    player_inside = false;
    player.house = noone;
    player.camera_locked = false;
}