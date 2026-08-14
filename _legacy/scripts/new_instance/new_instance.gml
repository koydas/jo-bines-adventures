function new_instance(x, y, obj) 
{
    return instance_create_layer(x, y, "Instances", obj)
}

function new_instance_on_front(x, y, obj) 
{
    return new_instance_depth(x, y, obj, -1000);
}

function new_instance_depth(x, y, obj, depth) 
{
    return instance_create_depth(x, y, depth, obj);
}

