function character_actions_create() {
    original_y = y
    
    character_action = {
        idle: "idle",
        run: "run",
        attack: "attack",
        cast: "cast",
        pushback: "pushback",
        roll: "roll",
        talk: "talk",
        jump: "jump",
        flying_kick : "flying kick"
    }
    
    current_action = character_action.idle
        
    character_actions_create_functions()
        
    portal = noone;
}

function character_actions_create_functions() {
    character_movement_functions();
    
    function talk(npc) {
        npc.discussion_step++;
    }
    
    function punch() {
        if attack_is_on_cooldown(attack_timer) return;
        
        current_action = character_action.attack;
        change_sprite(character_punch_sprite);
    }
    
    function drink_potion() {
        if nb_potions <= 0 { return; }
        nb_potions--;
        hp = max_hp;
    }
    
    function buy(_item) {
        if house == noone ||    // Ça veut dire qu'il n'est pas dans une boutique
            money < _item.price 
        {
            return;
        }
    
        money -= _item.price;
        nb_potions++;
    }
        
    function go_idle() {
        y = original_y
    
    	current_action = character_action.idle
    	change_sprite(character_idle_sprite)
    }
    
    
    function get_hit(ennemy) {
        if (!is_on_cooldown(take_hit_timer, take_hit_cooldown())) { 
            take_hit_timer = get_timer()
        
            player_take_damage(self,
                               ennemy,
                               get_damage_number(ennemy.damage_min,
                                                 ennemy.damage_max))
        }    
    }
        
    function dies() {
        if !debug_mode {
            instance_destroy()
        }
    }
    
}

function character_movement_functions() 
{
    function move_left()  { move(movement_direction.left)  }
    function move_right() { move(movement_direction.right) }

    function move(direction) {
        if current_action == character_action.attack                   return;
            
        current_direction = direction;

        var before_speed_applied_x = x;
        
        switch(direction) {
            case movement_direction.left:  x -= run_speed; image_xscale = -abs(image_xscale); break;
            case movement_direction.right: x += run_speed; image_xscale =  abs(image_xscale); break;
        }

        switch (current_action)
        {
            case character_action.jump:   break;
            case character_action.attack: break;
                
            case character_action.idle: current_action = character_action.run;
            default: change_sprite(character_run_sprite);
        }
        
        if !is_within_screen() {
            x = before_speed_applied_x;
        }
        
        if house != noone && !is_within_object(house) {
            if x < house.x
            {
                x = house.bbox_left;
            }
            else {
                x = house.bbox_right;
            }
        }
    }
}

