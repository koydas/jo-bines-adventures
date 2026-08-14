#!/usr/bin/env python3
"""Extract flattened animation frames from a GameMaker .yyp project into
plain numbered PNG sequences, in correct playback order, for use in Phaser.

GameMaker stores one pre-flattened PNG per frame directly under
sprites/<name>/<frame-uuid>.png (composited from that frame's layers), and
duplicates of the same file under sprites/<name>/layers/<frame-uuid>/*.png
for the layer editor. We only want the flattened top-level ones, ordered
the same way the sprite's "frames" array orders them (which is playback
order).
"""
import re
import shutil
import sys
from pathlib import Path

PLATFORMER = Path(__file__).resolve().parents[2] / "platformer"
DEST = Path(__file__).resolve().parents[1] / "public" / "assets"

FRAME_RE = re.compile(r'"name":"([0-9a-fA-F-]{36})","tags":\[\],"resourceType":"GMSpriteFrame"')


def frame_order(sprite_dir: Path) -> list[str]:
    yy = sprite_dir / f"{sprite_dir.name}.yy"
    text = yy.read_text(encoding="utf-8")
    return FRAME_RE.findall(text)


def extract(sprite_name: str, dest_subdir: str, dest_name: str) -> int:
    sprite_dir = PLATFORMER / "sprites" / sprite_name
    order = frame_order(sprite_dir)
    out_dir = DEST / dest_subdir
    out_dir.mkdir(parents=True, exist_ok=True)
    count = 0
    for i, frame_uuid in enumerate(order):
        src = sprite_dir / f"{frame_uuid}.png"
        if not src.exists():
            print(f"  ! missing {src}", file=sys.stderr)
            continue
        dst = out_dir / f"{dest_name}_{i}.png"
        shutil.copyfile(src, dst)
        count += 1
    print(f"{sprite_name} -> {dest_subdir}/{dest_name}_*.png ({count} frames)")
    return count


SPRITES = [
    ("character_idle_sprite", "character/idle", "idle"),
    ("character_run_sprite", "character/run", "run"),
    ("character_punch_sprite", "character/punch", "punch"),
    ("character_hit_sprite", "character/hit", "hit"),
    ("skeleton_idle_sprite", "skeleton/idle", "idle"),
    ("skeleton_walk_sprite", "skeleton/walk", "walk"),
    ("skeleton_attack_sprite", "skeleton/attack", "attack"),
    ("marchand_sprite", "npc", "marchand"),
    ("sorcier_sprite", "npc", "sorcier"),
    ("guard_sprite", "npc", "guard"),
    ("trainer_sprite", "npc", "trainer"),
    ("necromancer_idle_sprite", "npc", "necromancer"),
    ("city_grass_sprite", "env", "city_grass"),
    ("city_rocks_sprite", "env", "city_rocks"),
    ("city_rocks_bg_sprite", "env", "city_rocks_bg"),
    ("city_tree_sprite", "env", "city_tree"),
    ("tuiles_sprite", "env", "tuiles"),
    ("magasin_general_mur_sprite", "env", "magasin_general_mur"),
    ("magasin_general_porte_sprite", "env", "magasin_general_porte"),
    ("magasin_general_sprite", "env", "magasin_general"),
    ("bureau_sprite", "env", "bureau"),
    ("etagere_sprite", "env", "etagere"),
    ("dead_flower_sprite", "env", "dead_flower"),
    ("tomb1_sprite", "env", "tomb1"),
    ("crypt_entrance_sprite", "env", "crypt_entrance"),
    ("closed_gate_sprite", "env", "closed_gate"),
    ("open_gate_sprite", "env", "open_gate"),
    ("sign_sprite", "env", "sign"),
    ("grass_sprite", "env", "grass"),
    ("potion_sprite", "ui", "potion"),
    ("healthbar_background_sprite", "ui", "healthbar_bg"),
    ("healthbar_filling_sprite", "ui", "healthbar_fill"),
    ("price_tag_sprite", "ui", "price_tag"),
    ("small_bubble_sprite", "ui", "small_bubble"),
    ("medium_bubble_sprite", "ui", "medium_bubble"),
    ("large_bubble_sprite", "ui", "large_bubble"),
    ("discussion_choice_sprite", "ui", "discussion_choice"),
    ("quest_available_sprite", "ui", "quest_available"),
    ("buy_background_sprite", "ui", "buy_background"),
    ("selected_sprite", "ui", "selected"),
    ("portal_sprite", "ui", "portal"),
    ("opening_portal_sprite", "ui", "opening_portal"),
]

if __name__ == "__main__":
    if DEST.exists():
        shutil.rmtree(DEST)
    DEST.mkdir(parents=True)
    total = 0
    for sprite_name, dest_subdir, dest_name in SPRITES:
        total += extract(sprite_name, dest_subdir, dest_name)
    print(f"\nTotal frames extracted: {total}")
