/* ============================================================================
   mase-sites.js — Données des sites pour personnaliser le classeur SSE

   EXEMPLE FICTIF. Remplacer par les vrais sites de l'agence (extrait SAM Agence
   ou saisie à la main). Ne JAMAIS publier ce fichier rempli de vraies données
   (noms d'agents, dates de carte pro) dans un dépôt partagé.

   Une page s'ouvre pour un site avec ?site=<id> :
     mase-00-ouverture.html?site=exemple-site
   Sans ?site=, la page reste la trame vierge, à remplir au stylo.

   Champs d'un site :
     id ............ identifiant court, sans espace (sert dans l'URL)
     classeur ...... clé de MASE_CLASSEURS (agence, provenance, astreinte)
     nom, adresse, code (code contrat), note
     ancien ........ ancien nom du site, s'il y en a un
     rondes ........ true si le poste fait des rondes
     permisFeu ..... true si l'agent délivre ou contrôle des permis de feu
     causeriesAvec . « » ou nom du client si les causeries sont communes
     pdp ........... plan de prévention : debut, fin (AAAA-MM-JJ), client/samsic/guardtek (signé ?)
     agents ........ [{ nom, prenom, emploi, carte, visite, eval }] (dates AAAA-MM-JJ)
     causeries ..... [{ mois: 'AAAA-MM', statut: 'realisee' | 'prevue', date, presents }]
     sd ............ remontées (situations dangereuses) :
                     [{ date, type: 'situation_dangereuse' | 'presque_accident' | …, env, faits, action, close }]
     at ............ accidents du travail : { annee, s1, s2, trajet }
   ========================================================================== */
window.MASE_EXTRAIT = '2026-01-01';

window.MASE_CLASSEURS = {
  agence: {
    agence: '000',
    profil: 'industrie',                    // 'industrie' ou 'tertiaire'
    provenance: 'SAMSIC SÉCURITÉ — Agence de Lyon',
    entite: 'SAMSIC Sécurité · agence de Lyon',
    astreinte: '01 49 98 39 88',
    astreinteLib: 'Astreinte opérationnelle SAMSIC · 24 h / 24',
  },
};

window.MASE_SITES = [
  {
    id: 'exemple-site',
    classeur: 'agence',
    nom: 'SITE EXEMPLE',
    ancien: '',
    rondes: true,
    permisFeu: false,
    adresse: '1, rue de l’Exemple, 69000 Lyon',
    code: 'SEC000000CONT',
    note: '',
    causeriesAvec: '',
    pdp: { debut: '2026-01-01', fin: '2026-12-31', client: true, samsic: true, guardtek: false },
    agents: [
      { nom: 'AGENT', prenom: 'Un', emploi: 'Agent de Sécurité Chef Poste', carte: '2029-01-01', visite: '', eval: '' },
      { nom: 'AGENT', prenom: 'Deux', emploi: 'Agent de Sécurité Confirmé', carte: '2028-06-30', visite: '', eval: '' },
    ],
    causeries: [
      { mois: '2026-01', statut: 'realisee', date: '2026-01-12', presents: 2 },
    ],
    sd: [],
    at: { annee: 2026, s1: 0, s2: 0, trajet: 0 },
  },
];
