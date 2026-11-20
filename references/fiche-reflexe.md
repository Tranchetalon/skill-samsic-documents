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

- 4 étapes : `class="doc-page fr-page"`.
- 5 étapes : ajouter `compact`. 6 étapes : `compact tres-compact`.
- Au-delà de 6 étapes ou s'il faut un verso : ce n'est plus une fiche réflexe → **consigne agents**.
- La taille du texte des étapes ne change jamais : on resserre les blancs, pas les lettres.

## Collection

Les fiches réflexes d'une agence sont **numérotées** (« 01 - Remplacement de vêtement »…).
Demander le prochain numéro libre s'il n'est pas connu, et nommer le PDF
`NN - Titre sans accent.pdf`.

## Exemple de bonne carte

> **② Adresser la demande à votre supérieur hiérarchique**
> À lui, et à lui seul. N'écrivez pas directement au service concerné : c'est votre supérieur qui
> transmet la demande et qui en assure le suivi. — *pastille* `AUPRÈS DE` Supérieur hiérarchique
