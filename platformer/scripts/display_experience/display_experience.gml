function display_experience() {
    var text = string_format(experience, 5, 0) + "xp"
    var _x = window_get_width() - 150
    var _y = 25
    
    write_text(text, _x, _y)
}