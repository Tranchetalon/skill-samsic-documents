/* html2docx.js — Convertit une page fiches-procedures/*.html (rendue avec ses
   scripts) en document Word modifiable : vrais paragraphes, vrais tableaux,
   ombrages aux couleurs de la charte. Usage : node html2docx.js page.html sortie.docx [?site=id] */
'use strict';
const fs = require('fs');
const path = require('path');
const D = require('docx');
const charger = require('./charger');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  AlignmentType, VerticalAlign, ImageRun, Footer, PageNumber, HeightRule, TextDirection, LevelFormat,
  TableLayoutType, Header, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, TextWrappingType,
  TabStopType, Tab,
} = D;

// Cartouche SAMSIC : capture du cartouche HTML (img/word-cartouche-*.png), posé
// comme sur les PDF, à 7 mm du haut et du bord droit de la page. Le titre de
// page tient dans la largeur restante et réserve la hauteur du cartouche.
const CARTOUCHE = { xMm: 130, yMm: 7, lMm: 73, titreMm: 113, reserveMm: 33 };
const VARIANTE = { mase: 'mase', consigne: 'mase', rex: 'mase', incident: 'incident' };

const MM = 56.7;                       // twips par millimètre
const W = Math.round(186 * MM);        // largeur utile (A4, marges 12 mm)
const FONT = 'Arial';
const ECHELLE = 1.12;                  // Word rend plus petit que le navigateur à taille égale
let DOM = '22344A', ACC = '0083BE', PAL = {}, DIR = '';
const GRIS = '4A5C74', TEXTE = '2B3641', PALE = '7D8894', CLAIR = 'E5F2F9', LIGNE = 'DCE3EA';

/* ------------------------------------------------------------ Texte */
const hex = (c) => String(c || '').replace('#', '').toUpperCase();
function couleur(el, def) {
  const m = (el.getAttribute && el.getAttribute('style') || '').match(/--(?:t|et)\s*:\s*var\(--([a-z0-9-]+)\)/);
  if (m && PAL[m[1]]) return PAL[m[1]];
  return def || DOM;
}
// Segments de texte : [{t, st}] ou {br:true}. Les espaces sont fusionnés.
function seg(node, st = {}) {
  const out = [];
  node.childNodes.forEach((n) => {
    if (n.nodeType === 3) { const t = n.textContent.replace(/\s+/g, ' '); if (t) out.push({ t, st }); return; }
    if (n.nodeType !== 1) return;
    const tag = n.tagName.toLowerCase(); const cl = n.classList;
    if (['svg', 'img', 'script', 'style'].includes(tag) || cl.contains('lv-suite')) return;
    if (tag === 'br') { out.push({ br: true }); return; }
    const txt = n.textContent.replace(/\s+/g, ' ').trim();
    if (cl.contains('pr-champ')) { out.push({ t: cl.contains('long') ? '______________________________' : '____________________', st }); return; }
    if (cl.contains('ms-renvoi')) { out.push({ t: ' [' + txt + ']', st: { ...st, bold: true, color: ACC, size: 13 } }); return; }
    if (cl.contains('ms-usage')) { out.push({ t: '  ' + txt.toUpperCase(), st: { ...st, bold: true, color: cl.contains('inserer') ? DOM : ACC, size: 13 } }); return; }
    if (cl.contains('ms-code')) { out.push({ t: '[' + txt + '] ', st: { ...st, bold: true, italics: false, color: ACC, size: 13 } }); return; }
    if (cl.contains('rx-niv')) {
      const c = cl.contains('ok') ? '2E6444' : cl.contains('cours') ? '8A5A00' : cl.contains('non') ? '8C2F26' : DOM;
      out.push({ t: '● ' + txt, st: { ...st, bold: true, color: c } }); return;
    }
    const s2 = { ...st };
    if (tag === 'b' || tag === 'strong' || cl.contains('titre') || cl.contains('pr-url')) s2.bold = true;
    if (tag === 'i' || tag === 'em') s2.italics = true;
    if (tag === 'small') s2.size = Math.max(12, (st.size || 18) - 3);
    if (tag === 'sup') s2.sup = true;
    if (tag === 'q') { out.push({ t: '« ', st }); out.push(...seg(n, s2)); out.push({ t: ' »', st }); return; }
    out.push(...seg(n, s2));
  });
  return out;
}
function runs(segs, base = {}) {
  const s = segs.filter((x) => x.br || x.t);
  while (s.length && s[0].t !== undefined && !s[0].t.trim()) s.shift();
  if (s.length && s[0].t) s[0] = { ...s[0], t: s[0].t.replace(/^\s+/, '') };
  while (s.length && s[s.length - 1].t !== undefined && !s[s.length - 1].t.trim()) s.pop();
  if (s.length && s[s.length - 1].t) s[s.length - 1] = { ...s[s.length - 1], t: s[s.length - 1].t.replace(/\s+$/, '') };
  return s.map((x) => {
    if (x.br) return new TextRun({ break: 1 });
    const st = { ...base, ...x.st };
    return new TextRun({
      text: st.caps ? x.t.toUpperCase() : x.t, font: FONT, size: Math.round((st.size || 18) * ECHELLE), bold: !!st.bold, italics: !!st.italics,
      color: st.color || TEXTE, superScript: !!st.sup,
    });
  });
}
// Texte brut d'un élément ; un <br> compte pour une espace (titres sur deux lignes).
const txt = (el) => (el ? seg(el).map((x) => (x.br ? ' ' : x.t)).join('').replace(/\s+/g, ' ').trim() : '');
function P(contenu, o = {}) {
  const segs = typeof contenu === 'string' ? [{ t: contenu, st: {} }] : contenu;
  return new Paragraph({
    children: runs(segs, o),
    alignment: o.align, keepNext: o.keepNext, pageBreakBefore: o.saut,
    spacing: { before: o.before || 0, after: o.after === undefined ? 60 : o.after, line: o.line },
    border: o.border, shading: o.fond ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fond } : undefined,
    numbering: o.puce ? { reference: o.puce, level: 0 } : undefined,
    indent: o.indent,
  });
}
const vide = (taille = 2, after = 60) => new Paragraph({ spacing: { before: 0, after }, children: [new TextRun({ text: '', size: taille })] });
const ligneEcrire = (texte, grand) => new Paragraph({
  children: texte ? runs([{ t: texte, st: {} }], { bold: true, color: DOM, size: grand ? 30 : 20 }) : [],
  spacing: { before: grand ? 260 : 170, after: 50 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '9AA5B1', space: 1 } },
});

/* ------------------------------------------------------------ Images */
function dims(buf) {
  if (buf[0] === 0x89) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), type: 'png' };
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xFF) { i++; continue; }
    const m = buf[i + 1], len = buf.readUInt16BE(i + 2);
    if (m >= 0xC0 && m <= 0xCF && ![0xC4, 0xC8, 0xCC].includes(m)) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7), type: 'jpg' };
    i += 2 + len;
  }
  return { w: 100, h: 100, type: 'png' };
}
function lireImage(src) {
  if (!src) return null;
  if (src.startsWith('data:')) return Buffer.from(src.split(',')[1], 'base64');
  const f = path.resolve(DIR, decodeURI(src.split('?')[0]));
  return fs.existsSync(f) ? fs.readFileSync(f) : null;
}
// largeur en mm, ou hauteur maximale en mm
function image(src, largeurMm, hauteurMaxMm, align = AlignmentType.CENTER) {
  const buf = lireImage(src); if (!buf) return null;
  const d = dims(buf);
  let w = largeurMm * 3.78, h = w * d.h / d.w;
  if (hauteurMaxMm && h > hauteurMaxMm * 3.78) { h = hauteurMaxMm * 3.78; w = h * d.w / d.h; }
  return new Paragraph({ alignment: align, spacing: { after: 40 },
    children: [new ImageRun({ data: buf, type: d.type, transformation: { width: Math.round(w), height: Math.round(h) } })] });
}

/* ------------------------------------------------------------ Tableaux */
const B = (style = BorderStyle.NONE, size = 0, color = 'FFFFFF') => ({ style, size, color });
const SANS = { top: B(), bottom: B(), left: B(), right: B(), insideHorizontal: B(), insideVertical: B() };
const FIN = (c = LIGNE) => B(BorderStyle.SINGLE, 4, c);
// cellules : {b: blocs, fond, bords, va, dir, span, marges}
function T(largeurs, lignes, o = {}) {
  const total = largeurs.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA }, columnWidths: largeurs, layout: TableLayoutType.FIXED,
    borders: o.bords || SANS,
    rows: lignes.map((l) => {
      let col = 0;
      return new TableRow({
        tableHeader: !!l.entete, cantSplit: l.coupe !== true,
        height: l.h ? { value: l.h, rule: HeightRule.ATLEAST } : undefined,
        children: l.c.map((c) => {
          const span = c.span || 1;
          const w = largeurs.slice(col, col + span).reduce((a, b) => a + b, 0); col += span;
          const blocs = (c.b && c.b.length ? c.b : [vide()]);
          if (blocs[blocs.length - 1] instanceof Table) blocs.push(vide());
          return new TableCell({
            width: { size: w, type: WidthType.DXA }, columnSpan: span > 1 ? span : undefined,
            shading: c.fond ? { type: ShadingType.CLEAR, color: 'auto', fill: c.fond } : undefined,
            borders: c.bords, verticalAlign: c.va || VerticalAlign.TOP, textDirection: c.dir,
            margins: c.marges || { top: 70, bottom: 70, left: 110, right: 110 }, children: blocs,
          });
        }),
      });
    }),
  });
}
const parts = (n, total = W) => Array.from({ length: n }, (_, i) => Math.floor(total / n) + (i < total % n ? 1 : 0));
function boite(blocs, o = {}) {
  const bord = o.bord ? B(o.tiret ? BorderStyle.DASHED : BorderStyle.SINGLE, o.epais || 6, o.bord) : B();
  return T([o.largeur || W], [{ c: [{ b: blocs, fond: o.fond, va: o.va,
    bords: { top: o.haut ? B(BorderStyle.SINGLE, 18, o.haut) : bord, bottom: bord, right: bord,
      left: o.gauche ? B(BorderStyle.SINGLE, 24, o.gauche) : bord },
    marges: o.marges || { top: 110, bottom: 110, left: 170, right: 170 } }] }]);
}
const grilleCols = (el, def) => {
  const s = el.getAttribute('style') || '';
  const m = s.match(/grid-template-columns:\s*([^;]+)/);
  if (!m) return def;
  const r = m[1].match(/repeat\((\d+)/); if (r) return Array(+r[1]).fill(1);
  return m[1].trim().split(/\s+/).map((x) => parseFloat(x) || 1);
};
const largeursFr = (fr, total = W) => { const s = fr.reduce((a, b) => a + b, 0); const l = fr.map((f) => Math.floor(total * f / s)); l[l.length - 1] += total - l.reduce((a, b) => a + b, 0); return l; };

/* ------------------------------------------------------------ Composants */
const INLINE = new Set(['span', 'b', 'strong', 'i', 'em', 'small', 'sup', 'q', 'a', 'br', 'svg', 'code']);
const estBloc = (el) => !INLINE.has(el.tagName.toLowerCase()) || ['pr-gros-num', 'pr-tuile-ic', 'fr-etape-ic'].some((c) => el.classList.contains(c));

function enfants(el) {
  const kids = [...el.childNodes];
  if (![...el.children].some(estBloc)) { const s = seg(el); return s.some((x) => x.t && x.t.trim()) ? [P(s)] : []; }
  const out = []; let tampon = [];
  const vider = () => { if (tampon.some((x) => x.t && x.t.trim())) out.push(P(tampon)); tampon = []; };
  kids.forEach((n) => {
    if (n.nodeType === 3) { tampon.push({ t: n.textContent.replace(/\s+/g, ' '), st: {} }); return; }
    if (n.nodeType !== 1) return;
    if (!estBloc(n)) { tampon.push(...seg({ childNodes: [n] })); return; }
    vider(); out.push(...bloc(n));
  });
  vider();
  return out;
}
const apresTable = (l) => l.flatMap((x) => (x instanceof Table ? [x, vide(4, 80)] : [x]));

function liste(ul, o = {}) {
  return [...ul.children].map((li) => P(seg(li), { puce: ul.tagName === 'OL' ? 'nums' : 'puces', size: o.size || 18, after: 40, color: o.color }));
}
function cases(div, o = {}) {
  const items = [...div.querySelectorAll('.ms-case')];
  const colonne = /column/.test(div.getAttribute('style') || '') || div.closest('.ms-quiz');
  if (colonne) return items.map((c) => P([{ t: '☐  ', st: { color: DOM, size: 22 } }, ...seg(c)], { size: o.size || 17, after: 30 }));
  const s = [];
  items.forEach((c, i) => { if (i) s.push({ t: '      ', st: {} }); s.push({ t: '☐ ', st: { color: DOM, size: 22 } }, ...seg(c)); });
  return [P(s, { size: o.size || 17, after: 40 })];
}
function champ(div) {
  if (div.classList.contains('ms-cases')) return cases(div);
  if (!div.children.length || div.classList.contains('ms-txt')) return [P(seg(div), { size: 18, color: GRIS })];
  const out = [];
  [...div.children].forEach((c) => {
    const cl = c.classList;
    if (cl.contains('ms-lab')) out.push(P(txt(c), { size: 13, bold: true, color: ACC, caps: true, after: 0 }));
    else if (cl.contains('ms-ligne')) out.push(ligneEcrire(txt(c), cl.contains('grand')));
    else if (cl.contains('ms-cases')) out.push(...cases(c));
    else out.push(...bloc(c));
  });
  return out;
}
function formulaire(el, bords) {
  const fr = grilleCols(el, [1, 1, 1, 1]); const n = fr.length; const larg = largeursFr(fr);
  const lignes = []; let cur = [], occ = 0;
  [...el.children].forEach((d) => {
    const cl = d.classList;
    let span = cl.contains('plein') ? n : cl.contains('d3') ? 3 : cl.contains('d2') ? 2 : 1; span = Math.min(span, n);
    if (occ + span > n) { if (occ < n) cur.push({ b: [vide()], span: n - occ }); lignes.push({ c: cur }); cur = []; occ = 0; }
    cur.push({ b: champ(d), span }); occ += span;
  });
  if (cur.length) { if (occ < n) cur.push({ b: [vide()], span: n - occ }); lignes.push({ c: cur }); }
  return T(larg, lignes, { bords: bords || { top: FIN(), bottom: FIN(), right: FIN(), left: B(BorderStyle.SINGLE, 24, DOM), insideHorizontal: B(), insideVertical: B() } });
}

function tableau(table) {
  const trs = [...table.querySelectorAll(':scope > tbody > tr, :scope > tr')];
  const premiere = trs[0]; const ncol = [...premiere.children].reduce((n, c) => n + (+c.getAttribute('colspan') || 1), 0);
  const pct = [...premiere.children].map((c) => { const m = (c.getAttribute('style') || '').match(/width:\s*([\d.]+)%/); return m ? +m[1] : null; });
  const cl = table.classList;
  if (cl.contains('ms-duerp')) premiere.querySelectorAll('.n').forEach((c) => { pct[[...premiere.children].indexOf(c)] = 5; });
  if (cl.contains('ms-matrice')) premiere.querySelectorAll('.v').forEach((c) => { pct[[...premiere.children].indexOf(c)] = 5.2; });
  if (cl.contains('ms-grille')) premiere.querySelectorAll('.c').forEach((c) => { pct[[...premiere.children].indexOf(c)] = 6; });
  const fixe = pct.reduce((a, b) => a + (b || 0), 0); const libres = pct.filter((p) => p == null).length;
  const larg = largeursFr(pct.map((p) => (p == null ? Math.max(5, (100 - fixe) / Math.max(libres, 1)) : p)));
  const registre = cl.contains('ms-registre') || cl.contains('ms-grille');
  // Hauteurs des lignes vides, un peu sous celles du HTML : Word ajoute ses marges de cellule.
  const hVide = Math.round(0.8 * (cl.contains('ms-matrice') ? 465 : cl.contains('haut') ? 600 : cl.contains('ms-grille') ? 363 : cl.contains('ms-suivi') ? 545 : cl.contains('ms-objectifs') ? 480 : 430));
  const taille = cl.contains('ms-duerp') ? 13.5 : cl.contains('ms-corresp') || registre ? 15 : 17;
  const lignes = trs.map((tr, i) => {
    const th = tr.querySelector('th');
    if (th) {
      const vert = tr.querySelector('th.v');
      return { entete: true, h: vert ? Math.round(30 * MM) : undefined, c: [...tr.children].map((c) => ({
        b: [P(txt(c), { size: 13, bold: true, color: 'FFFFFF', caps: true, after: 0, align: c.classList.contains('c') || c.classList.contains('n') ? AlignmentType.CENTER : undefined })],
        fond: DOM, va: vert ? VerticalAlign.BOTTOM : VerticalAlign.CENTER, span: +c.getAttribute('colspan') || 1,
        dir: c.classList.contains('v') ? TextDirection.BOTTOM_TO_TOP_LEFT_TO_RIGHT : undefined,
        marges: { top: 60, bottom: 60, left: 80, right: 80 } })) };
    }
    const axe = tr.classList.contains('axe'); const pre = tr.classList.contains('pre');
    const videLigne = !tr.textContent.trim();
    return { h: videLigne ? hVide : undefined, c: [...tr.children].map((c, k) => {
      const ccl = c.classList;
      const st = { size: taille };
      if (axe) Object.assign(st, { bold: true, color: DOM, caps: true });
      else if (ccl.contains('echu')) Object.assign(st, { bold: true, color: 'FFFFFF' });
      else if (ccl.contains('bientot')) Object.assign(st, { bold: true, color: ACC });
      else if (ccl.contains('dom')) Object.assign(st, { bold: true, color: ACC, size: 13 });
      else if (k === 0 && (!registre || pre || tr.classList.contains('rempli'))) Object.assign(st, { bold: true, color: DOM });
      const centre = ccl.contains('c') || ccl.contains('n') || ccl.contains('dom') || (cl.contains('ms-matrice') && k > 0);
      return { b: [P(seg(c), { ...st, after: 0, align: centre ? AlignmentType.CENTER : undefined })],
        span: +c.getAttribute('colspan') || 1, va: VerticalAlign.CENTER,
        fond: axe ? CLAIR : ccl.contains('echu') ? DOM : (!registre && i % 2 === 0 ? 'F7F9FB' : undefined),
        marges: { top: 50, bottom: 50, left: 80, right: 80 } };
    }) };
  });
  return T(larg, lignes, { bords: { top: FIN(), bottom: FIN(), left: FIN(), right: FIN(), insideHorizontal: FIN('E9EDF1'), insideVertical: FIN('E9EDF1') } });
}

/* Les composants, du plus spécifique au plus général. */
const COMPOSANTS = [
  ['fr-pied', () => []], ['pr-ressort', () => []], ['ms-languettes', () => []], ['fr-etape-vignette', () => []],
  ['pr-tuile-ic', () => []], ['pr-fort-ic', () => []], ['ms-inserer-ic', () => []], ['signe', () => []],

  // Le cartouche est dans l'en-tête Word (voir convertir) ; ici, le titre de
  // la page, dans un bloc qui réserve la hauteur du cartouche à sa droite.
  ['fr-entete', (el) => {
    const titre = el.querySelector('.fr-titre').cloneNode(true); titre.querySelectorAll('.lv-suite').forEach((x) => x.remove());
    const g = [P(txt(titre), { size: 40, bold: true, color: DOM, caps: true, after: 20 }),
      P(txt(el.querySelector('.fr-soustitre')), { size: 24, bold: true, color: ACC, caps: true, after: 0 }),
      P('━━━', { size: 18, color: ACC, after: 60 })];
    const r = el.querySelector('.fr-resume'); if (r) g.push(P(seg(r), { size: 17, color: GRIS, after: 0 }));
    return [T([Math.round(CARTOUCHE.titreMm * MM)], [{ h: Math.round(CARTOUCHE.reserveMm * MM), c: [{ b: g, marges: { top: 0, bottom: 0, left: 0, right: 0 } }] }]), vide(4, 100)];
  }],
  ['pr-section', (el) => [P(txt(el), { size: 22, bold: true, color: DOM, caps: true, before: 200, after: 100, keepNext: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACC, space: 2 } } })]],

  ['fr-etapes', (el) => {
    const avecExtra = !!el.querySelector('.fr-etape > .pr-qr, .fr-etape > .pr-gros-num, .fr-etape > .pr-date');
    const lignes = [...el.querySelectorAll(':scope > .fr-etape')].map((e) => {
      const col = couleur(e);
      const t = e.querySelector('.fr-etape-txt');
      const b = [];
      [...t.children].forEach((c) => {
        if (c.classList.contains('fr-etape-titre')) b.push(P(seg(c), { size: 20, bold: true, color: col, after: 30 }));
        else b.push(...bloc(c, { taille: 17 }));
      });
      const extra = [...e.children].filter((c) => /pr-qr|pr-gros-num|pr-date/.test(c.className));
      const cells = [{ b: [P(txt(e.querySelector('.fr-etape-pastille')), { size: 30, bold: true, color: 'FFFFFF', align: AlignmentType.CENTER, after: 0 })], fond: col, va: VerticalAlign.CENTER },
        { b, va: VerticalAlign.CENTER }];
      if (extra.length) cells.push({ b: extra.flatMap((x) => bloc(x)), va: VerticalAlign.CENTER });
      if (avecExtra && !extra.length) cells.push({ b: [vide()] });
      return { c: cells };
    });
    return [T(avecExtra ? [750, W - 750 - 2100, 2100] : [750, W - 750], lignes, { bords: { top: FIN(), bottom: FIN(), left: FIN(), right: FIN(), insideHorizontal: B(BorderStyle.SINGLE, 12, 'FFFFFF'), insideVertical: B() } })];
  }],
  ['pr-gros-num', (el) => [P(txt(el), { size: 56, bold: true, color: 'FFFFFF', fond: couleur(el.closest('.fr-etape') || el), align: AlignmentType.CENTER, after: 0 })]],
  ['pr-date', (el) => [P(txt(el.querySelector('b')), { size: 44, bold: true, color: DOM, align: AlignmentType.CENTER, after: 0 }), P(txt(el.querySelector('span')), { size: 15, bold: true, color: DOM, caps: true, align: AlignmentType.CENTER })]],
  ['pr-qr', (el) => [image(el.querySelector('img').getAttribute('src'), 30) || vide(), P(txt(el.querySelector('span')), { size: 13, bold: true, color: DOM, align: AlignmentType.CENTER, caps: true })]],
  ['fr-etape-meta', (el) => [P([...el.querySelectorAll('.fr-meta')].flatMap((m, i) => [...(i ? [{ t: '   ·   ', st: {} }] : []), ...seg(m)]), { size: 14, color: GRIS })]],

  ['pr-tuiles', (el) => {
    const n = (el.getAttribute('style') || '').match(/repeat\((\d)/) ? +RegExp.$1 : 2;
    const lignes = []; let cur = [];
    [...el.children].forEach((t) => {
      const col = couleur(t);
      const b = [];
      t.querySelectorAll('.pr-tuile-titre').forEach((x) => b.push(P(seg(x), { size: 20, bold: true, color: col, after: 30 })));
      t.querySelectorAll('.pr-tuile-txt').forEach((x) => b.push(...enfants(x).map((p) => p)));
      const cell = { b, bords: { top: B(BorderStyle.SINGLE, 18, col), bottom: FIN(), left: FIN(), right: FIN() } };
      if (t.classList.contains('pleine')) { if (cur.length) lignes.push({ c: cur.concat(Array(n - cur.length).fill({ b: [vide()] })) }); lignes.push({ c: [{ ...cell, span: n }] }); cur = []; return; }
      cur.push(cell); if (cur.length === n) { lignes.push({ c: cur }); cur = []; }
    });
    if (cur.length) lignes.push({ c: cur.concat(Array(n - cur.length).fill({ b: [vide()] })) });
    return [T(parts(n), lignes, { bords: { ...SANS, insideVertical: B(BorderStyle.SINGLE, 24, 'FFFFFF'), insideHorizontal: B(BorderStyle.SINGLE, 24, 'FFFFFF') } })];
  }],
  ['pr-check', (el) => {
    const cas = el.classList.contains('pr-cas');
    const b = [...el.querySelectorAll('li')].map((li) => (cas ? P(seg(li), { puce: 'puces', size: 18, after: 50 })
      : P([{ t: '☐  ', st: { color: DOM, size: 22 } }, ...seg(li)], { size: 18, after: 60 })));
    return [boite(b, { bord: LIGNE, gauche: DOM })];
  }],
  ['pr-fort', (el) => {
    const t = el.querySelector('.pr-fort-txt').cloneNode(true); const ti = t.querySelector('b.titre'); if (ti) ti.remove();
    return [boite([P(txt(el.querySelector('b.titre')), { size: 22, bold: true, color: DOM, caps: true, after: 40 }), P(seg(t), { size: 18 })], { fond: 'EEF0F3', bord: DOM, epais: 10 })];
  }],
  ['fr-declencheur', (el) => [boite([P(txt(el.querySelector('.fr-declencheur-lab')), { size: 14, bold: true, color: couleur(el, PAL.fam || DOM), caps: true, after: 30 }), ...enfants(el.querySelector('.fr-declencheur-txt'))], { bord: LIGNE, gauche: PAL.fam || DOM })]],
  ['pr-duo', (el) => [T(parts(2), [{ c: [...el.children].map((d) => {
    const oui = d.classList.contains('oui'); const c = oui ? '2E6444' : '8C2F26';
    const b = [P((oui ? '✔  ' : '✘  ') + txt(d.querySelector('b.titre')), { size: 20, bold: true, color: c, caps: true, after: 30 })];
    d.querySelectorAll('p').forEach((p) => b.push(P(seg(p), { size: 17, color: GRIS })));
    return { b, fond: oui ? 'EEF6F0' : 'FBEDEB', bords: { top: B(BorderStyle.SINGLE, 8, c), bottom: B(BorderStyle.SINGLE, 8, c), left: B(BorderStyle.SINGLE, 8, c), right: B(BorderStyle.SINGLE, 8, c) } };
  }) }], { bords: { ...SANS, insideVertical: B(BorderStyle.SINGLE, 30, 'FFFFFF') } })]],
  ['pr-deux', (el) => [T(parts(2), [{ c: [...el.children].map((d) => ({ b: apresTable(bloc(d)) })) }])]],
  ['pr-exemple', (el) => {
    const lab = el.querySelector('.pr-exemple-lab'); const c = el.cloneNode(true); const l2 = c.querySelector('.pr-exemple-lab'); if (l2) l2.remove();
    return [boite([...(lab ? [P(txt(lab), { size: 13, bold: true, color: ACC, caps: true, after: 30 })] : []), ...enfants(c)], { bord: LIGNE })];
  }],
  ['fr-bandeau', (el) => [boite([P(txt(el.querySelector('.fr-bandeau-l1')), { size: 22, bold: true, color: 'FFFFFF', caps: true, after: 30 }),
    P(txt(el.querySelector('.fr-bandeau-l2')), { size: 18, bold: true, color: '6FC1EA', caps: true, after: 0 })], { fond: DOM, marges: { top: 160, bottom: 160, left: 260, right: 260 } })]],
  ['pr-refs', (el) => [P(seg(el), { size: 14, color: PALE, before: 120, border: { top: { style: BorderStyle.SINGLE, size: 4, color: LIGNE, space: 4 } } })]],
  ['pr-chips', (el) => [P([...el.children].flatMap((c, i) => [...(i ? [{ t: '   ·   ', st: { color: PALE } }] : []), { t: txt(c), st: { bold: true, color: ACC } }]), { size: 17, caps: true })]],
  ['pr-liste', (el) => liste(el, { size: 17 })],
  ['pr-capture-legende', (el) => [P(seg(el), { size: 14, italics: true, color: PALE, align: AlignmentType.CENTER })]],

  ['rx-table', (el) => [tableau(el)]],
  ['ms-form', (el) => [formulaire(el)]],
  ['ms-couv-site', (el) => [formulaire(el, { top: FIN(), bottom: FIN(), right: FIN(), left: B(BorderStyle.SINGLE, 30, ACC), insideHorizontal: B(), insideVertical: B() })]],
  ['ms-cases', (el) => cases(el)],
  ['ms-signatures', (el) => {
    const n = +((el.getAttribute('style') || '').match(/--cols:\s*(\d)/) || [0, 3])[1];
    return [T(parts(n), [{ h: Math.round((el.classList.contains('bas') ? 19 : 24) * MM), c: [...el.children].map((d) => ({
      b: [P(txt(d.querySelector('.ms-lab')), { size: 13, bold: true, color: ACC, caps: true, after: 0 }), ...(d.querySelector('small') ? [P(txt(d.querySelector('small')), { size: 14, color: PALE })] : [])],
      bords: { top: B(BorderStyle.SINGLE, 18, ACC), bottom: FIN(), left: FIN(), right: FIN() } })) }], { bords: { ...SANS, insideVertical: B(BorderStyle.SINGLE, 24, 'FFFFFF') } })];
  }],
  ['ms-inserer', (el) => {
    const corps = el.querySelector(':scope > div');
    const b = [P(txt(corps.querySelector('h3')), { size: 26, bold: true, color: DOM, caps: true, after: 60 })];
    corps.querySelectorAll(':scope > p').forEach((p) => b.push(P(seg(p), { size: 18, color: GRIS })));
    const meta = corps.querySelector('.ms-inserer-meta');
    if (meta) b.push(T(parts(3, W - 400), [{ c: [...meta.children].map((d) => ({ b: champ(d) })) }]));
    return [boite(b, { bord: '9AAAB9', tiret: true, epais: 12, marges: { top: 200, bottom: 200, left: 240, right: 240 } })];
  }],
  ['ms-risques', (el) => {
    const cells = [...el.children].map((r) => {
      const col = couleur(r);
      const b = [P([{ t: txt(r.querySelector('.ms-risque-titre')), st: {} }, { t: '   ' + txt(r.querySelector('.ms-sse')), st: { size: 12 } }], { size: 18, bold: true, color: 'FFFFFF', caps: true, fond: col, after: 60 })];
      const q = r.querySelector('.quand'); if (q) b.push(P(seg(q), { size: 15, italics: true, color: PALE }));
      r.querySelectorAll('li').forEach((li) => b.push(P(seg(li), { puce: 'puces', size: 16, after: 20 })));
      const si = r.querySelector('.si');
      if (si) { const c = si.cloneNode(true); const l = c.querySelector('b'); const lab = txt(l); l.remove();
        b.push(P([{ t: lab.toUpperCase() + '  ', st: { bold: true, color: col, size: 13 } }, ...seg(c)], { size: 15, fond: col === ACC ? CLAIR : 'EEF0F3', before: 60 })); }
      return { b, bords: { top: FIN(), bottom: FIN(), left: FIN(), right: FIN() }, marges: { top: 0, bottom: 80, left: 100, right: 100 } };
    });
    const lignes = []; for (let i = 0; i < cells.length; i += 2) lignes.push({ c: [cells[i], cells[i + 1] || { b: [vide()] }] });
    return [T(parts(2), lignes, { bords: { ...SANS, insideVertical: B(BorderStyle.SINGLE, 30, 'FFFFFF'), insideHorizontal: B(BorderStyle.SINGLE, 30, 'FFFFFF') } })];
  }],
  ['ms-quiz', (el) => {
    const cells = [...el.children].map((q) => {
      const t = q.querySelector('.ms-quiz-q'); const n = txt(t.querySelector('span')); const c = t.cloneNode(true); c.querySelector('span').remove();
      return { b: [P([{ t: n + '. ', st: { color: ACC } }, ...seg(c)], { size: 18, bold: true, after: 40 }), ...cases(q.querySelector('.ms-cases'), { size: 16 })], bords: { top: FIN(), bottom: FIN(), left: FIN(), right: FIN() } };
    });
    const lignes = []; for (let i = 0; i < cells.length; i += 2) lignes.push({ c: [cells[i], cells[i + 1] || { b: [vide()] }] });
    return [T(parts(2), lignes, { bords: { ...SANS, insideVertical: B(BorderStyle.SINGLE, 24, 'FFFFFF'), insideHorizontal: B(BorderStyle.SINGLE, 24, 'FFFFFF') } })];
  }],
  ['ms-score', (el) => [boite([P([{ t: 'Score :  ______ / 10     ', st: { bold: true, size: 22 } }, ...seg(el.querySelector(':scope > div:last-child'))], { color: 'FFFFFF', size: 17, after: 0 })], { fond: DOM })]],
  ['ms-corrige', (el) => [P(seg(el), { size: 14, color: PALE, before: 80, align: AlignmentType.CENTER })]],
  ['ms-questions', (el) => [T([600, 3900, W - 4500], [...el.children].map((d) => ({ c: [
    { b: [P(txt(d.querySelector('.n')), { size: 20, bold: true, color: 'FFFFFF', align: AlignmentType.CENTER, after: 0 })], fond: ACC, va: VerticalAlign.CENTER },
    { b: [P(seg(d.querySelector('.q')), { size: 19, bold: true, color: DOM, after: 0 })], va: VerticalAlign.CENTER },
    { b: [P(seg(d.querySelector('.r')), { size: 16, color: GRIS, after: 0 })], va: VerticalAlign.CENTER }] })),
  { bords: { top: FIN(), bottom: FIN(), left: FIN(), right: FIN(), insideHorizontal: FIN(), insideVertical: B() } })]],
  ['ms-cycle', (el) => {
    const n = el.children.length;
    return [T(parts(n), [{ c: [...el.children].map((d) => { const col = couleur(d); return { b: [P(txt(d.querySelector('b')), { size: 18, bold: true, color: col, caps: true, align: AlignmentType.CENTER, after: 30 }), P(seg(d.querySelector(':scope > span')), { size: 15, color: PALE, align: AlignmentType.CENTER, after: 0 })],
      bords: { top: B(BorderStyle.SINGLE, 18, col), bottom: FIN(), left: FIN(), right: FIN() } }; }) }], { bords: { ...SANS, insideVertical: B(BorderStyle.SINGLE, 24, 'FFFFFF') } })];
  }],
  ['ms-chiffres', (el) => {
    const n = el.children.length;
    return [T(parts(n), [{ c: [...el.children].map((d, i) => ({ b: [P(txt(d.querySelector('b')), { size: 40, bold: true, color: i % 2 ? ACC : DOM, align: AlignmentType.CENTER, after: 20 }), P(seg(d.querySelector('span')), { size: 15, color: PALE, align: AlignmentType.CENTER, after: 0 })],
      bords: { top: FIN(), bottom: FIN(), left: FIN(), right: FIN() } })) }], { bords: { ...SANS, insideVertical: B(BorderStyle.SINGLE, 24, 'FFFFFF') } })];
  }],
  ['ms-axes', (el) => [T(parts(5), [{ c: [...el.children].map((a, i) => ({ b: [
    P(' ' + txt(a.querySelector('.ms-axe-num')) + ' ', { size: 28, bold: true, color: 'FFFFFF', fond: i % 2 ? ACC : DOM, align: AlignmentType.CENTER, after: 40 }),
    P(txt(a.querySelector('.ms-axe-titre')), { size: 17, bold: true, color: DOM, caps: true, align: AlignmentType.CENTER, after: 20 }),
    P(txt(a.querySelector('.ms-axe-txt')), { size: 15, color: PALE, align: AlignmentType.CENTER, after: 0 })] })) }])]],
  ['ms-sommaire', (el) => [T([800, W - 800 - 1900, 1900], [...el.children].map((d, i) => ({ c: [
    { b: [P(txt(d.querySelector('.ms-som-num')), { size: 30, bold: true, color: 'FFFFFF', align: AlignmentType.CENTER, after: 0 })], fond: i % 2 ? ACC : DOM, va: VerticalAlign.CENTER },
    { b: [P(txt(d.querySelector('.ms-som-titre')), { size: 20, bold: true, color: DOM, caps: true, after: 10 }), P(seg(d.querySelector('.ms-som-desc')), { size: 15, color: PALE, after: 0 })], va: VerticalAlign.CENTER },
    { b: [P(seg(d.querySelector('.ms-som-axe')), { size: 13, bold: true, color: ACC, caps: true, align: AlignmentType.RIGHT, after: 0 })], va: VerticalAlign.CENTER }] })),
  { bords: { ...SANS, insideHorizontal: B(BorderStyle.SINGLE, 24, 'FFFFFF') } })]],
  ['ms-roles', (el) => {
    const cells = [...el.children].map((r) => {
      const col = couleur(r);
      const ch = [...r.querySelectorAll('.ms-role-champs span')].flatMap((s, i) => [...(i ? [{ t: '     ', st: {} }] : []),
        s.classList.contains('v') ? { t: txt(s), st: { bold: true, color: TEXTE } } : { t: txt(s) + ' : ________________', st: { color: PALE, size: 14 } }]);
      return { b: [P(txt(r.querySelector('.ms-role-titre')), { size: 18, bold: true, color: col, caps: true, after: 20 }), P(seg(r.querySelector('.ms-role-txt')), { size: 15, color: PALE, after: 60 }), P(ch, { size: 16, after: 0 })],
        bords: { left: B(BorderStyle.SINGLE, 24, col), top: FIN(), bottom: FIN(), right: FIN() } };
    });
    const lignes = []; for (let i = 0; i < cells.length; i += 2) lignes.push({ c: [cells[i], cells[i + 1] || { b: [vide()] }] });
    return [T(parts(2), lignes, { bords: { ...SANS, insideVertical: B(BorderStyle.SINGLE, 24, 'FFFFFF'), insideHorizontal: B(BorderStyle.SINGLE, 24, 'FFFFFF') } })];
  }],
  ['ms-urgences', (el) => {
    const n = grilleCols(el, [1, 1, 1, 1]).length;
    return [T(parts(n), [{ c: [...el.children].map((d) => {
      const v = d.classList.contains('vide'); const col = couleur(d);
      const s = d.querySelector('span').cloneNode(true);
      return { b: [v ? ligneEcrire('') : P(txt(d.querySelector(':scope > b')), { size: n > 4 ? 30 : 44, bold: true, color: 'FFFFFF', align: AlignmentType.CENTER, after: 20 }),
        P(seg(s), { size: 14, color: v ? DOM : 'FFFFFF', align: AlignmentType.CENTER, after: 0 })],
      fond: v ? undefined : col, va: VerticalAlign.CENTER, bords: v ? { top: B(BorderStyle.DASHED, 6, '9AAAB9'), bottom: B(BorderStyle.DASHED, 6, '9AAAB9'), left: B(BorderStyle.DASHED, 6, '9AAAB9'), right: B(BorderStyle.DASHED, 6, '9AAAB9') } : undefined };
    }) }], { bords: { ...SANS, insideVertical: B(BorderStyle.SINGLE, 24, 'FFFFFF') } })];
  }],
  ['ms-annee', (el) => {
    const cells = [...el.children].map((m) => {
      const col = couleur(m);
      const b = [P(txt(m.querySelector('.ms-mois-tete')), { size: 16, bold: true, color: 'FFFFFF', caps: true, fond: col, after: 60 })];
      const dom = m.querySelector('.ms-mois-dom'); if (dom) b.push(P(txt(dom), { size: 12, bold: true, color: ACC, caps: true, after: 10 }));
      b.push(P(txt(m.querySelector('.ms-mois-theme')), { size: 18, bold: true, color: DOM, after: 20 }), P(seg(m.querySelector('.ms-mois-txt')), { size: 15, color: PALE, after: 60 }));
      b.push(P([...m.querySelectorAll('.ms-mois-fait span')].map((s) => ({ t: txt(s) + ' ______  ', st: {} })), { size: 12, bold: true, color: '9AA5B1', caps: true, after: 0 }));
      return { b, bords: { top: FIN(), bottom: FIN(), left: FIN(), right: FIN() }, marges: { top: 0, bottom: 80, left: 100, right: 100 } };
    });
    const lignes = []; for (let i = 0; i < cells.length; i += 3) lignes.push({ c: cells.slice(i, i + 3) });
    return [T(parts(3), lignes, { bords: { ...SANS, insideVertical: B(BorderStyle.SINGLE, 24, 'FFFFFF'), insideHorizontal: B(BorderStyle.SINGLE, 24, 'FFFFFF') } })];
  }],
  ['ms-cotation', (el) => {
    const F = { c1: ['E5F2F9', DOM], c2: ['B3DAEE', DOM], c3: ['64707F', 'FFFFFF'], c4: [DOM, 'FFFFFF'], lab: ['FFFFFF', GRIS], coin: [undefined, ACC] };
    const d = [...el.children]; const lignes = [];
    for (let i = 0; i < d.length; i += 5) lignes.push({ h: Math.round(11 * MM), c: d.slice(i, i + 5).map((x) => {
      const k = Object.keys(F).find((c) => x.classList.contains(c)) || 'lab';
      const sm = x.querySelector('small'); const c = x.cloneNode(true); if (c.querySelector('small')) c.querySelector('small').remove();
      const b = [P(seg(c), { size: k === 'coin' ? 12 : 16, bold: true, color: F[k][1], align: AlignmentType.CENTER, after: 0, caps: k === 'coin' })];
      if (sm) b.push(P(txt(sm), { size: 13, color: PALE, align: AlignmentType.CENTER, after: 0 }));
      return { b, fond: F[k][0], va: VerticalAlign.CENTER };
    }) });
    return [T([1600, ...parts(4, W - 1600)], lignes, { bords: { ...SANS, insideVertical: B(BorderStyle.SINGLE, 16, 'FFFFFF'), insideHorizontal: B(BorderStyle.SINGLE, 16, 'FFFFFF') } })];
  }],
  ['ms-legende', (el) => [P([...el.children].flatMap((s, i) => [...(i ? [{ t: '      ', st: {} }] : []), { t: '■ ', st: { color: i ? DOM : 'B3DAEE', size: 22 } }, { t: txt(s), st: {} }]), { size: 16, color: GRIS })]],
  ['ms-5p', (el) => [T([1700, W - 1700], [...el.children].map((d) => { const f = d.classList.contains('fond'); return { c: [
    { b: [P(txt(d.querySelector('.p')), { size: 15, bold: true, color: f ? DOM : ACC, caps: true, align: AlignmentType.RIGHT, after: 0 })], va: VerticalAlign.CENTER },
    { b: [P(seg(d.querySelector('.r')), { size: 17, color: f ? 'FFFFFF' : TEXTE, after: 0 })], fond: f ? DOM : undefined, va: VerticalAlign.CENTER,
      bords: { left: B(BorderStyle.SINGLE, 18, f ? DOM : ACC), top: FIN(), bottom: FIN(), right: FIN() } }] }; }),
  { bords: { ...SANS, insideHorizontal: B(BorderStyle.SINGLE, 16, 'FFFFFF') } })]],
  ['ms-echelles', (el) => [T(parts(4), [{ c: [...el.children].map((e) => { const col = couleur(e); return { b: [
    P(txt(e.querySelector('h4')), { size: 16, bold: true, color: 'FFFFFF', caps: true, fond: col, after: 60 }),
    ...[...e.querySelectorAll('li')].map((li) => { const c = li.cloneNode(true); const b = c.querySelector('b'); const v = txt(b); b.remove(); return P([{ t: v + '   ', st: { bold: true, color: col, size: 17 } }, ...seg(c)], { size: 14, color: GRIS, after: 40 }); })],
    bords: { top: FIN(), bottom: FIN(), left: FIN(), right: FIN() }, marges: { top: 0, bottom: 80, left: 100, right: 100 } }; }) }], { bords: { ...SANS, insideVertical: B(BorderStyle.SINGLE, 24, 'FFFFFF') } })]],
  ['ms-formule', (el) => [boite([P([...el.childNodes].map((n) => ({ t: n.textContent.replace(/\s+/g, ' '), st: { color: n.tagName === 'EM' ? '6FC1EA' : 'FFFFFF' } })), { size: 26, bold: true, align: AlignmentType.CENTER, after: 0 })], { fond: DOM })]],

  ['rx-id', (el) => {
    const lignes = []; let cur = [], occ = 0;
    [...el.children].forEach((d) => {
      const span = d.classList.contains('plein') ? 3 : d.classList.contains('large') ? 2 : 1;
      if (occ + span > 3) { lignes.push({ c: cur }); cur = []; occ = 0; }
      cur.push({ span, b: [P(txt(d.querySelector('.rx-lab')), { size: 12, bold: true, color: ACC, caps: true, after: 20 }), P(seg(d.querySelector('.rx-val')), { size: 17, after: 0 })],
        bords: { top: B(BorderStyle.SINGLE, 18, ACC), bottom: FIN(), left: FIN(), right: FIN() } }); occ += span;
    });
    if (cur.length) lignes.push({ c: occ < 3 ? cur.concat({ b: [vide()], span: 3 - occ }) : cur });
    return [T(parts(3), lignes, { bords: { ...SANS, insideVertical: B(BorderStyle.SINGLE, 24, 'FFFFFF'), insideHorizontal: B(BorderStyle.SINGLE, 24, 'FFFFFF') } })];
  }],
  ['rx-bilan', (el) => [T(parts(2), [{ c: [...el.children].map((d) => { const col = couleur(d); const b = [P(txt(d.querySelector('h3')), { size: 20, bold: true, color: col, caps: true, after: 60 })];
    [...d.children].forEach((c) => { if (c.tagName === 'UL') b.push(...liste(c, { size: 16 })); else if (c.classList.contains('ms-ligne')) b.push(ligneEcrire('')); });
    return { b, bords: { top: B(BorderStyle.SINGLE, 18, col), bottom: FIN(), left: FIN(), right: FIN() } }; }) }], { bords: { ...SANS, insideVertical: B(BorderStyle.SINGLE, 24, 'FFFFFF') } })]],
  ['rx-eval', (el) => [T([W - 2600, 2600], [...el.children].map((d) => { const g = d.classList.contains('global'); return { c: [
    { b: [P(seg(d.children[0]), { size: 17, bold: true, color: g ? 'FFFFFF' : TEXTE, after: 0 })], fond: g ? DOM : undefined, va: VerticalAlign.CENTER },
    { b: [P(seg({ childNodes: [d.children[1]] }), { size: 15, after: 0, align: AlignmentType.RIGHT, ...(g ? { color: 'FFFFFF' } : {}) })], fond: g ? DOM : undefined, va: VerticalAlign.CENTER }] }; }),
  { bords: { top: FIN(), bottom: FIN(), left: FIN(), right: FIN(), insideHorizontal: FIN() } })]],
  ['rx-chrono', (el) => [T([1100, W - 1100], [...el.children].map((li) => ({ c: [
    { b: [P(txt(li.querySelector('.rx-heure')), { size: 19, bold: true, color: DOM, align: AlignmentType.RIGHT, after: 0 })], va: VerticalAlign.CENTER, bords: { right: B(BorderStyle.SINGLE, 18, ACC) } },
    { b: [P(seg(li.querySelector('.rx-quoi')), { size: 17, after: 0, bold: li.classList.contains('fort') })], va: VerticalAlign.CENTER }] })),
  { bords: { ...SANS, insideHorizontal: B(BorderStyle.SINGLE, 8, 'FFFFFF') } })]],
  ['rx-photos', (el) => { const n = el.children.length || 1;
    return [T(parts(n), [{ c: [...el.children].map((f) => ({ b: figure(f, Math.floor(176 / n), n > 2 ? 55 : 95) })) }])]; }],
  ['rx-photo', (el) => figure(el, el.classList.contains('grande') ? 150 : 120, el.classList.contains('grande') ? 62 : 95)],
  ['ms-politique', (el) => [image(el.querySelector('img').getAttribute('src'), 160, 196) || vide()]],
  ['pr-capture', (el) => [image(el.getAttribute('src'), el.classList.contains('moyen') ? 95 : 110, 80) || vide()]],

  ['ms-couv', (el) => couverture(el)],
  ['ms-inter', (el) => intercalaire(el)],
  ['ms-bloc', (el) => enfants(el)],
];
function figure(f, largeur, hMax = 95) {
  const out = []; const img = f.querySelector('img');
  if (img) { const p = image(img.getAttribute('src'), largeur, hMax); if (p) out.push(p); }
  const cap = f.querySelector('figcaption'); if (cap) out.push(P(seg(cap), { size: 14, italics: true, color: PALE }));
  return out;
}

function couverture(el) {
  const h = el.querySelector('.ms-couv-haut');
  const bandeau = [image(global.LOGO, 22, 0, AlignmentType.LEFT) || vide(), vide(2, 300),
    P(txt(h.querySelector('.ms-couv-sur')), { size: 15, bold: true, color: '6FC1EA', caps: true, after: 60 }),
    // Le titre de la couverture HTML : texte en blanc, <span> en bleu ciel.
    P([...h.querySelector('.ms-couv-titre').childNodes].flatMap((n) => {
      if (n.nodeName === 'BR') return [{ t: ' ', st: {} }];
      const t = n.textContent.replace(/\s+/g, ' '); return t ? [{ t: t.toUpperCase(), st: { color: n.nodeType === 1 ? '6FC1EA' : 'FFFFFF' } }] : [];
    }), { size: 72, bold: true, after: 120 }),
    P([...h.querySelectorAll('.ms-couv-sse span')].map((s, i) => ({ t: (i ? '      ' : '') + txt(s).toUpperCase(), st: {} })), { size: 18, bold: true, color: 'FFFFFF', after: 0 })];
  const out = [boite(bandeau, { fond: DOM, marges: { top: 500, bottom: 500, left: 500, right: 500 } }), vide(4, 200)];
  [...el.children].forEach((c) => {
    if (c.classList.contains('ms-couv-haut') || c.tagName === 'FOOTER') return;
    if (c.classList.contains('ms-couv-regle')) {
      out.push(T(parts(3), [{ c: [...c.children].map((d) => { const col = couleur(d); const t = d.cloneNode(true); const ti = t.querySelector('b.titre'); const titre = txt(ti); ti.remove();
        return { b: [P(titre, { size: 18, bold: true, color: col, caps: true, after: 40 }), P(seg(t), { size: 16, color: GRIS, after: 0 })], bords: { top: B(BorderStyle.SINGLE, 18, col), bottom: FIN(), left: FIN(), right: FIN() } }; }) }],
      { bords: { ...SANS, insideVertical: B(BorderStyle.SINGLE, 24, 'FFFFFF') } }), vide(4, 120));
      return;
    }
    out.push(...apresTable(bloc(c)));
  });
  return out;
}
// Les onglets fantômes et l'onglet du chapitre sont dans l'en-tête de la
// page (voir convertir) : le contenu garde 16 mm libres à droite.
const DROITE = { right: Math.round(16 * MM) };
function intercalaire(el) {
  const num = el.querySelector('.ms-inter-num');
  const logo = lireImage(global.LOGO);
  const tete = new Paragraph({ spacing: { after: 560 }, children: [
    ...(logo ? [new ImageRun({ type: dims(logo).type, data: logo, transformation: { width: 42, height: Math.round(42 * dims(logo).h / dims(logo).w) } })] : []),
    ...runs([{ t: '    ' + txt(el.querySelector('.ms-inter-tete')), st: {} }], { size: 15, bold: true, color: '8B96A2', caps: true })] });
  const out = [tete,
    P([{ t: txt(num).replace('.', ''), st: { color: DOM } }, { t: '.', st: { color: ACC } }], { size: 150, bold: true, after: 0 }),
    P(txt(el.querySelector('.ms-inter-titre')), { size: 56, bold: true, color: DOM, caps: true, after: 120, indent: DROITE }),
    P(txt(el.querySelector('.ms-inter-axe')), { size: 17, bold: true, color: ACC, caps: true, fond: CLAIR, after: 200, indent: DROITE }),
    P(seg(el.querySelector('.ms-inter-pitch')), { size: 24, color: GRIS, after: 360, indent: DROITE })];
  const blocs = [...el.querySelectorAll('.ms-bloc')].map((b) => {
    const col = couleur(b);
    const c = [P(txt(b.querySelector('h3')), { size: 20, bold: true, color: col, caps: true, after: 80 })];
    b.querySelectorAll('.ms-contenu li').forEach((li, i) => c.push(P([{ t: (i + 1) + '.  ', st: { bold: true, color: DOM } }, ...seg(li)], { size: 18, after: 60 })));
    b.querySelectorAll('.ms-audit li').forEach((li) => c.push(P([{ t: '•   ', st: { bold: true, color: ACC } }, ...seg(li)], { size: 16, color: GRIS, after: 60 })));
    return { b: c, bords: { top: B(BorderStyle.SINGLE, 18, col), bottom: FIN(), left: FIN(), right: FIN() } };
  });
  out.push(T(largeursFr([1.15, 1], W - DROITE.right), [{ c: blocs }], { bords: { ...SANS, insideVertical: B(BorderStyle.SINGLE, 30, 'FFFFFF') } }));
  return out;
}

function bloc(el, o = {}) {
  if (el.nodeType !== 1) return [];
  const tag = el.tagName.toLowerCase(); const cl = el.classList;
  for (const [c, f] of COMPOSANTS) if (cl.contains(c)) return f(el, o).filter(Boolean);
  if (tag === 'table') return [tableau(el)];
  if (tag === 'ul' || tag === 'ol') return liste(el, { size: o.taille });
  if (tag === 'img') { const p = image(el.getAttribute('src'), 100, 80); return p ? [p] : []; }
  if (tag === 'figure') return figure(el, 120);
  if (tag === 'footer' || tag === 'header' || tag === 'script') return [];
  if (tag === 'p' || cl.contains('ms-txt') || cl.contains('rx-txt') || cl.contains('ms-note') || cl.contains('fr-etape-desc')) {
    const note = cl.contains('ms-note');
    if (!el.textContent.trim()) return [];
    return [P(seg(el), { size: note ? 15 : o.taille || 18, italics: note, color: note ? PALE : GRIS })];
  }
  return enfants(el);
}

/* ------------------------------------------------------------ Document */
async function convertir(fichier, sortie, requete) {
  DIR = path.dirname(fichier);
  const { dom } = await charger(fichier, requete);
  const doc = dom.window.document; global.LOGO = dom.window.SAMSIC_LOGO_B64;
  const variante = VARIANTE[doc.body.dataset.famille] || 'exploitation';
  const cartouche = fs.readFileSync(path.join(__dirname, 'img', 'word-cartouche-' + variante + '.png'));
  const ecusson = fs.readFileSync(path.join(__dirname, 'img', 'word-ecusson-' + variante + '.png'));
  const hCartMm = CARTOUCHE.lMm * dims(cartouche).h / dims(cartouche).w;
  CARTOUCHE.reserveMm = CARTOUCHE.yMm + hCartMm + 1.5 - 11;   // 11 mm : marge haute du corps
  // Un document à plusieurs chapitres (une couverture ou un intercalaire en
  // tête de chaque) devient une section Word par chapitre : chaque intercalaire
  // reçoit ainsi sa propre languette. Un onglet seul reste une seule section.
  const groupes = [];
  const pages = [...doc.querySelectorAll('.doc-page')];
  pages.forEach((page, i) => {
    const st = page.style;
    DOM = hex(st.getPropertyValue('--dom')) || '22344A'; ACC = hex(st.getPropertyValue('--acc')) || '0083BE';
    PAL = { dom: DOM, acc: ACC, fam: hex(st.getPropertyValue('--fam')) || DOM };
    for (let k = 1; k <= 6; k++) PAL['et-' + k] = hex(st.getPropertyValue('--et-' + k)) || DOM;
    const blocs = apresTable(enfants(page.querySelector('.fr-frame')));
    const debut = i === 0 || !!page.querySelector('.ms-inter, .ms-couv');
    if (debut) groupes.push({ page, corps: [] });
    else groupes[groupes.length - 1].corps.push(new Paragraph({ pageBreakBefore: true, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: '', size: 2 })] }));
    groupes[groupes.length - 1].corps.push(...blocs);
  });
  // En-tête Word : le cartouche, identique sur toutes les pages. Une couverture
  // ou un intercalaire en première page de section n'en a pas (« première page différente »).
  const enTete = () => new Header({ children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [
    new ImageRun({ type: 'png', data: cartouche,
      transformation: { width: Math.round(CARTOUCHE.lMm * 3.78), height: Math.round(hCartMm * 3.78) },
      floating: { horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: Math.round(CARTOUCHE.xMm * 36000) },
        verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: Math.round(CARTOUCHE.yMm * 36000) },
        wrap: { type: TextWrappingType.NONE }, allowOverlap: true, behindDocument: false, zIndex: 5 } }),
    new TextRun({ text: '', size: 2 })] })] });
  // Intercalaire : la colonne d'onglets du PDF, capturée par numéro de chapitre
  // (img/word-languette-N.png), à 190 mm du bord gauche et 17 mm du haut.
  const sansEnTete = (premiere) => {
    const languette = premiere.querySelector('.ms-languette');
    const nLang = languette ? parseInt(((languette.getAttribute('style') || '').match(/--n\s*:\s*(\d+)/) || [])[1], 10) || 0 : 0;
    const imgLang = nLang ? path.join(__dirname, 'img', 'word-languette-' + nLang + '.png') : '';
    return new Header({ children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [
    ...(imgLang && fs.existsSync(imgLang) ? [new ImageRun({ type: 'png', data: fs.readFileSync(imgLang),
      transformation: { width: Math.round(13 * 3.78), height: Math.round(234 * 3.78) },
      floating: { horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 190 * 36000 },
        verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: 17 * 36000 },
        wrap: { type: TextWrappingType.NONE }, allowOverlap: true, behindDocument: false, zIndex: 4 } })] : []),
    new TextRun({ text: '', size: 2 })] })] });
  };

  // Pied de page Word, comme celui des PDF : écusson entre deux filets, puis
  // provenance · page · mise à jour, agréments CNAPS et article L612-14.
  const pied = doc.querySelector('.fr-pied');
  const sp = pied ? [...pied.querySelectorAll('.fr-pied-provenance > span')] : [];
  const libelle = sp[1] ? txt(sp[1]).replace(/·\s*Page.*$/, '').trim() : '';
  const fil = variante === 'mase' ? 'B9DCEF' : 'DFD3AE';
  const filet = () => new Paragraph({ spacing: { before: 0, after: 90 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: fil, space: 1 } }, children: [new TextRun({ text: '', size: 2 })] });
  const r = (t, o = {}) => new TextRun({ text: t, font: FONT, size: 14, color: PALE, ...o });
  const piedPage = () => new Footer({ children: [
    T([Math.round((W - 14 * MM) / 2), Math.round(14 * MM), W - 2 * Math.round((W - 14 * MM) / 2) - Math.round(14 * MM)], [{ c: [
      { b: [filet()], va: VerticalAlign.CENTER, marges: { top: 0, bottom: 0, left: 0, right: 0 } },
      { b: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [new ImageRun({ type: 'png', data: ecusson, transformation: { width: 15, height: 15 } })] })], va: VerticalAlign.CENTER, marges: { top: 0, bottom: 0, left: 0, right: 0 } },
      { b: [filet()], va: VerticalAlign.CENTER, marges: { top: 0, bottom: 0, left: 0, right: 0 } }] }]),
    new Paragraph({ spacing: { before: 30, after: 20 },
      tabStops: [{ type: TabStopType.CENTER, position: Math.round(W / 2) }, { type: TabStopType.RIGHT, position: W }],
      children: [r(sp[0] ? txt(sp[0]) : ''), new TextRun({ children: [new Tab()] }), r(libelle + ' · '),
        r('Page ', { bold: true, color: DOM }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 14, bold: true, color: DOM }),
        r(' / ', { bold: true, color: DOM }), new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 14, bold: true, color: DOM }),
        new TextRun({ children: [new Tab()] }), r(sp[2] ? txt(sp[2]) : '')] }),
    P(txt(pied && pied.querySelector('.fr-legal-agrements')), { size: 11, bold: true, color: GRIS, align: AlignmentType.CENTER, after: 10 }),
    P(txt(pied && pied.querySelector('.fr-legal-article')), { size: 10, color: PALE, align: AlignmentType.CENTER, after: 0 }),
  ] });
  const document = new Document({
    creator: 'SAMSIC Sécurité', title: doc.title, description: 'Version modifiable générée depuis ' + path.basename(fichier),
    styles: { default: { document: { run: { font: FONT, size: 18, color: TEXTE } } } },
    numbering: { config: [
      { reference: 'puces', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 300, hanging: 200 } }, run: { color: ACC } } }] },
      { reference: 'nums', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } } } }] },
    ] },
    sections: groupes.map(({ page, corps }) => {
      const titrePage = !page.querySelector('.fr-entete');
      return {
        properties: { titlePage: titrePage, page: { size: { width: Math.round(210 * MM), height: Math.round(297 * MM) },
          margin: { top: Math.round(11 * MM), bottom: Math.round(17 * MM), left: Math.round(12 * MM), right: Math.round(12 * MM),
            header: Math.round(4 * MM), footer: Math.round(3 * MM) } } },
        headers: titrePage ? { default: enTete(), first: sansEnTete(page) } : { default: enTete() },
        footers: titrePage ? { default: piedPage(), first: piedPage() } : { default: piedPage() },
        children: corps,
      };
    }),
  });
  fs.mkdirSync(path.dirname(sortie), { recursive: true });
  fs.writeFileSync(sortie, await Packer.toBuffer(document));
  dom.window.close();
  return pages.length;
}
module.exports = convertir;
if (require.main === module) {
  convertir(path.resolve(process.argv[2]), path.resolve(process.argv[3]), process.argv[4])
    .then((n) => console.log(n + ' pages → ' + process.argv[3])).catch((e) => { console.error(e.stack); process.exit(1); });
}
