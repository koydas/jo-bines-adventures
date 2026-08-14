/** Ports get_damage_number.gml (floor(random_range(min, max))). */
export function randomDamage(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min));
}
