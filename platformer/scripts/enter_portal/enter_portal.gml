function enter_portal(portal) 
{
    if !portal.portal_opened { exit; }
    
    if in_city()
    {
        respawn_position_x = portal.graveyard_x;
        room_goto(Graveyard);  
    }
        
    if in_graveyard()
    {
        respawn_position_x = portal.city_x;
        room_goto(ville);
    }
    
    // TODO : Go to portal location
}