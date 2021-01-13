function string_trim(_string) 
{
    var new_string = "";
    var length = string_length(_string);
    
    for(var i = 1; i <= length; i++)
    {
        var char = string_char_at(_string, i);
        
        if char != " "
        {
            new_string += char;
        }
    }
    
    return new_string;
}