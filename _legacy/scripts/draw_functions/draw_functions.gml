enum align {
    left = fa_left,
    center = fa_center,
    right = fa_right
}

function get_default_font() {
    return ecriture_de_steph
}

function draw_current_sprite() {
    if (sprite_index > 0) {
        draw_sprite_scale(sprite_index, x, y, image_xscale, image_yscale)
    }
}

function draw_sprite2(sprite, draw_x, draw_y) {
    draw_sprite_scale_rotation(sprite,
                               draw_x,
                               draw_y,
                               1,
                               1,
                               0)
}

function draw_sprite_scale(sprite, draw_x, draw_y, xscale, yscale) {
    _rotation = 0
    
    draw_sprite_scale_rotation(sprite,
                               draw_x,
                               draw_y,
                               xscale,
                               yscale,
                               _rotation)
}

function draw_sprite_rotation(sprite, draw_x, draw_y, rotation) {
    xscale = 1
    yscale = 1
    
    draw_sprite_scale_rotation(sprite,
                               draw_x,
                               draw_y,
                               xscale,
                               yscale,
                               rotation)
}

function draw_sprite_scale_rotation(sprite, draw_x, draw_y, xscale, yscale, rotation){
    _color = c_white
    _subimg = image_index
    _opacity = 1
    
    draw_sprite_ext(sprite,
                    _subimg, 
                    draw_x, 
                    draw_y,
                    xscale,
                    yscale,
                    rotation, 
                    _color,
                    _opacity)
}
