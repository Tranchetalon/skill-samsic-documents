/* ============================================================================
   champs.js — Rend un PDF SAMSIC remplissable (formulaire AcroForm)

   Appelé par scripts/pdf.js --formulaire, après l'impression. Reçoit le PDF
   et la liste des zones mesurées par socle/js/procedure.js (positions en
   points depuis le coin haut-gauche de chaque feuille), et pose à chaque
   endroit un vrai champ : zone de texte ou case à cocher.

   Les champs sont transparents (sans fond ni bordure) : la feuille imprimée
   garde exactement son dessin, qu'on la remplisse à l'écran ou au stylo.
   Saisie en marine, police Helvetica (lue par tous les lecteurs PDF).

   Usage direct : node champs.js <document.pdf> <champs.json>
   ========================================================================== */
'use strict';

const fs = require('fs');
const { PDFDocument, PDFName, StandardFonts, rgb } = require('pdf-lib');

const MARINE = rgb(0x22 / 255, 0x34 / 255, 0x4A / 255);

async function poserChamps(fichierPdf, champs) {
  const doc = await PDFDocument.load(fs.readFileSync(fichierPdf));
  const police = await doc.embedFont(StandardFonts.Helvetica);
  const form = doc.getForm();
  const pages = doc.getPages();
  let n = 0;

  for (const c of champs) {
    const page = pages[c.page];
    if (!page) continue;
    const hauteur = page.getHeight();
    const rect = { x: c.x, y: hauteur - c.y - c.h, width: c.l, height: c.h };
    const style = { ...rect, borderWidth: 0, textColor: MARINE };
    let champ;
    if (c.type === 'case') {
      champ = form.createCheckBox(c.nom);
      champ.addToPage(page, style);
    } else {
      champ = form.createTextField(c.nom);
      if (c.multi) champ.enableMultiline();
      champ.addToPage(page, { ...style, font: police });
      // Taille fixe, proche du texte imprimé : l'automatique remplirait
      // toute la hauteur d'une ligne d'écriture (texte énorme).
      champ.setFontSize(c.multi ? 9 : 10);
    }
    // Transparence : on retire le fond et la bordure que pdf-lib pose par défaut.
    for (const w of champ.acroField.getWidgets()) {
      const mk = w.getAppearanceCharacteristics();
      if (mk) { mk.dict.delete(PDFName.of('BG')); mk.dict.delete(PDFName.of('BC')); }
    }
    n++;
  }
  form.updateFieldAppearances(police);
  fs.writeFileSync(fichierPdf, await doc.save());
  return n;
}

module.exports = poserChamps;

if (require.main === module) {
  const [pdf, json] = process.argv.slice(2);
  poserChamps(pdf, JSON.parse(fs.readFileSync(json, 'utf8')))
    .then((n) => console.log(n + ' champs posés dans ' + pdf))
    .catch((e) => { console.error(e.stack); process.exit(1); });
}
