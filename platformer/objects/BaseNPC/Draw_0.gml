if !in_city() { exit; }

draw_self();

if quest_availaible && discussion_step == 0
{
    var _x = x + 70;
    var _y = y - 100;
    
    draw_sprite2(quest_available_sprite, _x, _y)
}