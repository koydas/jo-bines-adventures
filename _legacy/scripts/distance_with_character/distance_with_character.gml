function distance_with_character() {    
    return abs(global.player.x - x);
}

function is_player_in_range(aggro_range) 
{
    return distance_with_character() <= aggro_range;
}