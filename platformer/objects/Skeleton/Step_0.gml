// Inherit the parent event
event_inherited();

//todo
// on donne 3 coups, ensuite cooldown de 2 secondes
if attacks_count >= 3
{
    attack_timer  = get_timer();
    attacks_count = 0;
    is_attacking = false;
}

