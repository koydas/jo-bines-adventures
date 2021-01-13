/// @description 
if sprite_index == noone { exit; }

draw_self();

//draw price tag
draw_sprite_scale(price_tag_sprite, x, y, 1, 1);
write_text_scaled("5$", x, y + 20, .4);

if bubble_show
{
    var bubble_scale = 1.2;
    var bubble_x = x - 100;
    var bubble_y = y - 300;
    var text_x = bubble_x;
    var text_y = bubble_y;
        
    //var price_string = string_format2(price);
    
    draw_sprite_scale(small_bubble_sprite, bubble_x, bubble_y, bubble_scale, bubble_scale);
    
    write_text("Une potion de sante,", text_x, text_y)
    write_text("va te redonner tous", text_x, text_y + 50)
    write_text("tes points de vie", text_x, text_y + 100)
    //write_text("coute " +  price_string + "$",  text_x, text_y + 100);
    
    //var controls_x = text_x - 25;
    
    //write_text("Ctrl       Acheter",               controls_x, text_y + 100);
    //write_text("Alt        Acheter Tous",          controls_x, text_y + 50);
    //write_text("Espace     Quitter",   controls_x, text_y + 125);
}
