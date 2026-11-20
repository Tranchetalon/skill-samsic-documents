/* ============================================================================
   procedure.js — Habillage commun des fiches procédure agents

   Chaque fiche (fiche-*.html) n'écrit que son CONTENU. Ce script pose autour
   ce qui doit être identique partout, repris de la fiche réflexe
   (js/doc-fiche-reflexe.js) :
     - la palette de la famille (mêmes couleurs que data/fiches-reflexes.js) ;
     - l'en-tête : titre, sous-titre or, cartouche SAMSIC ;
     - le bandeau de clôture et le pied légal (agréments CNAPS, L612-14) ;
     - les icônes : <i data-ic="nom"></i> devient le SVG de js/icones.js.

   Pour produire les PDF : node fiches-procedures/build-pdf.js
   ========================================================================== */
(function (App) {
  'use strict';

  const FAMILLES = {
    // Fiches réflexes (affiche d'une page) : une couleur par famille, accent or.
    equipement: {
      libelle: 'Tenue & matériel', dominante: '#7A3B2E', accent: '#D9A441',
      etapes: ['#7A3B2E', '#8F5A22', '#96543F', '#7D5730', '#A4453A', '#6E4A32'],
    },
    sante: {
      libelle: 'Santé & arrêts', dominante: '#1F5F45', accent: '#D4A544',
      etapes: ['#1F5F45', '#3E7B54', '#46705B', '#2E7D6B', '#5E7A3E', '#356B4F'],
    },
    rh: {
      libelle: 'Démarches RH', dominante: '#3D6491', accent: '#D9943F',
      etapes: ['#3D6491', '#9C6222', '#5A7396', '#4E7D5E', '#8F5057', '#5B6E8C'],
    },
    incident: {
      libelle: 'Incidents & urgences', dominante: '#8C2F26', accent: '#E0A33C',
      etapes: ['#8C2F26', '#A34A26', '#A4453A', '#8A4034', '#C0392B', '#6E2A22'],
    },
    exploitation: {
      libelle: 'Vie du poste', dominante: '#22344A', accent: '#C9A227',
      etapes: ['#22344A', '#8A6410', '#4A5C74', '#3E7B54', '#A4453A', '#0B5FA5'],
    },
    // Consignes de prévention (CP, RCR…) : deux couleurs seulement, le marine
    // et le bleu ciel du logo SAMSIC, à la place de l'or.
    consigne: {
      libelle: 'Consignes RH', dominante: '#22344A', accent: '#0083BE',
      etapes: ['#22344A', '#0083BE', '#22344A', '#0083BE', '#22344A', '#0083BE'],
    },
    // Retours d'expérience d'exercice : même palette que les consignes.
    rex: {
      libelle: 'Retour d’expérience · Sûreté', dominante: '#22344A', accent: '#0083BE',
      etapes: ['#22344A', '#0083BE', '#22344A', '#0083BE', '#22344A', '#0083BE'],
    },
    // Classeur MASE de site (mase-*.html) : toujours les deux mêmes couleurs.
    mase: {
      libelle: 'Classeur SSE du site', dominante: '#22344A', accent: '#0083BE',
      etapes: ['#22344A', '#0083BE', '#22344A', '#0083BE', '#22344A', '#0083BE'],
    },
  };

  // Identité de l'agence : socle/js/agence.js (copie de agence.js du skill).
  const AGENCE = window.SAMSIC_AGENCE || {};
  const AGREMENTS = AGENCE.agrements ||
    ['AUT-069-2118-12-18-20190643157', 'AUT-069-2117-10-12-20180355841'];
  const L612_14 = 'Article L612-14 du Code de la Sécurité intérieure : l’autorisation ' +
    'd’exercice ne confère aucune prérogative de puissance publique à ' +
    'l’entreprise ou aux personnes qui en bénéficient.';

  // Icônes absentes du jeu commun, dessinées sur la même grille 24 × 24.
  const EXTRA = {
    telephone: '<path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.9.7 2.8a2 2 0 01-.5 2.1L8 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    voix: '<path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 010 7"/><path d="M18.5 5.5a9 9 0 010 13"/>',
    telephone_mobile: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
    lune: '<path d="M20.5 14.5A8.5 8.5 0 019.5 3.5a8.5 8.5 0 1011 11z"/>',
    // Classeur MASE : les risques du poste et les outils SSE.
    voiture: '<path d="M5 17H3.5a.5.5 0 01-.5-.5V13l2-5.2A1.5 1.5 0 016.4 7h11.2a1.5 1.5 0 011.4.8L21 13v3.5a.5.5 0 01-.5.5H19"/><path d="M3 13h18"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/><path d="M9.5 17h5"/>',
    thermometre: '<path d="M14 14.8V4.5a2 2 0 00-4 0v10.3a4 4 0 104 0z"/><path d="M12 9v8"/>',
    goutte: '<path d="M12 3l5.7 6.2a7.5 7.5 0 11-11.4 0z"/>',
    ecran: '<rect x="2.5" y="3.5" width="19" height="13" rx="2"/><path d="M8 21h8M12 16.5V21"/>',
    coeur: '<path d="M20.4 5.1a5.2 5.2 0 00-7.4 0L12 6.1l-1-1a5.2 5.2 0 00-7.4 7.4l1 1L12 20.9l7.4-7.4 1-1a5.2 5.2 0 000-7.4z"/>',
    bulle: '<path d="M20.5 11.5a8 8 0 01-11.6 7.2L3.5 20.5l1.8-5.2A8 8 0 1120.5 11.5z"/>',
    stop: '<path d="M8 2.5h8l5.5 5.5v8L16 21.5H8L2.5 16V8z"/><path d="M12 7.5v5.5M12 16.5v.01"/>',
    escalier: '<path d="M3 20.5h5v-5h5v-5h5v-5h3"/>',
    casque: '<path d="M2.5 18.5h19M4.5 18.5V16a7.5 7.5 0 0115 0v2.5"/><path d="M10 8.7V5.5h4v3.2"/>',
    livre: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5z"/><path d="M4 19.5A2.5 2.5 0 006.5 22H20v-5"/>',
  };
  function ic(nom) {
    if (EXTRA[nom]) {
      return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        EXTRA[nom] + '</svg>';
    }
    return App.icones.get(nom, 'ic');
  }

  function assombrir(hex, part) {
    const n = parseInt(hex.slice(1), 16);
    const k = 1 - part;
    return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255]
      .map((v) => Math.round(v * k).toString(16).padStart(2, '0')).join('');
  }

  const b = document.body;
  // Une page peut garder la palette d'une famille mais nommer son propre
  // document dans le pied (data-libelle) et sa propre agence (data-provenance).
  const fam = Object.assign({}, FAMILLES[b.dataset.famille] || FAMILLES.exploitation,
    b.dataset.libelle ? { libelle: b.dataset.libelle } : {},
    b.dataset.provenance ? { provenance: b.dataset.provenance } : {});
  const titre = b.dataset.titre;
  const maj = b.dataset.maj;
  const pages = document.querySelectorAll('.fr-page');

  pages.forEach((page, i) => {
    const st = page.style;
    st.setProperty('--dom', fam.dominante);
    st.setProperty('--dom-fonce', assombrir(fam.dominante, 0.28));
    st.setProperty('--acc', fam.accent);
    st.setProperty('--fam', fam.dominante);
    fam.etapes.forEach((c, k) => st.setProperty('--et-' + (k + 1), c));

    const ent = page.querySelector('[data-entete]');
    if (ent) {
      const suite = i > 0;
      ent.className = 'fr-entete';
      ent.innerHTML = `
        <div class="fr-entete-txt">
          <h1 class="fr-titre">${titre}${suite ? ' <span class="lv-suite">(suite)</span>' : ''}</h1>
          <div class="fr-soustitre">${ent.dataset.soustitre || ''}</div>
          <div class="fr-filet"></div>
          ${ent.dataset.resume ? `<p class="fr-resume">${ent.dataset.resume}</p>` : ''}
        </div>
        <div class="fr-cartouche-wrap">
          <div class="fr-cartouche">
            <img class="fr-cartouche-logo" src="${window.SAMSIC_LOGO_B64}" alt="SAMSIC Sécurité">
            <div class="fr-cartouche-baseline">Sécurité · Rigueur · Professionnalisme</div>
          </div>
        </div>`;
    }

    const band = page.querySelector('[data-bandeau]');
    if (band) {
      band.className = 'fr-bandeau';
      band.innerHTML = `
        <div class="fr-bandeau-medaillon">${ic('bouclier')}</div>
        <div class="fr-bandeau-txt">
          <div class="fr-bandeau-l1">${band.dataset.l1 || 'La sécurité, c’est l’affaire de tous.'}</div>
          <div class="fr-bandeau-l2">${band.dataset.l2 || 'Ensemble, restons vigilants !'}</div>
        </div>
        <div class="fr-bandeau-ic">${ic('personnes')}</div>`;
    }

    const pied = page.querySelector('[data-pied]');
    if (pied) {
      pied.className = 'fr-pied';
      pied.innerHTML = `
        <div class="fr-pied-filet">${ic('bouclier')}</div>
        <div class="fr-pied-provenance">
          <span>${fam.provenance || AGENCE.provenance || 'SAMSIC SÉCURITÉ — Agence de Lyon'}</span>
          <span>${fam.libelle}${b.dataset.site ? ' · ' + b.dataset.site : ''}${pages.length > 1 ? ` · <span class="pr-num">Page ${i + 1} / ${pages.length}</span>` : ''}</span>
          <span>Mise à jour ${maj}</span>
        </div>
        <div class="fr-legal">
          <div class="fr-legal-agrements">Agrément CNAPS : ${
            AGREMENTS.map((n) => `<b>${n}</b>`).join(' &nbsp;·&nbsp; ')}</div>
          <div class="fr-legal-article">${L612_14}</div>
        </div>`;
    }
  });

  // Logo hors cartouche (couverture et intercalaires du classeur MASE).
  document.querySelectorAll('img[data-logo]').forEach((img) => {
    img.src = window.SAMSIC_LOGO_B64;
  });

  document.querySelectorAll('i[data-ic]').forEach((el) => {
    el.outerHTML = ic(el.dataset.ic);
  });

  // Contrôle de débordement. Une feuille a une hauteur FIXE et coupe ce qui
  // dépasse : sans ce contrôle, du texte disparaîtrait du PDF sans que
  // personne ne le voie. Une feuille trop pleine reçoit un bandeau rouge
  // (visible dans le PDF) et l'attribut data-deborde, que scripts/pdf.js lit.
  function controler() {
    let n = 0;
    document.querySelectorAll('.fr-frame, .slide').forEach((el) => {
      const trop = el.scrollHeight - el.clientHeight;
      if (trop <= 2) return;
      n++;
      const page = el.closest('.doc-page') || el;
      const mm = Math.round(trop * 25.4 / 96);
      page.setAttribute('data-deborde', mm);
      if (getComputedStyle(page).position === 'static') page.style.position = 'relative';
      page.insertAdjacentHTML('beforeend', '<div class="samsic-deborde" style="position:absolute;' +
        'left:0;right:0;top:0;z-index:99;background:#C0392B;color:#fff;font:700 13px sans-serif;' +
        'padding:6px 10px;text-align:center">CONTENU TROP LONG : environ ' + mm +
        ' mm coupés en bas de cette page. Raccourcir ou répartir sur une page de plus.</div>');
    });
    document.body.setAttribute('data-pages-debordantes', n);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(controler, 50));
  else window.addEventListener('load', controler);
})(window.App = window.App || {});
