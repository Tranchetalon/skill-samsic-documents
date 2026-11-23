# Fiche réflexe

Une **affiche A4 d'une seule page**, punaisée au poste ou rangée dans le classeur de l'agent.
Elle répond à « je suis dans telle situation : que dois-je faire, dans quel ordre ? ».
Modèle : `modeles/fiche-reflexe.html` (type `fiche-reflexe`).

## Structure (toujours dans cet ordre)

1. **En-tête** : titre court en message (« Remplacement de vêtement », « Appeler l'astreinte ») ;
   sous-titre = « **N points clés** » (N = nombre d'étapes) ; résumé d'une phrase (à quoi sert la fiche).
2. **« Quand ? »** (`fr-declencheur`) : la situation déclenchante, en une ou deux lignes.
3. **Étapes** (`fr-etapes`) : **4 à 6 cartes** numérotées, une par geste, dans l'ordre chronologique.
   Chaque carte : petite icône + titre (verbe + objet) ; deux phrases au plus ; grande icône à droite
   (la même) ; pastilles facultatives `Délai`, `Auprès de`, `Document`.
4. **Bas de fiche** (`fr-bas`) : « Points de vigilance » (erreurs qui font échouer la démarche,
   2 à 4 puces) et/ou « Documents à fournir ». Un seul encart → `fr-bas seul`.
5. **Bandeau** par défaut (« La sécurité, c'est l'affaire de tous. »), sauf phrase-choc propre au sujet.
6. **Pied** automatique (famille + date de mise à jour).

## Choisir la famille (`data-famille`)

| Sujet | Famille | Libellé dans le pied |
|---|---|---|
| Tenue, matériel, véhicule, carte carburant | `equipement` | Tenue & matériel |
| Paie, congés, frais, changement d'adresse, RIB | `rh` | Démarches RH |
| Arrêt maladie, accident du travail, reprise | `sante` | Santé & arrêts |
| Incident, urgence, astreinte, incivilité | `incident` | Incidents & urgences |
| Prise de service, main courante, Guardtek, poste | `exploitation` | Vie du poste |

## Densité

- Par défaut `class="doc-page fr-page"`, même à 5 ou 6 étapes courtes.
- Seulement si `pdf.js` signale un débordement : ajouter `compact`, puis `compact tres-compact`.
  Le mode compact sur une fiche qui tient laisse un grand vide en bas de feuille.
- Au-delà de 6 étapes ou s'il faut un verso : ce n'est plus une fiche réflexe → **consigne agents**.
- La taille du texte des étapes ne change jamais : on resserre les blancs, pas les lettres.

## Collection : un dossier par catégorie, une numérotation par catégorie

Fiches réflexes et consignes agents se rangent ensemble, **par catégorie**, chacune avec sa
propre numérotation. Nom du PDF : `<Catégorie> - NN - Titre sans accent.pdf`, dans le dossier
`<Catégorie>/`.

| Catégorie (dossier et préfixe) | Contenu | Famille habituelle |
|---|---|---|
| `RH` | congés, RCR, heures sup, journée de solidarité, paie, frais, adresse/RIB | `rh`, `consigne` |
| `Operationnel` | prise de service, PTI, main courante et rapports Guardtek, vie du poste | `exploitation` |
| `Incidents` | astreinte, alerte PTI, incident majeur, incivilités, accident | `incident` |
| `Sante` | déclaration d'AT, arrêt maladie, reprise | `sante` |
| `Materiel` | tenue, entretien, matériel défectueux ou perdu, restitution | `equipement` |
| `Vehicules` | véhicule de service, carte carburant, permis | `exploitation` |

Exemples : `RH/RH - 03 - Repos compensateurs RCR et RCN.pdf`,
`Incidents/Incidents - 02 - Alerte PTI lever le doute.pdf`.

- Prendre le **prochain numéro libre de la catégorie** : regarder le dossier de collection de
  l'agence (à Lyon : `SAMSIC/PDF/03 - Fiches reflexes/<Catégorie>/`). Si le dossier n'est pas
  connu, demander où sont rangées les fiches.
- Une fiche placée au milieu d'un thème (ex. une deuxième fiche congés) peut prendre la place
  logique, à condition de renuméroter la suite de la catégorie et de mettre à jour le fichier
  `Correspondance anciens numeros.csv` du dossier de collection.
- Une nouvelle catégorie seulement si aucune ne convient, et après accord de l'utilisateur.

## Exemple de bonne carte

> **② Adresser la demande à votre supérieur hiérarchique**
> À lui, et à lui seul. N'écrivez pas directement au service concerné : c'est votre supérieur qui
> transmet la demande et qui en assure le suivi. — *pastille* `AUPRÈS DE` Supérieur hiérarchique
