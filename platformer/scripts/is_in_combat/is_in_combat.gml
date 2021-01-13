function is_in_combat()
{
    var i;
    for (i = 0; i < instance_number(Ennemy); i += 1)
    {
        ennemy = instance_find(Ennemy, i);
                
        if ennemy.in_combat 
        {
            if !camera_locked 
            {
                var camera = view_camera[0]
                _x = ennemy.x - camera_get_view_border_x(camera);
                _y = 0;
    
                camera_set_view_pos(camera, _x, _y)    
            }
            
            return true;
        }
    }
    
    
    
    return false;
}

function is_in_house() {
    return house != noone;
}