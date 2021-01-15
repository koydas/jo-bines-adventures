is_within_object(global.player);

current_discussion_choice = clamp(current_discussion_choice, 0, max_discussion_choices);

no_talk = !collides_with_player();