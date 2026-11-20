/* ============================================================================
   icones.js — Jeu d'icônes vectorielles (App.icones)

   Pourquoi pas d'emoji : leur dessin dépend de la police du système, ils
   sortent souvent en aplat noir à l'impression PDF et on ne peut pas les
   teinter. Ces icônes-ci sont du SVG en trait, donc :
     - nettes à toute taille, y compris à l'impression ;
     - à la couleur du texte (`currentColor`), donc pilotées par le CSS ;
     - identiques sur tous les postes, sans police à installer.

   Dessinées sur une grille de 24 × 24, trait de 1,8 — épaisseur choisie pour
   rester lisible une fois réduite à 20 px sur la feuille.

   Usage : App.icones.get('bouclier')  ->  '<svg …>…</svg>'
   Dans un contenu, on écrit le NOM de l'icône dans la colonne prévue par le
   schéma ([poles], [metiers]…) : la fabrique appelle get() pour elle.
   ========================================================================== */
(function (App) {
  'use strict';

  const I = {};

  // Chaque entrée ne contient que l'intérieur du <svg> : l'enveloppe commune
  // est ajoutée par get(), pour ne pas répéter viewBox et attributs de trait.
  const D = {
    /* --- Métiers et pôles ------------------------------------------------ */
    bouclier:   '<path d="M12 3l7 3v5.5c0 4.3-2.9 8.2-7 9.5-4.1-1.3-7-5.2-7-9.5V6l7-3z"/>' +
                '<path d="M9.2 12.2l1.9 1.9 3.8-3.8"/>',
    batiment:   '<path d="M3 21h18"/><path d="M5 21V6l7-3 7 3v15"/>' +
                '<path d="M9.5 9.5h1M13.5 9.5h1M9.5 13h1M13.5 13h1"/>' +
                '<path d="M10 21v-4h4v4"/>',
    personnes:  '<circle cx="9" cy="8" r="3"/>' +
                '<path d="M3.5 20a5.5 5.5 0 0111 0"/>' +
                '<path d="M16 5.6a3 3 0 010 4.8"/><path d="M17.5 20a5.6 5.6 0 00-2.2-4.4"/>',
    avion:      '<path d="M10.5 20.5l1.5-4.5 4 1.5 1-2-3.5-2.5 3.5-5a1.6 1.6 0 00-2.4-2L12 9.5 7 6.5l-1.5 1.5 3.5 3-2 3.5-3-1-1 1.5 4 2.5z"/>',
    balai:      '<path d="M14.5 3.5l6 6"/><path d="M13 5l-7.5 7.5 5 5L18 10"/>' +
                '<path d="M5.5 12.5L3 20l7.5-2.5"/>',
    accueil:    '<circle cx="12" cy="7.5" r="3"/>' +
                '<path d="M5.5 20a6.5 6.5 0 0113 0z"/><path d="M12 14v6"/>',
    outils:     '<path d="M14.5 6.5a3.5 3.5 0 004.6 4.6l-8 8a2.3 2.3 0 01-3.3-3.3l8-8"/>' +
                '<path d="M6 6l3 3"/><path d="M4.5 9.5L8 6 5.5 3.5 3 6z"/>',
    feuille:    '<path d="M20 4c0 9-5 13-11 13-2 0-3.5-.6-3.5-.6"/>' +
                '<path d="M5 20c0-6 4-11 12-13"/>',
    recyclage:  '<path d="M7 8L4.5 12l2 3.5"/><path d="M12 4.5L14.5 9h-5z"/>' +
                '<path d="M17 8l2.5 4-2 3.5"/><path d="M6.5 15.5h11"/>',
    boite:      '<path d="M3.5 7.5L12 3.5l8.5 4v9L12 20.5l-8.5-4z"/>' +
                '<path d="M3.5 7.5L12 11.5l8.5-4"/><path d="M12 11.5v9"/>',
    bureau:     '<rect x="3" y="4.5" width="18" height="12" rx="1.6"/>' +
                '<path d="M8 20.5h8"/><path d="M12 16.5v4"/>',
    eclair:     '<path d="M13 3L5.5 13.5H11l-1 7.5L18.5 10H13z"/>',
    pilotage:   '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2"/>' +
                '<path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3"/>',

    /* --- Métiers de la sécurité ------------------------------------------ */
    oeil:       '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/>' +
                '<circle cx="12" cy="12" r="2.8"/>',
    flamme:     '<path d="M12 3.5s5 4.2 5 8.6a5 5 0 01-10 0c0-1.7.8-3.2 1.7-4.3.3 1.2 1 2 1.9 2.2 0-2.4.5-4.8 1.4-6.5z"/>' +
                '<path d="M12 20.5a2.7 2.7 0 002.7-2.7c0-1.8-2.7-3.8-2.7-3.8s-2.7 2-2.7 3.8A2.7 2.7 0 0012 20.5z"/>',
    antenne:    '<circle cx="12" cy="12" r="2"/>' +
                '<path d="M8.5 8.5a5 5 0 000 7M15.5 8.5a5 5 0 010 7"/>' +
                '<path d="M6 6a8.5 8.5 0 000 12M18 6a8.5 8.5 0 010 12"/>',
    calendrier: '<rect x="3.5" y="5" width="17" height="15.5" rx="1.8"/>' +
                '<path d="M3.5 9.5h17"/><path d="M8 3.5v3M16 3.5v3"/>' +
                '<path d="M7.5 13h3v3h-3z"/>',
    puce:       '<rect x="7" y="7" width="10" height="10" rx="1.5"/>' +
                '<path d="M10 3.5v3.5M14 3.5v3.5M10 17v3.5M14 17v3.5"/>' +
                '<path d="M3.5 10H7M3.5 14H7M17 10h3.5M17 14h3.5"/>',
    cadenas:    '<rect x="4.5" y="10.5" width="15" height="9.5" rx="2"/>' +
                '<path d="M8 10.5V8a4 4 0 018 0v2.5"/><circle cx="12" cy="15.2" r="1.2"/>',
    diplome:    '<path d="M12 3.5L21 8l-9 4.5L3 8z"/>' +
                '<path d="M6.5 10v5c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-5"/>' +
                '<path d="M21 8v5.5"/>',
    ampoule:    '<path d="M9.2 16.5a6 6 0 115.6 0v2.2h-5.6z"/>' +
                '<path d="M10 21h4"/>',

    /* --- Tenue et dotation ------------------------------------------------ */
    polo:       '<path d="M9 3.5l3 2.5 3-2.5 4.5 2.2v4.3l-2.5.8v9.2h-10v-9.2L4.5 10V5.7z"/>' +
                '<path d="M9 3.5v2.2l3 2.4 3-2.4V3.5"/>',
    chemise:    '<path d="M9 3.5l3 2.2 3-2.2 4.5 2.3v4.4l-2.3.7v9.4h-10.4v-9.4L4.5 10.2V5.8z"/>' +
                '<path d="M9 3.5l1.6 3.4M15 3.5l-1.6 3.4"/><path d="M12 8.6v9"/>',
    pull:       '<path d="M8.5 4h7l5 3-2 4-2-1.1v10.6h-9V9.9L5.5 11l-2-4z"/>' +
                '<path d="M9.7 4a2.4 2.4 0 004.6 0"/>',
    veste:      '<path d="M9 3.8L4.5 6.3v13.9h15V6.3L15 3.8"/>' +
                '<path d="M9 3.8l3 3.6 3-3.6"/><path d="M12 7.4v12.8"/>' +
                '<path d="M7 10.5v3M17 10.5v3"/>',
    parka:      '<path d="M8.5 4.2L4 6.6v13.6h16V6.6l-4.5-2.4"/>' +
                '<path d="M8.5 4.2a3.5 3.5 0 007 0"/>' +
                '<path d="M12 7.8v12.4"/><path d="M6.5 13.5h2M15.5 13.5h2"/>',
    pantalon:   '<path d="M7 3.5h10l.8 17h-4.2L12 11l-1.6 9.5H6.2z"/>' +
                '<path d="M7 7.5h10"/>',
    rangers:    '<path d="M4 8h5l2.5 4.5H17a3 3 0 013 3V19H4z"/>' +
                '<path d="M4 15.5h16"/><path d="M6.5 8v3M8.5 19v-3.5"/>',

    /* --- Valeurs et notions ---------------------------------------------- */
    poignee:    '<path d="M7 11.5L4 8.5 7.5 5l3 2.5h3L17 5l3 3.5-3 3"/>' +
                '<path d="M13.5 7.5l-2.5 2 2 2 2-1.5"/>' +
                '<path d="M7 11.5l3.5 3.5 2 2 2-2"/>',
    cible:      '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/>' +
                '<circle cx="12" cy="12" r="1.4"/>',
    fusee:      '<path d="M12 3c3 2 4.5 5.5 4.5 9L12 16l-4.5-4c0-3.5 1.5-7 4.5-9z"/>' +
                '<circle cx="12" cy="9.5" r="1.8"/>' +
                '<path d="M9 16.5l-2 4 3.5-1.5M15 16.5l2 4-3.5-1.5"/>',
    prisme:     '<circle cx="12" cy="12" r="8.5"/>' +
                '<path d="M12 3.5v17"/><path d="M3.5 12h17"/>' +
                '<path d="M5.8 6.5a11 11 0 0012.4 0M5.8 17.5a11 11 0 0112.4 0"/>',

    /* --- Divers ----------------------------------------------------------- */
    horloge:    '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.2 2"/>',
    document:   '<path d="M6 3.5h7l5 5v12H6z"/><path d="M13 3.5v5h5"/>' +
                '<path d="M9 13h6M9 16.5h6"/>',
    coche:      '<circle cx="12" cy="12" r="8.5"/><path d="M8.2 12.3l2.6 2.6 5-5.4"/>',
    alerte:     '<path d="M12 4l8.5 15H3.5z"/><path d="M12 10v4"/><circle cx="12" cy="16.8" r=".9"/>',

    /* --- Actions de l'interface ------------------------------------------
       Ces icônes-ci ne vont pas sur la feuille imprimée : elles habillent les
       boutons de l'atelier (voir css/ui-boutons.css). Elles sont dans le même
       jeu que les autres pour n'avoir qu'une seule fabrique à appeler, et
       parce qu'elles suivent la même grille 24 × 24 au trait de 1,8. */
    telecharger: '<path d="M12 3.5v11"/><path d="M8 10.5l4 4 4-4"/>' +
                 '<path d="M4.5 16.5v2.2a1.8 1.8 0 001.8 1.8h11.4a1.8 1.8 0 001.8-1.8v-2.2"/>',
    televerser:  '<path d="M12 14.5v-11"/><path d="M8 7.5l4-4 4 4"/>' +
                 '<path d="M4.5 16.5v2.2a1.8 1.8 0 001.8 1.8h11.4a1.8 1.8 0 001.8-1.8v-2.2"/>',
    imprimer:    '<path d="M7 9V3.5h10V9"/>' +
                 '<path d="M5.5 9h13a2 2 0 012 2v5h-4"/><path d="M7.5 16h-4v-5a2 2 0 012-2"/>' +
                 '<rect x="7" y="14" width="10" height="6.5" rx="1"/>',
    disquette:   '<path d="M4.5 4.5h11L19.5 8.5v11a1 1 0 01-1 1h-14a1 1 0 01-1-1v-14a1 1 0 011-1z"/>' +
                 '<path d="M8 4.5v5h7v-5"/><rect x="7.5" y="13" width="9" height="7.5" rx="1"/>',
    recommencer: '<path d="M3.5 12a8.5 8.5 0 108.5-8.5c-2.6 0-4.9 1.2-6.5 3"/>' +
                 '<path d="M3.5 3.5v4h4"/>',
    plus:        '<path d="M12 5v14M5 12h14"/>',
    corbeille:   '<path d="M4 6.5h16"/><path d="M9.5 6.5V4.2a1 1 0 011-1h3a1 1 0 011 1v2.3"/>' +
                 '<path d="M6 6.5l.9 13a1.4 1.4 0 001.4 1.3h7.4a1.4 1.4 0 001.4-1.3l.9-13"/>' +
                 '<path d="M10.2 10.5v6.5M13.8 10.5v6.5"/>',
    crayon:      '<path d="M4 20l1-4.2L16.3 4.5a1.8 1.8 0 012.6 0l.6.6a1.8 1.8 0 010 2.6L8.2 19z"/>' +
                 '<path d="M15 5.8l3.2 3.2"/>',
    croix:       '<path d="M6 6l12 12M18 6L6 18"/>',
    loupe:       '<circle cx="11" cy="11" r="6.5"/><path d="M15.8 15.8L20.5 20.5"/>',
  };

  // Enveloppe commune. `classe` permet au CSS de dimensionner l'icône.
  I.get = function get(nom, classe) {
    const d = D[String(nom || '').trim().toLowerCase()];
    if (!d) return '';
    return '<svg class="' + (classe || 'ic') + '" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  };

  // Le nom correspond-il à une icône connue ? Permet aux fabriques de
  // distinguer « nom d'icône » d'un simple texte laissé dans la colonne.
  I.existe = function existe(nom) {
    return Object.prototype.hasOwnProperty.call(D, String(nom || '').trim().toLowerCase());
  };

  I.noms = function noms() { return Object.keys(D); };

  App.icones = I;
})(window.App = window.App || {});
