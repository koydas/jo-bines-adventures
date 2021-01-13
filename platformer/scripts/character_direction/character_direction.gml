function character_direction_create() {
    enum movement_direction {
    	left,
    	right
    }

    current_direction = movement_direction.right
    
    character_direction_create_functions();
}

function character_direction_create_functions() {
    function get_direction_multiplier(_direction)  {
        return _direction == movement_direction.right ? 1 : -1;
    }
}

function character_direction_update() {

}