# Classeur SSE / MASE de site

Le classeur vit au poste de sécurité. Deux lecteurs : **l'agent**, qui doit y trouver en dix
secondes ce qu'il doit faire, et **l'auditeur MASE**, qui doit y trouver la preuve que c'est fait.
D'où deux sortes de pages : **à lire** (cartes, consignes) et **à remplir** (registres, fiches,
émargements), toujours datées et signées.

Modèle : `modeles/classeur-sse/` (type `classeur-sse`) : les **10 onglets** complets, déjà rédigés.
Famille `mase`, deux couleurs seulement (marine, bleu).

## Les onglets

| Fichier | Onglet | Contenu |
|---|---|---|
| `mase-00-ouverture.html` | 00 Couverture | couverture, mode d'emploi, sommaire, le site en un coup d'œil, questions du terrain |
| `mase-01-engagement.html` | 1 Engagement et politique SSE | le MASE en une page, politique SSE (image `img/`), engagements et indicateurs, rôles, 10 règles qui sauvent |
| `mase-02-competences.html` | 2 Accueil, parrainage, habilitations | fiche d'accueil, quiz, parrainage, matrice des habilitations, habilitation électrique |
| `mase-03-risques.html` | 3 Risques du poste et urgences | analyse des risques, prise de poste / relève / STOP, EPI, urgence, environnement, plan de prévention |
| `mase-04-permis-feu.html` | 4 Permis de feu et sous-délégation | règles, acte de sous-délégation, registre |
| `mase-05-causeries.html` | 5 Causeries | animer, programme de l'année, suivi, flashs SSE et bonnes idées |
| `mase-06-remontees.html` | 6 Remontées d'information et accidents | voir/dire/agir, fiche de remontée, cotation, registre |
| `mase-07-retex.html` | 7 Retours d'expérience | pourquoi/comment, trame de RETEX, registre |
| `mase-08-audits.html` | 8 Audits terrain | grille d'audit |
| `mase-09-document-unique.html` | 9 Document unique | le DUERP de l'agence, extrait par unité de travail (`mase-duerp.js`) |

## Deux usages

**Trame vierge** (valable pour tout site, remplie au stylo) : produire chaque onglet tel quel.
```
node "<skill>/scripts/pdf.js" "<dossier>/mase-03-risques.html" "<dossier>/03 - Risques du poste et urgences.pdf"
```

**Classeur personnalisé pour un site** : renseigner le site dans `mase-sites.js` (structure
documentée en tête du fichier : nom, adresse, code contrat, plan de prévention, agents et dates de
carte pro, causeries, remontées, accidents), puis produire les 6 onglets qui se personnalisent
(00, 01, 02, 05, 06, 09) avec `--site=<id>` :
```
node "<skill>/scripts/pdf.js" "<dossier>/mase-02-competences.html" "<dossier>/<Site>/02 - Accueil, parrainage et habilitations.pdf" --site=<id>
```
Les onglets 03, 04, 07, 08 restent communs. `mase-sites.js` contient des données personnelles
d'agents : il reste dans le dossier du document, **jamais dans le dépôt du skill**.

## Adapter un onglet ou en créer un

- Garder la structure : **intercalaire** (`ms-inter`, languette `--n:N`, gros numéro, titre,
  pastille d'axe MASE, pitch, « Dans ce contenu » avec `À lire`/`À remplir`/`À insérer`,
  « L'essentiel ») puis les pages, sous-titres `N · Titre`.
- Pages à remplir : `rx-table ms-registre` (lignes vides), `ms-signatures`, `ms-ligne`,
  `ms-cases`. Une ligne déjà renseignée : `tr.rempli`.
- Mentions propres à l'agence de Lyon, qui a créé ce classeur : DUERP « agence 315 », astreinte,
  politique SSE signée (`img/politique-sse-2024-2026.jpg`), « Lyon Industries », et les noms de
  l'encadrement (onglet 1 « Rôles et responsabilités », onglet 9). Pour une autre agence, les
  remplacer par les siens s'ils sont fournis, sinon les signaler dans la liste « à confirmer ».
- Nom des PDF : `NN - Titre de l'onglet.pdf`, comme dans le tableau ci-dessus.
