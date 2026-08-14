function array_next_index(array) {
    if (!is_array(array))  return noone
        
    for (var i = 0; i < array_length(array); i++)
        if (array[i] == noone)
            return i
    
    return noone;
}

function array_insert_next(array, value) {
    var i = array_next_index(array)
    
    if (i == noone) return false
    
    array[i] = value
    
    return true
}