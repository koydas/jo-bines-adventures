function draw_text_white_right_aligned(string, draw_x, draw_y) {
    
    draw_set_halign(align.right)
    
    draw_text_white(string, draw_x, draw_y)
    
    draw_set_halign(align.left)
}

function draw_text_white_centered(string, draw_x, draw_y) {
    
    draw_set_halign(align.center)
    
    draw_text_white(string, draw_x, draw_y)
    
    draw_set_halign(align.left)
}

function draw_text_white(string, draw_x, draw_y) {
    scale_x = 1
    scale_y = 1
    
    draw_text_white_scaled(string, draw_x, draw_y, scale_x, scale_y)
}

function draw_text_white_scaled(string, draw_x, draw_y, scale_x, scale_y) {
    c1 = c_silver;
    c2 = c_silver;
    c3 = c_silver;
    c4 = c_silver;
    alpha = 1;
    
    draw_set_font(get_default_font())
    
    draw_text_transformed_colour(draw_x, draw_y, string, scale_x, scale_y, 0, c1, c2, c3, c4, alpha);
}

function draw_text_white_scaled_centered(string, draw_x, draw_y, scale_x, scale_y) {
    
    draw_set_halign(align.center)
    
    draw_text_white_scaled(string, draw_x, draw_y, scale_x, scale_y)
    
    draw_set_halign(align.left)
}