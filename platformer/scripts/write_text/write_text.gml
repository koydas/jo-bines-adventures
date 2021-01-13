function write_text_scaled(_string, x, y, scale)
{
    _string = string_upper(_string);
    
    define_letters();
    var length = string_length(_string);
    
    var i = 1;
    repeat(length)
    {
        var prev_char = string_char_at(_string, i - 1);
        var char = string_char_at(_string, i);
        
        if prev_char + char == "\n"
        {
            y += sprite_get_height(A) * scale;
            x = 0;
            
            continue;
            
        }
        
        if ds_map_exists(global.Letters, char)
        {
            var _sprite = ds_map_find_value(global.Letters, char);
            
            draw_sprite_scale(_sprite, x, y, scale, scale);
            
            x += (sprite_get_width(_sprite) * scale) / 2;
        }
        
        i++;
    }
}

function write_text(_string, x, y) 
{
    scale_x = 0.5;
    scale_y = 0.5;
    
    write_text_scaled(_string, x, y, scale_x, scale_y);
}

function define_letters() {
    global.Letters = ds_map_create();
    
    global.Letters[? "A"] = A;
    global.Letters[? "B"] = B;
    global.Letters[? "C"] = C;
    global.Letters[? "D"] = D;
    global.Letters[? "E"] = E;
    global.Letters[? "É"] = E_accent_aigue;
    global.Letters[? "Ê"] = E_accent_circonflex;
    global.Letters[? "F"] = F;
    global.Letters[? "G"] = G;
    global.Letters[? "H"] = H;
    global.Letters[? "I"] = I;
    global.Letters[? "J"] = J;
    global.Letters[? "K"] = K;
    global.Letters[? "L"] = L;
    global.Letters[? "M"] = M;
    global.Letters[? "N"] = N;
    global.Letters[? "O"] = O;
    global.Letters[? "P"] = P;
    global.Letters[? "Q"] = Q;
    global.Letters[? "R"] = R;
    global.Letters[? "S"] = S;
    global.Letters[? "T"] = T;
    global.Letters[? "U"] = U;
    global.Letters[? "V"] = V;
    global.Letters[? "W"] = W;
    global.Letters[? "X"] = X;
    global.Letters[? "Y"] = Y;
    global.Letters[? "Z"] = Z;
    
    global.Letters[? " "] = Space;
    
    global.Letters[? "0"] = Number_0;
    global.Letters[? "1"] = Number_1;
    global.Letters[? "2"] = Number_2;
    global.Letters[? "3"] = Number_3;
    global.Letters[? "4"] = Number_4;
    global.Letters[? "5"] = Number_5;
    global.Letters[? "6"] = Number_6;
    global.Letters[? "7"] = Number_7;
    global.Letters[? "8"] = Number_8;
    global.Letters[? "9"] = Number_9;
    
    global.Letters[? "$"] = Dollar_Sign;
    global.Letters[? "?"] = Question_mark;
    global.Letters[? "!"] = Exclamation_mark;
    global.Letters[? "-"] = Tiret;
    global.Letters[? ","] = Virgule;
    global.Letters[? "."] = Point;
}