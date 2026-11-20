# Consigne agents (1 ou 2 pages)

Une consigne sur **un sujet** valable pour tous les agents : règle RH (congés à poser avant le 31 mai,
RCR, journée de solidarité, heures sup), prévention, sûreté (incivilités : appeler le 17),
utilisation d'un outil (comptes rendus Guardtek, permis ADCS). Recto : **le geste**. Verso : **le pourquoi**.
Modèle : `modeles/consigne-agents.html` (type `consigne-agents`).

## Famille

- `consigne` (marine + bleu) par défaut : RH, prévention, outils. Pied « Consignes RH » ou
  `data-libelle` adapté (« Consignes Guardtek »).
- `incident` (rouge) : sûreté, incivilités, urgences.
- Une consigne propre à un site : ajouter `data-site="Nom du site"` (affiché dans le pied).

## Page 1 : le geste

1. En-tête : titre en message (« RCR : posez vos repos ») ; sous-titre = la règle en une ligne
   (« 1 vacation cumulée = 1 vacation posée ») ; résumé de 2-3 phrases.
2. « Quand ? » : le déclencheur, avec un rappel chiffré si utile.
3. **3 à 5 étapes** numérotées. Variantes de carte pour ce qui doit sauter aux yeux :
   - `pr-large` + `pr-gros-num` : un numéro ou un chiffre (« 17 », « 15 jours ») ;
   - `pr-date` : une date butoir (« 31 mai ») ;
   - `pr-qr` : un QR code vers un formulaire ou une appli ;
   - `pr-liste` : ce qu'il faut dire ou fournir ;
   - `pr-capture` : capture d'écran d'un outil (dans `img/`), légendée.
4. **Message fort** (`pr-fort`) : l'objection du terrain et sa réponse, ou la règle couperet
   (« Le 31 mai, le compteur RC est remis à zéro »).

## Page 2 : le pourquoi

- `pr-section` + **tuiles** (`pr-tuiles`, 4 tuiles, une `pleine` si 5) : les questions que se
  pose l'agent (« Urgence personnelle ? », « Vous quittez l'entreprise ? ») et leurs réponses.
- Si besoin, une carte d'étape isolée pour un cas particulier (ex. RCN de nuit).
- **« Je vérifie »** (`pr-check`) : 3 à 5 cases à cocher, à la première personne.
- Comparaison bon/mauvais exemple : `pr-duo` (oui/non) ou `pr-exemple` (exemple de rédaction).
- **Références** (`pr-refs`) : textes applicables, dates, articles.
- **Bandeau** avec phrase-choc propre au sujet.

Une consigne qui tient sur une page reste sur une page : supprimer la page 2 du modèle et
mettre le bandeau sur la page 1.

## Exemple de ton

> **« De toute façon, ils ne viendront pas »**
> Nous le comprenons. Mais ce silence laisse croire aux auteurs qu'ils ne risquent rien, et c'est
> ce sentiment d'impunité qui les pousse à recommencer. **Un appel au 17 n'est jamais inutile.**
