function sorcier_discussion_step_3 ()
{
    if current_discussion_choice == 0
    {
        open_portal();
    }
    
    if current_discussion_choice == 1
    {
        sorcier_insults();
    }
    
    global.player.is_talking = false;
}