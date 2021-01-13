function get_damage_number(min, max) {
    dmg = random_range(min, max)
    return floor(dmg)
}

function get_damage_number_from_object(obj) 
{
    if !variable_instance_exists(obj, "damage") return;
    
    return get_damage_number(obj.damage.min, obj.damage.max);
}