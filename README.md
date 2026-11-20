# Skill Claude « Documents SAMSIC »

Ce skill pour Claude Code produit les documents SAMSIC Sécurité directement au style maison :
**fiches réflexes, consignes agents, cahiers de consignes de site, REX et synthèses client,
classeur SSE / MASE**. Une fois le skill installé, il suffit de demander, par exemple :

- « Fais-moi une fiche réflexe sur la déclaration d'un accident du travail » ;
- « Voici la consigne client du site X (PDF joint) : fais-en le cahier de consignes » ;
- « Voici le compte rendu de l'exercice incendie d'hier : fais le REX et la synthèse client » ;
- « Prépare le classeur SSE du site Y ».

Pas besoin de redonner le style, le logo ni un exemple : tout est dans le skill.

## Installation

Prérequis : [Claude Code](https://claude.com/claude-code), Node.js 18 ou plus, Google Chrome ou
Microsoft Edge.

```
git clone <adresse du dépôt> "%USERPROFILE%\.claude\skills\samsic-documents"
```
(macOS / Linux : `~/.claude/skills/samsic-documents`.)

Puis, **une seule fois**, ouvrir `agence.js` et mettre l'identité de votre agence
(provenance du pied de page et numéros d'agrément CNAPS).

Export Word (facultatif) : `cd scripts/word` puis `npm install`.

## Mise à jour

```
cd "%USERPROFILE%\.claude\skills\samsic-documents"
git pull
```
`agence.js` étant modifié localement, faire `git stash` avant le `pull` puis `git stash pop`
si Git le demande.

## Contenu

| Dossier | Rôle |
|---|---|
| `SKILL.md` | ce que lit Claude : quand utiliser le skill, la méthode, les règles |
| `references/` | charte, règles de rédaction, structure de chaque type de document, catalogue des composants |
| `modeles/` | un modèle HTML par type ; le classeur SSE complet (10 onglets) |
| `socle/` | polices, CSS, icônes, logo : la charte graphique |
| `scripts/` | `nouveau.js` (crée un document), `pdf.js` (imprime et contrôle), `word/` (export Word) |
| `agence.js` | identité de votre agence |

## Règles de partage

- Dépôt **privé**, réservé au groupe SAMSIC : il contient le logo et des éléments internes.
- Ne jamais y pousser de données de site réelles (`mase-sites.js` rempli, noms d'agents, numéros
  personnels, photos de sites clients). Les documents produits restent sur votre poste.
- Polices Bricolage Grotesque et Work Sans : licence SIL Open Font License 1.1.
