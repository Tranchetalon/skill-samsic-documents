---
name: samsic-documents
description: Produit les documents SAMSIC Sécurité à la charte maison (logo, cartouche marine, polices Bricolage Grotesque et Work Sans, pied légal CNAPS), sans qu'on ait à redonner le style ni un exemple. À utiliser dès qu'on demande, crée, refait, met à jour ou met en forme une fiche réflexe, une consigne pour les agents (consigne RH, prévention, sûreté), un cahier de consignes de site ou une formation au poste, un REX / RETEX / retour d'expérience d'exercice et sa synthèse client, ou un classeur SSE / MASE de site et ses onglets. Sortie PDF A4 (et Word modifiable en option).
---

# Documents SAMSIC Sécurité

Ce skill contient tout le nécessaire pour qu'un document sorte **directement au style SAMSIC** :
socle graphique (polices, logo, CSS, icônes), un modèle HTML par type de document, les règles
de rédaction de chaque type, et les scripts qui produisent le PDF en contrôlant la mise en page.

**On ne demande jamais à l'utilisateur le style, un exemple ou un modèle : ils sont ici.**

Dans ce fichier, `<skill>` désigne le dossier qui contient ce `SKILL.md`.

## 1. Choisir le type de document

| Demande | Type (`nouveau.js`) | Référence à lire |
|---|---|---|
| Fiche réflexe, affiche d'une page, « N points clés » | `fiche-reflexe` | [references/fiche-reflexe.md](references/fiche-reflexe.md) |
| Consigne pour les agents sur un sujet (RH, prévention, sûreté, outil) : 1 ou 2 pages | `consigne-agents` | [references/consigne-agents.md](references/consigne-agents.md) |
| Cahier / livret de consignes d'un site, consignes de poste, formation au poste, annexes | `cahier-consignes` | [references/cahier-consignes.md](references/cahier-consignes.md) |
| REX, RETEX, retour d'expérience, compte rendu d'exercice | `rex` | [references/rex.md](references/rex.md) |
| Synthèse client d'un REX, une slide | `rex-synthese` | [references/rex.md](references/rex.md) (§ Synthèse) |
| Classeur SSE, classeur MASE, un onglet du classeur, personnaliser pour un site | `classeur-sse` | [references/classeur-sse.md](references/classeur-sse.md) |

« Consigne » seule : si elle porte sur **un site** (poste, rondes, astreintes du client) → cahier de
consignes ; si elle porte sur **un sujet** valable partout (congés, incivilités, Guardtek…) → consigne agents.
Ne demander que si les deux lectures restent plausibles.

Toujours lire aussi :
- [references/charte.md](references/charte.md) : couleurs, typographie, en-tête, pied, ce qui ne change jamais ;
- [references/redaction.md](references/redaction.md) : ton, typographie française, règles de contenu ;
- [references/composants.md](references/composants.md) : le catalogue des blocs HTML et quand les utiliser.

## 2. Méthode

1. **Rassembler le fond.** Lire les sources fournies (consigne client PDF/Word, compte rendu
   d'exercice, notes, accord d'entreprise…). Ne rien inventer : numéro de téléphone, nom, date,
   article de loi, chiffre. Ce qui manque reste en repère `[[…]]` et figure dans la liste
   « à confirmer » remise à la fin.
2. **Créer le document** :
   ```
   node "<skill>/scripts/nouveau.js" <type> "<dossier>" "<nom-du-fichier>"
   ```
   Dossier par défaut : un sous-dossier au nom du document dans le répertoire de travail.
   Le dossier reçoit la page HTML, `socle/` (charte + identité d'agence) et `img/` (photos).
3. **Rédiger dans le HTML.** Remplacer **tous** les `[[…]]`, dupliquer ou supprimer les blocs du
   modèle selon le contenu. Ne modifier ni `socle/` ni les classes CSS : on compose avec les
   composants existants ([composants.md](references/composants.md)). Un style inline n'est permis
   que pour les réglages prévus (colonnes d'une grille, `--et`, `--t`, `margin-top`).
4. **Produire le PDF** :
   ```
   node "<skill>/scripts/pdf.js" "<dossier>/<page>.html" "<dossier>/<Nom final>.pdf"
   ```
   Le script signale les feuilles qui débordent (texte coupé) et les repères `[[…]]` restants,
   et sort avec le code 2. Corriger (raccourcir, répartir sur une feuille de plus) et relancer
   jusqu'au code 0, sauf repères volontairement laissés à confirmer.

   **PDF remplissable (formulaire AcroForm)** : ajouter `--formulaire`. Chaque zone « au stylo »
   devient un vrai champ qu'on remplit à l'écran (Acrobat Reader, Edge, Chrome) ; la feuille
   imprimée reste identique. Voir [references/pdf-remplissable.md](references/pdf-remplissable.md).
   À utiliser **par défaut** pour le classeur SSE, les registres et pages « À remplir » d'un
   cahier de consignes, la formation au poste, les formulaires ; et chaque fois que l'utilisateur
   demande un PDF « modifiable », « remplissable », « à compléter à l'écran ».
5. **Relire le PDF** avec l'outil de lecture, page par page : rien de coupé, pas de feuille à
   moitié vide (regrouper), pas de titre orphelin en bas de feuille, numérotation des étapes
   et des pages cohérente.
6. **Word modifiable** (seulement si demandé) : voir [references/export-word.md](references/export-word.md).
7. **Rendre** : chemin du PDF, nombre de pages, et la liste des points à confirmer
   (repères laissés, informations supposées, écarts avec la source).

### Modifier un document existant

On ne retouche **jamais le PDF** : on modifie la page HTML source, puis on régénère le PDF.
1. Retrouver la source : le dossier créé par `nouveau.js` (page `.html` à côté du PDF), ou le
   projet d'origine de l'agence s'il existe (par exemple `GenerateurDocs/fiches-procedures/`).
   Si seul le PDF existe, recréer le document avec le bon modèle en reprenant son contenu,
   et le signaler.
2. Faire la modification demandée (ajouter, retirer ou réécrire une page, une étape, un onglet),
   en gardant la numérotation cohérente : étapes, `N · Titre` des sous-titres, languettes,
   sommaire, renvois `Ch. N` / `Onglet N`, table de correspondance.
3. Mettre `data-maj` à la date du jour et, pour un cahier ou un classeur, ajouter une ligne à
   l'historique des modifications.
4. Régénérer le PDF (même nom, même option `--formulaire` qu'avant) et relire les feuilles touchées.

Nom du PDF : `<Type> - <Sujet> - <Site ou date>.pdf`, sans caractères interdits (`/ \ : * ? " < > |`).
Exemples : `Cahier de consignes - Dépôt de Cournon.pdf`, `REX - Exercice alerte drone - 12-10-2026.pdf`,
`25 - Repos compensateurs RCR et RCN.pdf` (fiches numérotées dans la collection de l'agence).

## 3. Règles qui ne se discutent pas

- **La charte ne bouge pas** : marine `#22344A` et bleu SAMSIC `#0083BE` (ou la palette de la
  famille d'une fiche réflexe) ; aucune autre couleur, aucune autre police, aucun emoji.
  Icônes : uniquement celles de [composants.md](references/composants.md#icônes).
- **Une feuille = un A4 de hauteur fixe.** Ce qui dépasse est coupé : on raccourcit ou on ajoute
  une feuille, on ne réduit jamais la taille du texte.
- **Pied légal sur chaque feuille** (posé automatiquement) : provenance de l'agence, agréments
  CNAPS, article L612-14 du CSI. Ne pas le retirer.
- **Codes jamais imprimés** (alarme, portail, coffre, mot de passe) : `donné en formation`.
- **Synthèse client et tout document remis au client** : aucun nom d'agent, on parle de fonctions.
- **Cahier de consignes** : la consigne client prime ; le cahier dit comment on l'applique.
- **Données personnelles** : pas de numéro personnel d'agent ni de donnée de santé dans un document affiché.

## 4. Identité de l'agence

Le pied de page lit `<skill>/agence.js` (provenance + agréments CNAPS), copié dans chaque
document à sa création. Si l'utilisateur appartient à une autre agence et que `agence.js`
contient encore les valeurs d'une autre, le lui signaler une fois et proposer de le mettre à jour.

## 5. Prérequis

Node.js 18 ou plus, et Google Chrome ou Microsoft Edge installé (impression PDF headless).
Chemin non standard : variable d'environnement `CHROME_PATH`.
PDF remplissable : une fois `npm install` dans `<skill>/scripts/formulaire` (le faire soi-même
si `pdf.js --formulaire` le demande). Export Word : une fois `npm install` dans `<skill>/scripts/word`.
