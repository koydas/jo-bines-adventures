function draw_text_black_right_aligned(string, draw_x, draw_y) {
    
    draw_set_halign(align.right)
    
    draw_text_black(string, draw_x, draw_y)
    
    draw_set_halign(align.left)
}

function draw_text_black_centered(string, draw_x, draw_y) {
    
    draw_set_halign(align.center)
    
    draw_text_black(string, draw_x, draw_y)
    
    draw_set_halign(align.left)
}

function draw_text_black(string, draw_x, draw_y) {
    scale_x = 1
    scale_y = 1
    
    draw_text_black_scaled(string, draw_x, draw_y, scale_x, scale_y)
}

function draw_text_black_scaled(string, draw_x, draw_y, scale_x, scale_y) {
    c1 = 0
    c2 = 0
    c3 = 0
    c4 = 0
    alpha = 1
    
    draw_set_font(get_default_font())
    
    draw_text_transformed_colour(draw_x, draw_y, string, scale_x, scale_y, 0, c1, c2, c3, c4, alpha);
}

function draw_text_black_scaled_centered(string, draw_x, draw_y, scale_x, scale_y) {
    
    draw_set_halign(align.center)
    
    draw_text_black_scaled(string, draw_x, draw_y, scale_x, scale_y)
    
    draw_set_halign(align.left)
}