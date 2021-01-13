function character_controls_create() 
{
    controls_blocked = false

}

function character_controls_update() 
{
    if controls_blocked { return; }
                
    character_check_controls()
    
    character_movement_controls()
    character_action_controls()

}