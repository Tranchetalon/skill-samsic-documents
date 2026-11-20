# Charte graphique SAMSIC Sécurité

Tout est déjà codé dans `socle/` : cette page sert à comprendre ce qu'on obtient et à ne pas
le contredire en rédigeant.

## Format

- A4 portrait, marges intérieures 7 mm, **hauteur fixe** : une `div.doc-page.fr-page` = une feuille.
- Exception : la synthèse client d'un REX est une slide 16:9 (1280 × 720 px, 13,33 × 7,5 in).
- Fond de feuille gris très clair dégradé, cartes blanches à coins arrondis (3 mm) et ombre légère.

## Couleurs

Deux couleurs de marque, le reste vient de nuances (`color-mix`) de ces deux-là :

| Rôle | Valeur | Variable |
|---|---|---|
| Marine SAMSIC (dominante) | `#22344A` | `--dom` |
| Bleu SAMSIC (accent) | `#0083BE` | `--acc` |
| Bleu ciel (sur fond marine) | `#6FC1EA` | (en dur dans le CSS) |
| Texte courant | `#4A5C74` · fort `#2b3641` | |

Familles utilisées par `data-famille` sur `<body>` :

| Famille | Usage | Dominante | Accent |
|---|---|---|---|
| `consigne` | consignes RH, prévention | marine | bleu |
| `rex` | retours d'expérience | marine | bleu |
| `mase` | classeur SSE, cahier de consignes de site | marine | bleu |
| `exploitation` | fiche réflexe « Vie du poste » | marine `#22344A` | or `#C9A227` |
| `rh` | fiche réflexe « Démarches RH » | bleu `#3D6491` | or `#D9943F` |
| `equipement` | fiche réflexe « Tenue & matériel » | brun `#7A3B2E` | or `#D9A441` |
| `sante` | fiche réflexe « Santé & arrêts » | vert `#1F5F45` | or `#D4A544` |
| `incident` | fiche réflexe ou consigne « Incidents & urgences » | rouge `#8C2F26` | or `#E0A33C` |

Les étapes numérotées prennent `--et-1` … `--et-6` dans l'ordre (aplats accordés à la famille,
texte blanc lisible). Familles marine/bleu : elles alternent marine et bleu.

Exceptions admises, et seulement celles-là :
- rouge `#A4453A` pour une étape ou une tuile de **danger** (feu, explosion, « je me mets à l'abri ») ;
- l'échelle d'évaluation des REX : vert *Acquis*, ambre *En cours d'acquisition*, rouge *Non acquis* ;
- les encadrés « Je fais » (vert) / « Je ne fais pas » (rouge) ;
- l'encart ambré « Points de vigilance » des fiches réflexes.

## Typographie

- Titres : **Bricolage Grotesque** 800, en capitales (titre de page, titres d'étapes, sections).
- Texte : **Work Sans**, 10 à 11 px imprimés. Jamais en dessous de 8,5 px (notes, légendes).
- Les polices sont embarquées (`socle/fonts`) : le rendu est identique sans connexion.

## Habillage posé automatiquement par `procedure.js`

- **En-tête** (`<header data-entete>`) : titre du document (`data-titre` du body), sous-titre en
  couleur d'accent (`data-soustitre`), filet, résumé facultatif (`data-resume`) ; à droite le
  **cartouche** marine avec le logo SAMSIC Sécurité et la signature
  « Sécurité · Rigueur · Professionnalisme ». Sur les feuilles suivantes, « (suite) » s'ajoute au
  titre (masqué pour REX et classeur, dont chaque page a son propre sous-titre).
- **Bandeau de clôture** (`<div data-bandeau>`) : bloc marine, bouclier à gauche, deux lignes.
  Par défaut « La sécurité, c'est l'affaire de tous. / Ensemble, restons vigilants ! » ;
  personnalisable avec `data-l1` et `data-l2`. Un par document, sur la dernière feuille (ou sur
  une feuille de conduite à tenir dans un cahier de consignes).
- **Pied** (`<footer data-pied>`) : provenance de l'agence · famille ou `data-libelle` (+ `data-site`)
  · « Page x / y » (si plusieurs feuilles) · « Mise à jour JJ/MM/AAAA » (`data-maj`) ; puis les
  agréments CNAPS et l'article L612-14 du CSI.
- **Icônes** : `<i data-ic="nom"></i>` devient l'icône SVG au trait (couleur du texte).
- **Logo hors cartouche** : `<img data-logo alt="SAMSIC Sécurité">` (couvertures, intercalaires).
- **Contrôle de débordement** : bandeau rouge « CONTENU TROP LONG » sur toute feuille trop pleine.

## Ce qui donne « l'air SAMSIC » (à respecter en composant)

- Titre court et direct, en capitales, souvent un **message** plutôt qu'un intitulé
  (« RCR : posez vos repos », « Incivilités : appeler le 17 »).
- Des **cartes numérotées** pour tout ce qui est une suite de gestes.
- Une icône par carte, cohérente avec le geste.
- Un **message fort** (encadré `pr-fort`) pour l'objection du terrain ou la règle absolue.
- Une fin de document qui « claque » : le bandeau avec une phrase-choc.
- Beaucoup d'air, mais pas de feuille à moitié vide : le bas de feuille (bandeau + pied) est
  poussé en bas par `<div class="pr-ressort"></div>`.
