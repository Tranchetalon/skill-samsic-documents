# Export Word modifiable (optionnel)

À faire seulement si l'utilisateur demande une version Word. Le PDF reste la référence visuelle :
le Word reprend le contenu en vrais paragraphes et vrais tableaux, aux couleurs de la charte,
pour qu'un collègue puisse retoucher le texte.

## Installation (une fois)

```
cd "<skill>/scripts/word"
npm install
```
(dépendances : `docx`, `jsdom`).

## Utilisation

```
node "<skill>/scripts/word/html2docx.js" "<dossier>/<page>.html" "<dossier>/<Nom final>.docx"
node "<skill>/scripts/word/html2docx.js" "<dossier>/mase-02-competences.html" "<sortie>.docx" "?site=<id>"
```

- Une section Word par chapitre (cahier, classeur), avec la languette en image.
- Cartouche : variante marine/bleu pour `consigne`, `rex`, `mase` ; rouge pour `incident` ;
  marine pour les autres familles.
- Après conversion, ouvrir le fichier pour vérifier le nombre de pages si Word est disponible.
