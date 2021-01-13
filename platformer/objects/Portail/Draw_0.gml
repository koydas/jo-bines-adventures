if !portal_opened && !portal_opening
{
    exit;
}

if portal_opened
{
    change_sprite(portal_sprite);
}

if portal_opening
{
    change_sprite(opening_portal_sprite);
}

draw_self();

