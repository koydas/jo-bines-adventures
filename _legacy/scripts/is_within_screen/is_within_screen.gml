function is_within_screen() {
    return x > 0 && x < room_width;
}

function is_within_object(obj) {
    if obj == noone
    {
        return false;
    }
    
    return place_meeting(x, y, obj);
}

function collides_with_player() {
    return is_within_object(global.player);
}