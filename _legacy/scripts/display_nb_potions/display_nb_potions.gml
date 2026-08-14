function display_nb_potions() {
    
    #region nb of potions (text)
    
    
        var text = string_format(nb_potions, 1, 0)
        var text_x = window_get_width() - 75
        var text_y = 100
    
        write_text(text, text_x, text_y);
    
    #endregion
    #region icon
        var icon_x = text_x - 5;
        var icon_y = text_y;
        var scale = 0.5;
        
        draw_sprite_scale(potion_sprite, icon_x + 25, icon_y, scale, scale);
    
    #endregion
}