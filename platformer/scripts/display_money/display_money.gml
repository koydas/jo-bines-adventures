function display_money() {
    var text = string_format(money, 5, 0) + "$"
    var _x = window_get_width() - 150
    var _y = 50
    
    write_text(text, _x, _y)
}