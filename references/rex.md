# Retour d'expérience (REX / RETEX) d'exercice

Un REX n'est pas une fiche d'agent : c'est un **rapport** de 4 à 7 feuilles lu par le client et
l'encadrement. Il garde l'habillage SAMSIC et ajoute fiche d'identité, photos, tableaux,
chronologie, grille d'évaluation et plan d'actions.
Modèle : `modeles/rex.html` (type `rex`), famille `rex`, `data-titre="Retour d'expérience"`.

## Source habituelle

Le compte rendu d'exercice (souvent un Word « Exercice Sûreté … ») : date, lieu, scénario,
équipes, chronologie minute par minute, grille des objectifs, observations. On le restructure ;
on ne change ni les heures ni les niveaux d'évaluation.

## Plan fixe

1. **Synthèse** (feuille 1) : sous-titre « Exercice sûreté · Thème » ; résumé (ce que le document
   contient) ; pastille *Diffusion restreinte* si le site est sensible ; fiche d'identité `rx-id`
   (date, lieu, nature, thème, durée, équipes concernées, liste de diffusion) ; « En résumé »
   (`pr-fort` « Résultat global : … ») ; 4 tuiles qui annoncent les 4 parties.
2. **Partie 1 · Le sujet** (1 ou 2 feuilles) : comprendre le dispositif ou la menace (texte,
   tableau, photos), pourquoi c'est un risque (tuiles), **ce que l'agent fait** (`pr-check pr-cas`),
   la règle à retenir (`pr-fort`).
3. **Partie 2 · L'organisation** : 4 étapes (préparer, choisir le lieu, fixer les modalités, jouer
   et analyser) + **check-list pour les prochains exercices**.
4. **Partie 3 · Le déroulement** : **chronologie** (`rx-chrono`, heures `16h50`, début et fin en
   `fort`) + **évaluation des objectifs** (`rx-eval`) : trois niveaux uniquement,
   *Acquis* (`ok`), *En cours d'acquisition* (`cours`), *Non acquis* (`non`), et une ligne
   `global` « Analyse opérationnelle globale ».
5. **Partie 4 · Le retour d'expérience** : points forts / points à améliorer (`rx-bilan`), plan
   d'actions (`rx-table` : #, action, pilote, échéance en `pr-champ` à remplir), bandeau
   (leçon + gestes).

Grille d'objectifs habituelle : gestion de la situation par le chef de poste · mise en place de
l'intervention · gestion de l'intervention · connaissance et application des consignes · gestion
de la situation par les agents · communications radio · gestion par l'agent vidéo · analyse globale.
Reprendre celle du compte rendu si elle diffère.

Ton : factuel, sans désigner de coupable ; les noms n'apparaissent que dans « Équipes concernées »
et « Liste de diffusion ». Nom du PDF : `REX - Exercice <thème> - JJ-MM-AAAA.pdf`.

## Synthèse client (une slide 16:9)

Modèle : `modeles/rex-synthese-client.html` (type `rex-synthese`). Version courte pour qu'un
collègue la présente au client. Nom : `REX - Exercice <thème> - JJ-MM-AAAA - Synthese client.pdf`.

- **Aucun nom d'agent** : chef de poste, agent vidéo, rondier.
- En-tête : surtitre, titre, 4 infos (date, lieu, durée, équipes).
- À gauche une photo de l'exercice ou du site (pastille *Diffusion restreinte* si sensible).
- À droite : scénario en 2 lignes ; **4 chiffres clés** (temps de réaction, objectifs acquis / total) ;
  chronologie horizontale de 4 à 6 étapes ; 3 cartes « Ce qui a fonctionné », « Nos axes de
  progrès », « Nos prochaines étapes » (3 à 4 puces courtes chacune).
- Pied marine : la leçon + les gestes ; mentions légales (posées depuis `agence.js`).
- Tout doit tenir dans la slide : le contrôle de débordement s'applique aussi.
