function ennemy_conditions_create()
{
    aggro_range  = 1000;
    attack_range = 300;
    attacks_count = 0;
    player = global.player;
    
    
    walk_speed = 5;
    
    // status
    in_combat = false;
    is_attacking = false;
}

function ennemy_in_combat_update()
{
    in_combat = in_combat || is_player_in_range(aggro_range);
}

function walk_if_player_in_range() 
{
    if !in_combat { return; }
    if  is_player_in_range(attack_range)             { return; }
    
    change_sprite(walk_sprite)
    
    move_toward_player_with_fixed_padding(walk_speed);
}
    
function attack_if_player_in_range() 
{
    if !in_combat                                    { return; }
    if !is_player_in_range(attack_range)             { return; }
    if use_attack_cooldown && is_on_cooldown(attack_timer, ennemy_attack_cooldown) { return; }
    
    is_attacking = true;
    
    change_sprite(attack_sprite);
    
    var attack_speed = walk_speed * 1.25;
    move_toward_player_with_fixed_padding(attack_speed);
}
    
function if_player_is_attacking_takes_damage() 
{
    if player.is_attacking
    {
        var player_damage = get_damage_number_from_object(player);
        
        take_damage_ignore_timer(player_damage);
        
        new_instance_on_front(x, y, CharacterHit);
    }
}
    
function if_hp_is_zero_dies()
{
    if hp <= 0 {
        player.money += money;
        player.experience += experience;
        
        instance_destroy();
    }
}