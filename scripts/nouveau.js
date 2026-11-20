/* ============================================================================
   nouveau.js — Crée un nouveau document SAMSIC à partir d'un modèle du skill

   Usage : node nouveau.js <type> <dossier> [nom-du-fichier]

   Types :
     fiche-reflexe      affiche d'une page, étapes numérotées (famille de couleur)
     consigne-agents    consigne d'une ou deux pages pour les agents
     cahier-consignes   cahier de consignes d'un site (couverture, chapitres…)
     rex                retour d'expérience d'exercice (rapport complet)
     rex-synthese       synthèse client d'un REX, une slide 16:9
     classeur-sse       classeur SSE / MASE complet (10 onglets)

   Le dossier reçoit :
     <nom>.html     la page à rédiger (copie du modèle)
     socle/         polices, CSS, icônes, logo, identité de l'agence
     img/           pour les photos et captures du document
   Le dossier est autonome : on peut le déplacer ou le zipper.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const SKILL = path.join(__dirname, '..');
const TYPES = {
  'fiche-reflexe': 'fiche-reflexe.html',
  'consigne-agents': 'consigne-agents.html',
  'cahier-consignes': 'cahier-consignes.html',
  'rex': 'rex.html',
  'rex-synthese': 'rex-synthese-client.html',
  'classeur-sse': 'classeur-sse',
};

const [type, dossierArg, nomArg] = process.argv.slice(2);
if (!TYPES[type] || !dossierArg) {
  console.error('Usage : node nouveau.js <type> <dossier> [nom-du-fichier]');
  console.error('Types : ' + Object.keys(TYPES).join(', '));
  process.exit(1);
}
const dossier = path.resolve(dossierArg);
fs.mkdirSync(path.join(dossier, 'img'), { recursive: true });

// Le socle est recopié à chaque fois : un document ouvert plus tard avec une
// version plus récente du skill garde ainsi un rendu cohérent avec ses CSS.
fs.cpSync(path.join(SKILL, 'socle'), path.join(dossier, 'socle'), { recursive: true });
fs.copyFileSync(path.join(SKILL, 'agence.js'), path.join(dossier, 'socle', 'js', 'agence.js'));

const modele = path.join(SKILL, 'modeles', TYPES[type]);
const crees = [];
if (type === 'classeur-sse') {
  for (const f of fs.readdirSync(modele)) {
    const src = path.join(modele, f);
    const dest = path.join(dossier, f);
    if (fs.existsSync(dest) && f !== 'img') { console.log('  déjà là, conservé : ' + f); continue; }
    fs.cpSync(src, dest, { recursive: true });
    crees.push(f);
  }
} else {
  const nom = (nomArg || type).replace(/\.html?$/i, '') + '.html';
  const dest = path.join(dossier, nom);
  if (fs.existsSync(dest)) {
    console.error('Existe déjà, rien écrasé : ' + dest);
    process.exit(1);
  }
  fs.copyFileSync(modele, dest);
  crees.push(nom);
}
console.log('Dossier : ' + dossier);
crees.forEach((f) => console.log('  ' + f));
console.log('Socle et identité d’agence copiés. PDF : node "' +
  path.join(__dirname, 'pdf.js') + '" "<page.html>"');
