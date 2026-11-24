/* ============================================================================
   pdf.js — Imprime un document SAMSIC (page HTML du skill) en PDF

   Usage : node pdf.js <page.html> [sortie.pdf] [--site=<id>] [--sans-formulaire]
     sortie.pdf         par défaut : même nom que la page, extension .pdf
     --site=id          classeur SSE : personnalise la trame pour ce site (mase-sites.js)
     --sans-formulaire  PDF « papier » seul. Par défaut, le PDF est REMPLISSABLE
                        (AcroForm) : chaque zone « au stylo » (registre, ligne, case,
                        signature) devient un vrai champ. Un document sans zone à
                        remplir reste un PDF normal.

   Utilise Chrome ou Edge en mode headless, et pdf-lib pour les champs
   (installé automatiquement dans scripts/formulaire au premier besoin).
   Avant d'imprimer, contrôle la page :
     - feuilles qui débordent (texte coupé en bas) ;
     - repères [[…]] restés dans le texte (contenu non rédigé).
   Code de sortie 2 si un contrôle échoue : le PDF est quand même produit,
   avec un bandeau rouge sur chaque feuille trop pleine.
   ========================================================================== */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');

const args = process.argv.slice(2);
const site = (args.find((a) => a.startsWith('--site=')) || '').slice(7);
// AcroForm par défaut (--formulaire, ancienne option, est accepté et sans effet).
const formulaire = !args.includes('--sans-formulaire');
const [entree, sortieArg] = args.filter((a) => !a.startsWith('--'));
if (!entree) {
  console.error('Usage : node pdf.js <page.html> [sortie.pdf] [--site=<id>] [--sans-formulaire]');
  process.exit(1);
}
const page = path.resolve(entree);
if (!fs.existsSync(page)) { console.error('Introuvable : ' + page); process.exit(1); }
const sortie = path.resolve(sortieArg || page.replace(/\.html?$/i, '') + (site ? ' - ' + site : '') + '.pdf');

function navigateur() {
  const candidats = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    path.join(os.homedir(), 'AppData/Local/Google/Chrome/Application/chrome.exe'),
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge',
  ].filter(Boolean);
  const nav = candidats.find((p) => fs.existsSync(p));
  if (!nav) {
    console.error('Ni Chrome ni Edge trouvé. Indiquer le chemin dans la variable CHROME_PATH.');
    process.exit(1);
  }
  return nav;
}

const nav = navigateur();
const url = pathToFileURL(page).href + (site ? '?site=' + encodeURIComponent(site) : '');
const communs = ['--headless=new', '--disable-gpu', '--no-pdf-header-footer',
  '--allow-file-access-from-files', '--virtual-time-budget=5000'];

// 1. Contrôle : le DOM rendu, après chargement des polices et des scripts.
let alerte = false;
let dom = '';
try {
  dom = execFileSync(nav, [...communs, '--dump-dom', url],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
  const deb = [...dom.matchAll(/data-deborde="(\d+)"/g)].map((m) => +m[1]);
  if (deb.length) {
    alerte = true;
    console.log('ATTENTION : ' + deb.length + ' feuille(s) trop pleine(s) : ' +
      deb.map((mm) => mm + ' mm').join(', ') + ' coupés. Raccourcir ou ajouter une feuille.');
  }
  const texte = dom.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  const reperes = [...new Set((texte.match(/\[\[[^\]]{0,80}\]\]/g) || []))];
  if (reperes.length) {
    alerte = true;
    console.log('ATTENTION : ' + reperes.length + ' repère(s) à compléter : ' + reperes.slice(0, 8).join(' · '));
  }
} catch (e) {
  console.log('(contrôle du rendu impossible : ' + e.message.split('\n')[0] + ')');
}

// 2. Impression.
fs.mkdirSync(path.dirname(sortie), { recursive: true });
execFileSync(nav, [...communs, '--print-to-pdf=' + sortie, url], { stdio: 'ignore' });
const brut = fs.readFileSync(sortie, 'latin1');
const pages = (brut.match(/\/Type\s*\/Page(?!s)/g) || []).length;
console.log('PDF : ' + sortie + ' (' + pages + ' page' + (pages > 1 ? 's' : '') + ')');

// 3. Formulaire : vrais champs aux zones mesurées par procedure.js.
(async () => {
  const m = dom.match(/<script type="application\/json" id="samsic-champs">([\s\S]*?)<\/script>/);
  const champs = formulaire && m ? JSON.parse(m[1]) : [];
  if (formulaire && !champs.length) console.log('Formulaire : aucune zone à remplir, PDF normal.');
  if (champs.length) {
    const dossier = path.join(__dirname, 'formulaire');
    let poserChamps;
    try {
      poserChamps = require('./formulaire/champs');
    } catch (e) {
      // Premier usage sur ce poste : on installe pdf-lib, une fois pour toutes.
      console.log('Formulaire : installation de pdf-lib (une seule fois)…');
      try {
        require('child_process').execSync('npm install --no-audit --no-fund', { cwd: dossier, stdio: 'ignore' });
        poserChamps = require('./formulaire/champs');
      } catch (e2) {
        console.log('ATTENTION : PDF produit SANS champs remplissables. Faire « npm install » dans ' + dossier);
        process.exit(2);
      }
    }
    const n = await poserChamps(sortie, champs);
    const cases = champs.filter((c) => c.type === 'case').length;
    console.log('Formulaire : ' + n + ' champs (' + (n - cases) + ' zones de texte, ' + cases + ' cases à cocher)');
  }
  process.exit(alerte ? 2 : 0);
})();
