// Charge une page du projet dans jsdom en exécutant ses scripts locaux (procedure.js, mase-site.js…).
const { JSDOM, VirtualConsole } = require('jsdom');
const path = require('path'); const { pathToFileURL } = require('url');
module.exports = function charger(fichier, requete) {
  const vc = new VirtualConsole(); const erreurs = [];
  vc.on('jsdomError', (e) => erreurs.push(e.message));
  return JSDOM.fromFile(fichier, {
    url: pathToFileURL(fichier).href + (requete || ''),
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc,
  }).then((dom) => new Promise((ok) => dom.window.addEventListener('load', () => ok({ dom, erreurs }))));
};
if (require.main === module) {
  module.exports(path.resolve(process.argv[2]), process.argv[3]).then(({ dom, erreurs }) => {
    const d = dom.window.document;
    console.log('pages', d.querySelectorAll('.doc-page').length, '| entêtes', d.querySelectorAll('.fr-entete').length,
      '| pieds', d.querySelectorAll('.fr-pied').length, '| svg', d.querySelectorAll('svg').length, '| erreurs', erreurs.slice(0, 3));
    const e = d.querySelector('.fr-entete'); if (e) console.log(e.textContent.replace(/\s+/g, ' ').slice(0, 120));
    dom.window.close();
  });
}
