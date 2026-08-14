#region functions 
    function throw_fireball() {
        if (!is_on_cooldown(last_fireball_timer, fireball_cooldown())) {
            spell = instance_create_layer(x + sprite_width/2, y, "Instances", Fireball)
        	spell.projectile_direction = current_direction
    	
            last_fireball_timer = get_timer()
        }
    }
#endregion

switch(current_action) {
		case character_action.cast                  :   throw_fireball()
			                                            go_pushback()
                                                        exit
                                                        break
		
        case character_action.attack                :   attack_timer = 0
                                                        break
		
        case character_action.pushback              :   if (current_direction == movement_direction.right) { x -= 50 }
			                                            if (current_direction == movement_direction.left)  { x += 50 }        
                                                        break
        case character_action.talk                  :   exit
        case character_action.flying_kick           :   exit
}

go_idle()
image_index = 0