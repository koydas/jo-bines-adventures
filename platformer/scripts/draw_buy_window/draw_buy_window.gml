function draw_buy_window(items) {
    function draw_background() {
        draw_sprite_scale(buy_background_sprite, 50, 50, .5, .5)
    }

    function draw_buy_commands() {
        draw_text_black("Ctrl pour acheter",   250, 625)
        draw_text_black("Espace pour quitter", 800, 600)
    }

    draw_background()
    draw_buy_commands()
}

