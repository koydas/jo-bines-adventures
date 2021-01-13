function character_check_controls() {
    npc = instance_place(x, y, BaseNPC);
    collides_with_item = place_meeting(x, y, Item)
    
    collides_with_npc = npc != noone;
    portal = instance_place(x, y, Portail)
    
    collides_with_portal = portal != noone;

    var game_pad_up    = gamepad_axis_value(0, gp_axislv) < -0.5;
    var game_pad_down  = gamepad_axis_value(0, gp_axislv) < -0.5;
    var game_pad_left  = gamepad_axis_value(0, gp_axislh) < -0.5;
    var game_pad_right = gamepad_axis_value(0, gp_axislh) >  0.5;
               
    up_button_pressed                   = keyboard_check_pressed   (vk_up)      || keyboard_check_pressed (ord("W"))            || game_pad_up;
    down_button_pressed                 = keyboard_check_pressed   (vk_down)    || keyboard_check_pressed (ord("S"))            || game_pad_down;
               
    left_button_down                    = keyboard_check           (vk_left)    || keyboard_check         (ord("A"))            || game_pad_left;
    left_button_released                = keyboard_check_released  (vk_left)    || keyboard_check_released(ord("A"))            && !game_pad_left;
        
    right_button_down                   = keyboard_check           (vk_right)   || keyboard_check         (ord("D"))            || game_pad_right;
    right_button_released               = keyboard_check_released  (vk_right)   || keyboard_check_released(ord("D"))            && !game_pad_right;
        
    attack_pressed                      = (keyboard_check_pressed  (vk_control)                                                 || gamepad_button_check_pressed(0, gp_face3))    && !collides_with_item;
    attack_released                     = (keyboard_check_released (vk_control)                                                 || gamepad_button_check_released(0, gp_face3))   && !collides_with_item;
        
    jump_pressed                        = keyboard_check_pressed   (vk_space)                                                   || gamepad_button_check_pressed(0, gp_face1);
        
    use_item_button_pressed             = keyboard_check_pressed   (vk_shift)                                                   || gamepad_button_check_pressed(0, gp_face2);
    
    talk_button_released                = (keyboard_check_released (vk_control)                                                 || gamepad_button_check_released(0, gp_face3))   && collides_with_npc;
    
    buy_item_pressed                    = (keyboard_check_released (vk_control)                                                 || gamepad_button_check_released(0, gp_face3))   && collides_with_item;
    
    enter_portal_pressed                = up_button_pressed && collides_with_portal;
}

function character_movement_controls() 
{
    if is_talking && collides_with_npc
    {
        if up_button_pressed   {  npc.current_discussion_choice--; /* prev discussion choice */ }
        if down_button_pressed {  npc.current_discussion_choice++;    /* next discussion choice */ }
        
        return;
    }
    
    if left_button_released || right_button_released                go_idle();

    if left_button_down                                             move_left();
    if right_button_down                                            move_right(); 
}

function character_action_controls()
{
    if enter_portal_pressed
    {
        enter_portal(portal);
        
        return;
    }
    
    if in_city() {
        if talk_button_released    {        talk(npc);            }
        if buy_item_pressed        {        buy(Potion);          }        
        
        return;
    }
    
    if      attack_pressed          {       punch();              }
    else if use_item_button_pressed {       drink_potion();       }
    
    //if jump_pressed                                                 jump();
}