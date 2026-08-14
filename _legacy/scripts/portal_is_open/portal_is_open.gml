function portal_is_open()
{
    var portal = instance_find(Portail, 0);
    return portal.portal_opened;
}