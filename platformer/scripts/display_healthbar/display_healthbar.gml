// Script assets have changed for v2.3.0 see
// https://help.yoyogames.com/hc/en-us/articles/360005277377 for more information
function display_healthbar() {
    function draw_background() {
        draw_sprite_ext(healthbar_background_sprite,
                    image_id, 
                
                    // position
    				pos_x, 
    				pos_y,
                
                    // ratio
    				sprite_ratio, 
    				sprite_ratio, 
                
    				rotation, 
    				c_white, 
    				opacity);
    }
    
    function draw_filling() {
        draw_sprite_part_ext(healthbar_filling_sprite,
         					 image_id,
                     
                             // position of the crop
        					 filling_x,
        					 pos_y,
                     
                             // crop size
        					 cutted_image_width,
        					 image_height,
                     
                             // position on the screen
        					 pos_x - 5,
        					 pos_y - 3,
                     
                             // ratio
        					 sprite_ratio,
        					 sprite_ratio, 
                     
        					 c_white,
                             opacity);
    }
    
    rotation = 0
    opacity = 1
    pos_x = 25 
    pos_y = 25
    image_id = 0
    sprite_ratio = 0.25

    image_height = sprite_get_height(healthbar_filling_sprite)
    image_width  = sprite_get_width (healthbar_filling_sprite)

    cutted_image_width = image_width * percentage_hp(hp, max_hp)

    filling_x = image_width - cutted_image_width

    draw_filling()
    draw_background()
}