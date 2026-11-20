/* ============================================================================
   mase-site.js — Personnalise une page du classeur MASE pour un site

   URL : mase-00-ouverture.html?site=total-feyzin (l'id vient de mase-sites.js,
   généré par imports/build-mase-sites.js). Sans ?site=, la page reste la
   trame vierge, valable pour n'importe quel site.

   Chargé APRÈS mase-sites.js et mase-duerp.js, et AVANT procedure.js : il
   crée des pages (matrice longue, une page par unité du DUERP) que
   procedure.js doit ensuite compter et habiller.

     [data-site="nom|adresse|code|effectif|pdp"]  reçoit la valeur du site
     [data-ind="…"]            indicateurs du semestre (onglet 1)
     .doc-page[data-matrice]   matrice des habilitations, une page par 15 agents
     tr[data-mois]             suivi des causeries de l'année (onglet 5)
     .doc-page[data-registre]  registre des remontées, une page par 14 lignes
     .doc-page[data-duerp]     extrait du DUERP, une page par unité de travail
   ========================================================================== */
(function () {
  'use strict';

  const id = new URLSearchParams(location.search).get('site');
  const site = id ? (window.MASE_SITES || []).find((s) => s.id === id) : null;
  if (id && !site) document.body.insertAdjacentHTML('afterbegin',
    '<p style="color:#8C2F26;font:700 14px sans-serif;padding:8mm">Site inconnu : ' + id + '</p>');

  const dateFr = (iso) => (iso ? iso.slice(0, 10).split('-').reverse().join('/') : '');
  const dateCourte = (iso) => (iso ? dateFr(iso).slice(0, 6) + iso.slice(2, 4) : '');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const extrait = 'Extrait de sam-agence au ' + dateFr(window.MASE_EXTRAIT || new Date().toISOString());
  const aujourdhui = new Date();
  const dans3mois = new Date(aujourdhui); dans3mois.setMonth(dans3mois.getMonth() + 3);
  // Une échéance passée est en aplat, une échéance à moins de 3 mois entourée.
  function echeance(td, iso) {
    if (!iso) return;
    td.textContent = dateCourte(iso);
    const d = new Date(iso);
    if (d < aujourdhui) td.className = 'echu';
    else if (d < dans3mois) td.className = 'bientot';
  }

  // Une page modèle répétée autant que nécessaire, chaque copie partant de
  // la trame vierge (et non d'une page déjà remplie).
  function repeter(modele, paquets, remplir) {
    const vierge = modele.cloneNode(true);
    let apres = modele;
    paquets.forEach((paquet, n) => {
      const page = n === 0 ? modele : vierge.cloneNode(true);
      if (n > 0) apres.after(page);
      apres = page;
      remplir(page, paquet, n);
    });
  }
  const enPaquets = (liste, taille) => {
    const p = [];
    for (let i = 0; i < Math.max(liste.length, 1); i += taille) p.push(liste.slice(i, i + taille));
    return p;
  };

  /* ------------------------------------------------------------ Champs */
  if (site) {
    document.body.dataset.site = site.nom;
    const pdp = site.pdp;
    const signe = pdp ? ['client', 'samsic', 'guardtek'].filter((k) => pdp[k]) : [];
    const val = {
      nom: site.nom + (site.ancien ? ' (' + site.ancien + ')' : ''),
      adresse: site.adresse, code: site.code,
      effectif: site.rondes ? 'Rondes, pas d’agent à demeure' : (site.agents.length ? site.agents.length + ' agents' : ''),
      pdp: pdp ? 'Du ' + dateFr(pdp.debut) + ' au ' + dateFr(pdp.fin)
        + (signe.length ? ' · signé ' + signe.map((k) => ({ client: 'client', samsic: 'SAMSIC', guardtek: 'Guardtek' }[k])).join(', ') : ' · non signé') : '',
    };
    document.querySelectorAll('[data-site]').forEach((el) => {
      if (val[el.dataset.site]) el.textContent = val[el.dataset.site];
      if (el.dataset.site === 'pdp' && pdp && new Date(pdp.fin) < dans3mois) el.classList.add('alerte');
    });
  }

  /* ----------------------------------------------- Indicateurs (onglet 1) */
  if (site && document.querySelector('[data-ind]')) {
    const an = site.at.annee;
    const sem = (mois) => (+String(mois).slice(5, 7) <= 6 ? 1 : 2);
    const moisEcoules = (s) => (s === 1 ? 6 : Math.max(0, Math.min(6, aujourdhui.getMonth() + 1 - 6)));
    const c = (s) => site.causeries.filter((x) => x.statut === 'realisee' && +x.mois.slice(0, 4) === an && sem(x.mois) === s).length;
    const sd = (s) => site.sd.filter((x) => +x.date.slice(0, 4) === an && sem(x.date) === s).length;
    const valides = site.agents.filter((a) => a.carte && new Date(a.carte) >= aujourdhui).length;
    const ind = {
      'causeries-s1': c(1) + ' / 6 mois', 'causeries-s2': c(2) + ' / ' + moisEcoules(2) + ' mois',
      'sd-s1': sd(1) + ' · objectif 12', 'sd-s2': sd(2) + ' · objectif ' + 2 * moisEcoules(2),
      'at-s1': String(site.at.s1), 'at-s2': String(site.at.s2),
      cartes: site.agents.length ? 'Cartes pro : ' + valides + ' / ' + site.agents.length : '',
    };
    document.querySelectorAll('[data-ind]').forEach((td) => {
      const v = ind[td.dataset.ind];
      if (v) { td.textContent = v; td.classList.add('rempli'); }
    });
    const note = document.querySelector('[data-ind-note]');
    if (note) note.textContent = extrait + ', année ' + an + (aujourdhui.getMonth() < 11 ? ' (2e semestre en cours)' : '')
      + (site.at.trajet ? ' · ' + site.at.trajet + ' accident(s) de trajet en plus.' : '.');
  }

  /* ---------------------------------------------- Causeries (onglet 5) */
  if (site && document.querySelector('tr[data-mois]')) {
    document.querySelectorAll('tr[data-mois]').forEach((tr) => {
      const x = site.causeries.find((k) => k.mois === tr.dataset.mois);
      if (!x) return;
      const c = tr.children;
      c[2].textContent = x.date ? dateFr(x.date) : (x.statut === 'realisee' ? 'Réalisée' : x.statut);
      c[4].textContent = x.presents != null ? String(x.presents) : '';
      tr.classList.add('rempli');
    });
    const note = document.querySelector('[data-causeries-note]');
    if (note) note.textContent = extrait + ' · effectif du site : '
      + (site.rondes ? 'rondes, pas d’agent à demeure' : site.agents.length + ' agents') + '.';
  }

  /* ------------------------------------------- Remontées (onglet 6) */
  const modeleRegistre = document.querySelector('.doc-page[data-registre]');
  if (modeleRegistre && site) {
    const TYPE = { situation_dangereuse: 'SD', incident_presquaccident: 'PA' };
    // Hauteur estimée d'une ligne (mm) : le texte passe à la ligne dans les
    // colonnes « En quelques mots » (≈ 48 car.) et « Action » (≈ 22 car.).
    const BUDGET = 185, VIDE = 7.6;
    const lignes = (t, n) => Math.max(1, Math.ceil(String(t).length / n));
    const haut = (x) => Math.max(VIDE, 2.6 + 3.8 * Math.max(lignes(x.faits, 48), lignes(x.action, 22)));
    const paquets = [[]]; let h = 0;
    site.sd.forEach((x) => {
      if (h + haut(x) > BUDGET) { paquets.push([]); h = 0; }
      paquets[paquets.length - 1].push(x); h += haut(x);
    });
    let rang = 0;
    repeter(modeleRegistre, paquets, (page, paquet) => {
      const trs = [...page.querySelectorAll('table tr:not(:first-child)')];
      // Ce qui reste de la page après les lignes remplies : en lignes vides.
      const libres = Math.max(0, Math.floor((BUDGET - paquet.reduce((n, x) => n + haut(x), 0)) / VIDE));
      trs.slice(paquet.length + libres).forEach((tr) => tr.remove());
      trs.forEach((tr, k) => {
        const x = paquet[k];
        if (!x) return;
        const c = tr.children;
        tr.classList.add('rempli');
        c[0].textContent = ++rang;
        c[1].textContent = dateCourte(x.date);
        c[2].textContent = (TYPE[x.type] || x.type) + (x.env ? ' · E' : '');
        c[3].textContent = x.faits;
        c[5].textContent = x.action;
        c[6].textContent = x.close ? ('Close ' + (x.close === 'oui' ? '' : dateCourte(x.close))).trim() : '';
      });
      const note = page.querySelector('[data-registre-note]');
      if (note) note.innerHTML = '<b>' + extrait + ' : ' + site.sd.length + ' remontée' + (site.sd.length > 1 ? 's' : '')
        + ' sur les 12 derniers mois</b>.';
    });
  }

  /* ---------------------------------------------------------- Matrice */
  // Sigles des emplois sam-agence : la colonne « Poste » est étroite.
  const SIGLES = [
    [/chef de site/i, 'CDS'], [/adjoint chef de site/i, 'ACS'], [/responsable de site adjoint/i, 'RSA'],
    [/responsable op/i, 'RO'], [/chef d.equipe prévention/i, 'CEPI'], [/chef d.equipe/i, 'CE'],
    [/agent de sécurité chef poste/i, 'ASCP'], [/adjoint chef de poste/i, 'ACP'], [/chef de poste/i, 'CDP'],
    [/equipier intervention incendie/i, 'EII'], [/service sécurité incendie/i, 'SSI'], [/sécurité incendie/i, 'ASI'],
    [/cynophile/i, 'CYN'], [/confirmé/i, 'ASC'], [/qualifié/i, 'ASQ'], [/coordinateur/i, 'COO'],
    [/plan+ificateur/i, 'PLA'], [/agent de sécurité/i, 'AS'],
  ];
  const sigle = (emploi) => (SIGLES.find(([re]) => re.test(emploi)) || [, ''])[1];
  const PAR_PAGE = 15;

  // Colonnes de la matrice remplies depuis sam-agence (les autres : au stylo).
  const COL = { carte: 2, aptitude: 8, evaluation: 11 };
  const modeleMatrice = document.querySelector('.doc-page[data-matrice]');
  if (modeleMatrice && site) {
    const paquets = enPaquets(site.agents, PAR_PAGE);
    repeter(modeleMatrice, paquets, (page, paquet, n) => {
      const sigles = new Set();
      page.querySelectorAll('table.ms-matrice tr:not(:first-child)').forEach((tr, k) => {
        const a = paquet[k];
        if (!a) return;
        const c = tr.children;
        const prenom = a.prenom.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (m, sep, l) => sep + l.toUpperCase());
        c[0].innerHTML = '<b>' + esc(a.nom) + '</b> ' + esc(prenom);
        const s = sigle(a.emploi); c[1].textContent = s; if (s) sigles.add(s + ' ' + a.emploi);
        echeance(c[COL.carte], a.carte);
        echeance(c[COL.aptitude], a.visite);
        c[COL.evaluation].textContent = dateCourte(a.eval);
      });
      const note = page.querySelector('[data-matrice-note]');
      if (note) {
        note.innerHTML = (site.note ? '<b>' + esc(site.note) + '</b> ' : '')
          + extrait + ' : carte pro, prochaine visite médicale, dernière évaluation SSE'
          + (paquets.length > 1 ? ' · liste ' + (n + 1) + ' / ' + paquets.length : '')
          + (sigles.size ? '. Postes : ' + [...sigles].sort().map(esc).join(' · ') : '') + '.';
      }
    });
  }

  /* ------------------------------------------------------------ DUERP */
  // Unités de travail du DUERP qui concernent le site, d'après les emplois
  // de ses agents. Framatome Romans est un site nucléaire : unité SEC07.
  function unitesDuSite(s) {
    if (!s) return ['SEC09', 'COMMUNES'];
    if (s.rondes) return ['SEC03', 'COMMUNES'];   // site de rondes : agents mobiles
    const emplois = s.agents.map((a) => a.emploi).join('|');
    const u = [/FRAMATOME - ROMANS/.test(s.nom) ? 'SEC07' : 'SEC09'];
    if (/incendie/i.test(emplois)) u.push('SEC05');
    if (/cynophile/i.test(emplois)) u.push('SEC02');
    u.push('COMMUNES');
    return u;
  }
  const PRIO = { 1: ['non', 'Critique'], 2: ['cours', 'À surveiller'], 3: ['ok', 'Sous contrôle'] };

  // Une ligne par famille et par priorité : la cotation détaillée reste dans le
  // DUERP complet, l'agent n'a besoin que des risques prioritaires, en tête.
  function lignesUnite(unite) {
    const out = [];
    const prioMin = (f) => Math.min(...f.situations.map((s) => s.p));
    [...unite.familles].sort((a, b) => prioMin(a) - prioMin(b)).forEach((f) => {
      const groupes = [];
      f.situations.forEach((s) => {
        let g = groupes.find((x) => x.cle === s.p);
        if (!g) groupes.push(g = { cle: s.p, s: [], ref: s });
        // Le DUERP répète parfois l'intitulé de la famille en capitales.
        g.s.push(s.s === s.s.toUpperCase() ? 'Ensemble des situations' : s.s);
      });
      groupes.sort((a, b) => a.cle - b.cle);
      groupes.forEach((g, i) => out.push({ fam: i === 0 ? f.code + ' · ' + f.libelle : '', n: groupes.length, i, ...g }));
    });
    return out;
  }
  // Découpe en pages sans mesurer : au moment où ce script tourne, l'en-tête
  // n'est pas encore construit par procedure.js. Hauteur estimée d'une ligne
  // en px d'écran, d'après le nombre de lignes de texte de ses deux colonnes.
  const BUDGET_PAGE = 760;
  const hauteur = (l) => 12 + 12.5 * Math.max(Math.ceil(l.s.join(' · ').length / 80), Math.ceil((l.fam.length || 1) / 30));
  function enPages(lignes) {
    const pages = [[]]; let h = 0;
    lignes.forEach((l) => {
      const dh = hauteur(l);
      // Une famille ne commence pas en bas de page : on garde ses lignes ensemble.
      if (h + dh > BUDGET_PAGE && pages[pages.length - 1].length) {
        if (l.i > 0) { const p = pages[pages.length - 1]; const k = p.length - l.i; pages.push(p.splice(k)); h = pages[pages.length - 1].reduce((n, x) => n + hauteur(x), 0); }
        else { pages.push([]); h = 0; }
      }
      pages[pages.length - 1].push(l); h += dh;
    });
    return pages;
  }
  function tableau(lignes) {
    return '<table class="rx-table ms-duerp"><tr><th style="width:24%">Risque</th><th>Situations à risque</th>'
      + '<th style="width:14%">Priorité</th></tr>'
      + lignes.map((l) => {
        const p = PRIO[l.ref.p] || ['ok', 'P' + l.ref.p];
        return '<tr' + (l.i > 0 ? ' class="suite"' : '') + '><td>' + esc(l.fam) + '</td><td>' + l.s.map(esc).join(' · ')
          + '</td><td><span class="rx-niv ' + p[0] + '">' + p[1] + '</span></td></tr>';
      }).join('') + '</table>';
  }

  const modeleDuerp = document.querySelector('.doc-page[data-duerp]');
  const D = window.MASE_DUERP;
  if (modeleDuerp && D) {
    const vierge = modeleDuerp.cloneNode(true);
    let apres = modeleDuerp;
    unitesDuSite(site).forEach((code, n) => {
      let unite, titre;
      if (code === 'COMMUNES') {
        // Les unités « COM » s'appliquent à tous les salariés, quel que soit le poste.
        unite = { familles: [] };
        ['COM01', 'COM06', 'COM08', 'COM09'].forEach((c) => D.unites[c].familles.forEach((f) => {
          const g = unite.familles.find((x) => x.code === f.code);
          if (g) f.situations.forEach((s) => { if (!g.situations.some((x) => x.s === s.s)) g.situations.push(s); });
          else unite.familles.push({ ...f, situations: [...f.situations] });
        }));
        unite.familles.sort((a, b) => a.code.localeCompare(b.code));
        titre = 'Unités communes : trajets, prise de service, RPS, chaleur';
      } else {
        unite = D.unites[code];
        titre = code + ' · ' + unite.libelle;
      }
      enPages(lignesUnite(unite)).forEach((paquet, k) => {
        const page = n === 0 && k === 0 ? modeleDuerp : vierge.cloneNode(true);
        if (page !== modeleDuerp) apres.after(page);
        apres = page;
        page.querySelector('[data-entete]').dataset.soustitre = '2 · Risques prioritaires · ' + titre + (k > 0 ? ' (suite)' : '');
        page.querySelector('[data-duerp-table]').innerHTML = tableau(paquet);
      });
    });
  }
})();
