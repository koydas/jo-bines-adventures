function change_sprite(sprite) {
    sprite_index = sprite;
}

function on_change_sprite_set_image_to_zero()
{
    if !variable_instance_exists(self, "last_sprite") { last_sprite = sprite_index; }
    
    if last_sprite != sprite_index 
    {
       image_index = 0;
       last_sprite = sprite_index;
    }
}


function switch_xscale(_direction) {
    if (_direction == movement_direction.left)
        image_xscale = -abs(image_xscale)
    if (_direction == movement_direction.right)
        image_xscale = abs(image_xscale) 
}

function inverted_switch_xscale(_direction) {
    if (_direction == movement_direction.right)
        image_xscale = -abs(image_xscale)
    if (_direction == movement_direction.left)
        image_xscale = abs(image_xscale) 
}