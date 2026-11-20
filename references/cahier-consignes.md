# Cahier de consignes d'un site

Le cahier vit au poste. Il traduit la **consigne du client** en gestes concrets SAMSIC, avec les
photos et les écrans du site. Le remplaçant d'une nuit doit pouvoir y trouver toute sa vacation.
Modèle : `modeles/cahier-consignes.html` (type `cahier-consignes`). Visuel du classeur SSE
(famille `mase`, `data-doc="site"`). `data-libelle="Cahier de consignes · <Site>"`.

## Sources et principe

- Source de référence : la **consigne client** (référence, version, date). En cas d'écart avec un
  ancien livret SAMSIC, **la consigne client prime** ; l'ancien livret sert à récupérer photos et
  détails pratiques. Noter dans un commentaire HTML en tête les sources utilisées.
- Les contenus génériques (alerte à la bombe, colis suspect, glossaire…) ne chargent pas le cahier :
  ils vont dans un document « **Cahier de consignes · Annexes** » (même modèle, même charte).
- La **formation au poste** est un troisième document du même dossier : modules, questions de
  test (`ms-registre` avec lignes `rempli q`), lignes de visa (`tr.visa`).

## Plan type (à adapter, dans l'ordre d'une vacation)

0. **Couverture** (`ms-couv`) : surtitre, « Cahier de consignes », 3 pastilles (client, type de site,
   horaires), fiche du site, 3 règles (« Il reste au poste », « La consigne client prime »,
   « Lu et signé »), les 3 numéros à connaître par cœur (`ms-urgences`).
0. **Mode d'emploi** : les **dix règles qui ne se discutent pas** (`ms-questions`), à la 1re personne,
   chacune avec son renvoi `Ch. N`, + bandeau « Un doute ? J'appelle … ».
0. **Sommaire** (`ms-sommaire`) : un chapitre par ligne, avec les § de la consigne client couverts ;
   puis les « trois sortes de pages » (À lire / À remplir / À insérer).
1. **Le site et qui appeler** : le site en un coup d'œil (photos, `rx-id`, risques), horaires et
   postes, annuaire (services publics, client dans l'ordre d'appel, SAMSIC), schéma d'appel des
   astreintes (étapes), plan des zones (ATEX…).
2. **Prise et fin de poste** : arriver, contrôles, départ du personnel client, fin de poste / relève.
3. **Tenue, EPI et matériel** : tenue, ce qu'on emporte, ce qui est interdit, PTI et essais.
4. **Les rondes** : déroulé (`rx-chrono`), pointeaux (tableau `rx-table serre`), météo, zones interdites.
5. **Accès, stationnement, véhicules** : qui entre hors heures, visiteurs, livraisons, portail en panne.
6. **Supervision et vidéo** : écrans (captures), levée de doute, acquittement, alarmes.
7. **Situations d'urgence** : une page par situation (feu, fuite, intrusion, menace, malaise…),
   étapes à la 1re personne, première étape de danger en rouge, photos des moyens, bandeau.
8. **Suivi des consignes** : registre (personnes habilitées, validation signée, historique,
   consignes provisoires), prise en compte signée par les agents + habilitations, table de
   correspondance § consigne client → chapitre du cahier, encadré « Insérer derrière ce cahier ».

Chaque chapitre commence par un **intercalaire** : languette `--n:N` (descend d'un cran par
chapitre), gros numéro `0N.`, titre sur deux lignes, pastille « Consigne client § … », phrase
d'accroche, blocs « Dans ce chapitre » (avec `À lire` / `À remplir` / `À insérer`) et « L'essentiel ».
Les pages du chapitre ont pour sous-titre `N · Titre` (numéro de la page dans le chapitre).

## Règles propres au cahier

- **Codes jamais imprimés** : `<span class="cs-code">donné en formation</span>`.
- Téléphones en `<span class="cs-tel">`.
- Photos du site dans `img/` ; variantes `rx-photos trois|quatre|haute|objets`, `rx-photo plan`
  pour un plan ou un écran à montrer en entier.
- Ce qui n'est pas confirmé par le client (poste de jour, plan de prévention échu…) va dans la
  liste « à confirmer » rendue à l'utilisateur, pas dans le cahier.
- Un cahier fait souvent 30 à 50 feuilles : relire le PDF en entier avant de le rendre.
