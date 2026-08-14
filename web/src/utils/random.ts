/** Ports get_damage_number.gml (floor(random_range(min, max))). */
export function randomDamage(min: number, max: number): number {
  // Math.random() is always < 1, so without the +1 this could never
  // actually reach `max` (e.g. min=1, max=3 would only ever roll 1 or 2).
  return Math.floor(min + Math.random() * (max - min + 1));
}
