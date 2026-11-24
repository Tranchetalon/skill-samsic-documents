# Catalogue des composants

Tous ces blocs existent déjà dans `socle/css`. On compose avec eux ; on n'en invente pas.
Les modèles (`modeles/`) en contiennent un exemple prêt à copier.

## Squelette d'une page HTML

```html
<body data-famille="consigne" data-titre="Titre" data-maj="20/11/2026">   <!-- + data-libelle, data-site, data-doc="site" -->
<div class="pr-doc fr-doc">
  <div class="doc-page fr-page">          <!-- une feuille A4 -->
    <div class="fr-frame">
      <header data-entete data-soustitre="Sous-titre" data-resume="Résumé facultatif"></header>
      … contenu …
      <div class="pr-ressort"></div>        <!-- pousse bandeau + pied en bas -->
      <div data-bandeau data-l1="Phrase-choc" data-l2="Le geste"></div>   <!-- facultatif -->
      <footer data-pied></footer>
    </div>
  </div>
</div>
<script src="socle/js/icones.js"></script>
<script src="socle/js/logo-b64.js"></script>
<script src="socle/js/agence.js"></script>
<script src="socle/js/procedure.js"></script>
```
CSS à charger, dans l'ordre : `fonts`, `doc`, `fiche-reflexe`, `procedure`, puis selon le type
`rex` (REX, cahier, classeur), `mase` (cahier, classeur), `consignes-site` (cahier).

## Structure et titres

| Bloc | Usage |
|---|---|
| `<div class="pr-section"><i data-ic="…"></i> Titre</div>` | titre de section (capitales, filet dégradé) |
| `.fr-declencheur` > `.fr-declencheur-lab` « Quand ? » + `.fr-declencheur-txt` | situation déclenchante |
| `p.rx-txt` / `p.ms-txt` | paragraphe courant (REX / classeur) |
| `p.ms-note` | note en petit italique gris |

## Étapes numérotées

```html
<div class="fr-etapes">
  <div class="fr-etape" style="--et:var(--et-1)">             <!-- --et-1 … --et-6, ou #A4453A pour un danger -->
    <div class="fr-etape-num"><span class="fr-etape-pastille">1</span></div>
    <div class="fr-etape-txt">
      <div class="fr-etape-titre"><span class="fr-etape-ic"><i data-ic="telephone"></i></span><span>Appelez le 17</span></div>
      <div class="fr-etape-desc">Deux phrases au plus.</div>
      <div class="fr-etape-meta"><span class="fr-meta delai"><span class="fr-meta-lab">Délai</span> 48 h</span></div>
    </div>
    <div class="fr-etape-vignette"><i data-ic="telephone"></i></div>  <!-- ou pr-gros-num / pr-date / pr-qr -->
  </div>
</div>
```
- Carte haute avec liste, capture ou QR : ajouter `pr-large` à `fr-etape`.
- Liste dans une carte : `ul.pr-liste`. Capture : `img.pr-capture` (+ `moyen`) et `div.pr-capture-legende`.
- Gros chiffre : `<div class="pr-gros-num"><i data-ic="telephone"></i>17</div>`.
- Date butoir : `<div class="pr-date"><b>31</b><span>mai</span></div>`.
- QR : `<div class="pr-qr"><img src="img/qr.png" alt=""><span>Scanner</span></div>`.
- Pastilles quoi/où/quand : `<div class="pr-chips"><span class="pr-chip">Incendie</span>…</div>`.
- Mots à taper (URL, numéro) : `<span class="pr-url">guardtek.fr</span>`.

## Encadrés

| Bloc | Usage |
|---|---|
| `.pr-fort` > `.pr-fort-ic` + `.pr-fort-txt` (`b.titre`) | message fort : objection du terrain, règle couperet, résultat global |
| `.pr-tuiles` > `.pr-tuile` (`style="--t:var(--et-1)"`, `pleine` = 2 colonnes) > `.pr-tuile-ic` + `.pr-tuile-titre` + `.pr-tuile-txt` | « Pourquoi ? », « Bon à savoir », risques, parties d'un rapport. Autre grille : `style="grid-template-columns:repeat(3,1fr)"` |
| `.pr-check > ul > li` | cases à cocher « Je vérifie » ; `pr-check pr-cas` = puces (liste de cas) |
| `.pr-duo` > `.oui` / `.non` (`.signe` + `b.titre` + `p`) | je fais / je ne fais pas |
| `.pr-exemple` > `.pr-exemple-lab` (`non` = mauvais exemple) + `<q>` | exemple de rédaction |
| `.pr-refs` | références réglementaires en bas de feuille |
| `.pr-deux` | deux colonnes simples |
| `span.pr-champ` (`long`) | champ à remplir au stylo |
| `.fr-bas` > `section.fr-encart.vigilance` / `.documents` | bas de fiche réflexe |
| `.fr-signature` | nom, date, signature (fiche réflexe émargée) |

## Rapport (rex.css)

| Bloc | Usage |
|---|---|
| `span.rx-restreint` | pastille « Diffusion restreinte » |
| `.rx-id` > div (`large`, `plein`) > `.rx-lab` + `.rx-val` | fiche d'identité (exercice, site) |
| `figure.rx-photo` (`grande`) > img + figcaption ; `.rx-photos` (2 col.) | photos légendées |
| `table.rx-table` (`serre`, `td.c` centré) | tableau à en-tête marine ; 1re colonne en gras |
| `ol.rx-chrono > li(.fort) > span.rx-heure + div.rx-quoi(small)` | chronologie verticale |
| `.rx-eval > div > span + span.rx-niv.ok/.cours/.non` (+ `div.global`) | grille d'évaluation |
| `.rx-bilan > div(style --t) > h3 + ul` | points forts / à améliorer |

## Zones à remplir et PDF remplissable

Toute zone « au stylo » de ce catalogue (cellule vide, `ms-ligne`, `pr-champ`, `ms-case`,
`pr-check`, `ms-signatures`, `ms-zone`…) devient automatiquement un champ avec
`pdf.js` (tous les PDF sont remplissables). Attributs pour cas particuliers : `data-champ="Nom"` (forcer un champ
texte), `data-champ-type="case"` (case à cocher), `data-champ="non"` (exclure). Détails :
[pdf-remplissable.md](pdf-remplissable.md).

## Classeur et cahier (mase.css, consignes-site.css)

| Bloc | Usage |
|---|---|
| `.ms-couv` > `.ms-couv-haut` (logo, `ms-couv-sur`, `ms-couv-titre` avec `<span>`, `ms-couv-sse`) + `.ms-couv-site` + `.ms-couv-regle` | couverture |
| `.ms-languettes > .ms-languette style="--n:N"` + `.ms-inter` (`ms-inter-tete`, `ms-inter-num`, `ms-inter-titre`, `ms-inter-axe`, `ms-inter-pitch`, `ms-inter-cols`) | intercalaire de chapitre / onglet |
| `.ms-bloc > h3 + ol.ms-contenu` / `ul.ms-audit` | « Dans ce chapitre » / « L'essentiel » |
| `span.ms-usage` (`remplir`, `inserer`) | étiquette À lire / À remplir / À insérer |
| `.ms-sommaire > div > .ms-som-num + .ms-som-txt(.ms-som-titre, .ms-som-desc) + .ms-som-axe` | sommaire |
| `.ms-questions > div > span.n + span.q + span.r` (+ `span.ms-renvoi`) | règles numérotées avec renvoi |
| `.ms-urgences > div(style --t) > b + span` | gros numéros d'urgence |
| `table.rx-table.ms-registre` (`tr.rempli`, `tr.visa`, `tr.rempli.q`) | registre à remplir |
| `.ms-signatures style="--cols:2"` > div > `.ms-lab` + small | cadres de signature |
| `.ms-cases > span.ms-case` | cases à cocher sur une ligne |
| `.ms-lab` + `.ms-ligne` (`grand`) | champ libellé + ligne à écrire |
| `.ms-inserer > .ms-inserer-ic + div(h3, p, .ms-inserer-meta)` | « Insérer ici » un document client |
| `span.cs-tel` / `span.cs-code` | téléphone / code non imprimé |
| `.rx-photos.trois/.quatre/.haute/.objets`, `.rx-photo.plan` | photos de site |

## Icônes

`<i data-ic="nom"></i>`. Noms disponibles (aucun autre) :

- Personnes et lieux : `personnes`, `accueil`, `batiment`, `bureau`, `escalier`
- Sécurité : `bouclier`, `cadenas`, `oeil`, `alerte`, `stop`, `cible`, `casque`, `flamme`, `eclair`, `goutte`, `thermometre`, `coeur`
- Communication : `telephone`, `telephone_mobile`, `mail`, `voix`, `bulle`, `antenne`, `ecran`
- Temps : `horloge`, `calendrier`, `lune`
- Documents et actions : `document`, `livre`, `crayon`, `coche`, `croix`, `loupe`, `recommencer`, `imprimer`, `telecharger`, `televerser`, `disquette`, `plus`, `corbeille`
- Matériel et tenue : `outils`, `boite`, `poignee`, `voiture`, `polo`, `chemise`, `pull`, `veste`, `parka`, `pantalon`, `rangers`
- Divers : `diplome`, `ampoule`, `fusee`, `prisme`, `pilotage`, `puce`, `feuille`, `recyclage`, `balai`, `avion`
