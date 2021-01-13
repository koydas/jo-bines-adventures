var ennemy = other;

if is_attacking
{
    go_idle();
}

if ennemy.is_attacking 
{
    var ennemy_damage = get_damage_number_from_object(ennemy);
        
    take_damage(ennemy_damage);
}