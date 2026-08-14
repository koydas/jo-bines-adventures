function punch_movement(){
    if current_action != character_action.attack { return; }
            
    var movement = { 
                        _x: 15 * get_direction_multiplier(current_direction),
                        _y: 0
                    }
            
    move_x(movement)
}