function turn_toward_object(obj) 
{
    var go_left  = obj.x < x;
    var go_right = obj.x > x;
    
    if go_left   { image_xscale =  abs(image_xscale)  }
    if go_right  { image_xscale = -abs(image_xscale)  }
}

function move_toward_object(obj, spd)
{
    turn_toward_object(obj) 
    
    move_towards_point(obj.x,
                       y, 
                       spd);
}

function move_toward_player(spd)
{
    move_toward_object(global.player, spd)
}

function move_toward_player_with_fixed_padding(spd)
{
    move_toward_player_with_padding(spd, 100);
}

function move_toward_player_with_padding(spd, padding)
{
    var distance = abs(x - global.player.x);
    
    if distance < padding {
        spd = 0;
    }
    
    move_toward_player(spd)
}