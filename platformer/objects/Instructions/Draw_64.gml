/// @description 
var instruction_attack = "Pour attaquer ou parler appuyez sur ctrl"; 
var instruction_drink  = "Pour boire une potion appuyez sur shift"; 
var instruction_enter  = "Pour entrer dans une porte appuyez sur la fleche du haut"; 
var instruction_ready = "Lorsque vous etes prets appuyez sur ctrl ou espace"; 

write_text(instruction_attack, x, y      )
write_text(instruction_drink,   x, y + 50 )
write_text(instruction_enter,   x, y + 100 )
write_text(instruction_ready,  x, y + 300)