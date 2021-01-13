function sorcier_discussion_step_2()
{
    global.player.is_talking = true;
    
    var player_bubble_x = global.player.x + 200;
    var player_bubble_y = global.player.y - 200;
    
    var arrow_position_x = player_bubble_x;
    var arrow_position_y = player_bubble_y + (current_discussion_choice * 50);
    

    // bubble
    draw_sprite_scale(small_bubble_sprite, player_bubble_x, player_bubble_y, 2, 0.5);
    
    // cursor
    draw_sprite_scale(discussion_choice_sprite, arrow_position_x, arrow_position_y, 1, 1);

    // text
    write_text(necronomicon__quest.player_answer_1, player_bubble_x, player_bubble_y);
    write_text(necronomicon__quest.player_answer_2, player_bubble_x, player_bubble_y + 50);
}