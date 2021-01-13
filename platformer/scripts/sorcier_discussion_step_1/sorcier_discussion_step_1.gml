function sorcier_discussion_step_1()
{
    global.player.is_talking = true;
    
    #region show bubble
        var bubble_x = x + 300;
        var bubble_y = y - 400;
    
        draw_sprite2(medium_bubble_sprite, bubble_x, bubble_y);
    #endregion

    #region text
        var text_x = bubble_x;
        var text_y = bubble_y ;

        write_text(necronomicon__quest.salutations,  text_x, text_y);

        text_y += 100;

        write_text(necronomicon__quest.quest_text,  text_x, text_y);
        write_text(necronomicon__quest.quest_text2, text_x, text_y + 35);
        write_text(necronomicon__quest.quest_text3, text_x, text_y + 105);
    #endregion 
}