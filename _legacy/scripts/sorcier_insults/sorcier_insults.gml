// Les actifs du script ont changé pour v2.3.0 Voir
// https://help.yoyogames.com/hc/en-us/articles/360005277377 pour plus d’informations
function sorcier_insults()
{
    var bubble_x = x + 300;
    var bubble_y = y - 50;
    
    draw_sprite_scale(small_bubble_sprite, bubble_x, bubble_y, 2, 0.5);
    
    write_text("Tu es vraiment une couille molle ...",  bubble_x, bubble_y + 25);
}