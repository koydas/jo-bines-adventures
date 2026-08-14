# Les Aventures de Jo Bine — version web

Portage moderne du jeu GameMaker original (`platformer/`) vers **TypeScript +
[Phaser 3](https://phaser.io)**, pensé pour être jouable directement dans
Safari sur iPhone (tactile, plein écran, "Ajouter à l'écran d'accueil") et
hébergeable facilement sur un serveur privé via Docker.

Le contenu (stats, textes de dialogue en français, positions des décors,
mécaniques de combat/boutique/quête) est repris des scripts et fichiers de
salle du projet GameMaker d'origine — voir les commentaires en tête de
chaque fichier dans `src/`, qui pointent vers le script GML porté.

## Développement

```bash
npm install
npm run dev       # serveur de dev sur http://localhost:5173
npm run build     # type-check + build de production dans dist/
npm run preview   # sert le build de production localement
```

Ouvre `http://localhost:5173` dans un navigateur (ou sur ton iPhone via
l'IP locale de ta machine, ex. `http://192.168.x.x:5173`, en étant sur le
même réseau Wi-Fi) pour tester le jeu.

### Régénérer les sprites depuis le projet GameMaker

Si tu modifies des sprites dans `platformer/` (GameMaker Studio), relance
l'extraction pour synchroniser `public/assets/` :

```bash
python3 scripts/extract_sprites.py
```

## Déploiement sur ton serveur privé (Docker)

```bash
docker compose up -d --build
```

Ça build l'image (Node → build Vite → nginx qui sert les fichiers statiques)
et l'expose sur le port `8080`. Si tu as déjà un reverse proxy (Caddy,
Traefik, nginx) avec HTTPS sur ton serveur, pointe-le vers ce port plutôt
que d'exposer `8080` directement — **HTTPS est nécessaire** pour que
l'installation "Ajouter à l'écran d'accueil" fonctionne bien sur iPhone.

Sans Docker :

```bash
npm run build
# sers le contenu de dist/ avec n'importe quel serveur de fichiers statiques
# (nginx, Caddy, `npx serve dist`, ...)
```

## Jouer sur iPhone

1. Ouvre l'URL du jeu dans Safari.
2. Touche le bouton de partage puis "Sur l'écran d'accueil" pour l'installer
   comme une app (plein écran, sans barre Safari).
3. Les contrôles tactiles (déplacement, potion, attaque/parler) apparaissent
   automatiquement sur les appareils tactiles ; clavier/manette fonctionnent
   aussi sur ordinateur.

## Ce qui est porté / simplifié par rapport à l'original

- **Porté fidèlement** : stats (PV, dégâts, vitesses, cooldowns), textes de
  dialogue et de quête en français, positions des PNJ/portail/boutique,
  mécaniques de combat, de PNJ et de portail.
- **Modernisé** : le rendu de texte utilise une police web plutôt que la
  police bitmap lettre-par-lettre d'origine ; l'entrée dans la boutique
  générale a été simplifiée en un point d'achat direct plutôt que la
  choréographie complète "entrer dans la maison + caméra verrouillée" ;
  les décors (herbe, rochers, arbres) sont replacés de façon procédurale
  plutôt que pixel-perfect par rapport aux fichiers de salle d'origine.
- **À continuer** : `Necromancer` et `Trainer` existent comme sprites/PNJ
  mais n'ont pas de logique de jeu dans le projet GameMaker d'origine non
  plus — ce sont de bons points de départ pour une prochaine quête.
