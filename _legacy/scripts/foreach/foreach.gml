function foreach(items, func) {
    function count(items) {
        if (is_array(items))                    return array_length(items) // Array
        if (ds_exists(items, ds_type_list))     return ds_list_size(items) // DS LIST
        
        throw ("Foreach type not supported")
    }

    function getItem(items, i) {
        if (typeof(items) == "array")       return items[i]                     // Array
        if (ds_exists(items, ds_type_list)) return ds_list_find_value(items, i) // DS LIST
    }

    for (var i = 0; i < count(items); i++) 
        func(getItem(items, i))
}
