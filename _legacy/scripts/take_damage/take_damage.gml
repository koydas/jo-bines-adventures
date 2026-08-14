function take_damage(damage) 
{
    if !variable_instance_exists(self, "take_damage_timer") { take_damage_timer = 0; }
    
    if take_damage_is_on_cooldown(take_damage_timer) { return; }
    
    take_damage_timer = get_timer();
    
    take_damage_ignore_timer(damage);
}

function take_damage_ignore_timer(damage)  
{
    if !variable_instance_exists(self, "hp")                            { return; }
    if !variable_instance_exists(self, "take_damage_invisible_timer")   { take_damage_invisible_timer = 0 }
    
    if !is_on_cooldown(take_damage_invisible_timer, quarter_second())
    {
        hp -= damage;
        
        take_damage_invisible_timer = get_timer();
    }
    
}