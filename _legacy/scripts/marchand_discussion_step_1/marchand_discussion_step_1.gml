function marchand_discussion_step_1() {
    global.player.is_talking = true;
    
    #region show bubble
        var bubble_x = x + 150;
        var bubble_y = y - 400;
    
        draw_sprite_scale(medium_bubble_sprite, bubble_x, bubble_y, 0.7, 0.5);
    #endregion

    #region text
        var text_x = bubble_x;
        var text_y = bubble_y + 40;

        write_text("Bienvenue dans ma boutique Jo Bine !",  text_x, text_y);
        write_text("Va chercher ce que tu as besoin.",  text_x, text_y + 50);
    #endregion 
}