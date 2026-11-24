# PDF remplissable (formulaire AcroForm)

Un PDF « AcroForm » contient de vrais champs : on clique dans une case de registre, on tape,
on coche, on enregistre. Il s'ouvre dans Adobe Acrobat Reader, Edge, Chrome, Firefox et la
plupart des lecteurs. Les champs sont **transparents** : le PDF imprimé vierge est identique au
PDF classique, et une feuille remplie à l'écran s'imprime avec le texte saisi en marine.

## Produire : c'est automatique

**Règle de la maison : tous les PDF produits sont remplissables**, pour qu'on puisse compléter
un formulaire, un registre ou une fiche à l'écran sans le réimprimer. `pdf.js` pose les champs
sans option :
```
node "<skill>/scripts/pdf.js" "<page>.html" "<Nom final>.pdf"
node "<skill>/scripts/pdf.js" "<dossier>/mase-02-competences.html" "<sortie>.pdf" --site=<id>
```
Le script annonce le nombre de champs posés (zones de texte, cases à cocher). Un document sans
zone à remplir reste un PDF normal. La bibliothèque pdf-lib s'installe toute seule au premier
usage sur un poste (`npm install` dans `<skill>/scripts/formulaire`).

PDF « papier » uniquement, sur demande expresse : ajouter `--sans-formulaire`.

## Ce qui devient un champ, sans rien annoter

| Zone imprimée | Champ |
|---|---|
| Cellule **vide** d'un tableau (`rx-table`, registres, grilles, matrices) | texte ; sur plusieurs lignes si la cellule fait plus de 9 mm de haut |
| Cellule vide étroite ou centrée (`td.c` : OK / Écart / SO, oui / non) | case à cocher |
| `.ms-ligne` vide, `.pr-champ`, `.fr-sig-case`, `.ms-score-box` vide, ligne d'un encadré `ms-urgences .vide` | texte sur une ligne |
| Cadre de `.ms-signatures`, zone pointillée `.ms-zone` vide | texte sur plusieurs lignes, sous le libellé |
| `.ms-case`, ligne de `.pr-check` (hors `pr-cas`) | case à cocher |

Une cellule ou une ligne **déjà remplie** (texte imprimé) n'est pas un champ.
Le corrigé d'un quiz (`.ms-corrige`) n'en contient jamais.

Noms des champs : `P<page> <sous-titre> | <libellé ou en-tête de colonne> <ligne>`, par exemple
`P2 1 · Grille d'audit terrain SSE | Observation EPI portés`. Ils servent à relire un PDF retourné
champ par champ (pdf-lib, Acrobat « Exporter les données »).

## Forcer ou exclure

- Forcer un champ sur n'importe quel élément : `data-champ="Nom du champ"` (texte) ou
  `data-champ="Nom" data-champ-type="case"`.
- Exclure un élément et son contenu : `data-champ="non"` (par exemple un tableau d'exemple
  laissé vide exprès).

## Limites à connaître

- Saisie en Helvetica 10 pt (9 pt sur plusieurs lignes) : la police du formulaire est celle que
  tous les lecteurs savent afficher, pas Work Sans.
- Une signature saisie au clavier n'est pas une signature électronique : pour un document à
  valeur de preuve (prise en compte des consignes, acte de sous-délégation), imprimer et signer,
  ou passer par l'outil de signature de l'agence.
- Si le texte tapé est plus long que la case, il défile dans le champ mais sera coupé à l'impression.
