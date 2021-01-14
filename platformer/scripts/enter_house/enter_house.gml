function enter_house(house) {
    if !house.player_inside && keyboard_check_pressed(vk_up)
    {
       enter_house2(house);
    }
    
    if house.player_inside && keyboard_check_pressed(vk_down)
    {
        leave_house(house);
    }
}

function enter_house2(house)
{
    house.player_inside = true;
    house.player.house = house;
    house.player.camera_locked = true;
        
    camera_set_view_pos(house.camera, x - 300, 0)
}

function leave_house(house)
{
    house.player_inside = false;
    house.player.house = noone;
    house.player.camera_locked = false;
}