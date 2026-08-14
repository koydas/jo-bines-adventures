function quarter_second() {                return  one_second() / 4 }
function half_second() {                   return  one_second() / 2 }

function one_second() {                    return  1000000 }
function two_seconds() {                   return  2   * one_second() }
function three_seconds() {                 return  3   * one_second() }
function five_seconds() {                  return  5   * one_second() }
function ten_seconds() {                   return  10  * one_second() }
    
function take_hit_cooldown() {             return one_second() }
function attack_cooldown() {               return one_second() }

function attack_is_on_cooldown(timer) {
    return is_on_cooldown(timer, attack_cooldown());
}

function take_damage_is_on_cooldown(timer) {
    return is_on_cooldown(timer, take_hit_cooldown());
}

function is_on_cooldown(timer, cooldown) {
        var is_first_time = timer <= 0;
        var is_in_cooldown = timer_diff(timer) < cooldown;
    
        return !is_first_time && is_in_cooldown;
    }