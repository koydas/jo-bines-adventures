/// @description 

// Inherit the parent event
event_inherited();

if no_talk || portal_is_open() { exit; }

if discussion_step == 1
{
    sorcier_discussion_step_1();
}

if discussion_step == 2
{
    sorcier_discussion_step_2();
}
    
if discussion_step == 3
{
    sorcier_discussion_step_3();
}

if discussion_step > 3
{
    discussion_step = 0;
}