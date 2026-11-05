/* Paramètres fiscaux et sociaux de l'année, lus par le livre et par l'appli.
   Mise à jour annuelle : modifier ce bloc dans la source, augmenter la version du pack, republier. */
window.CF_PARAMS={
  version:'2026.1',year:2026,maj:'2026-11-05',
  micro:{
    vente:{label:'Vente de marchandises, hébergement',plafond:203100,urssaf:12.3,cfp:0.1,vl:1,abatt:71},
    bics:{label:'Prestations de services commerciales ou artisanales (BIC)',plafond:83600,urssaf:21.2,cfp:0.1,vl:1.7,abatt:50},
    bnc:{label:'Professions libérales (BNC, SSI)',plafond:83600,urssaf:25.6,cfp:0.2,vl:2.2,abatt:34},
    cipav:{label:'Professions libérales réglementées (CIPAV)',plafond:83600,urssaf:23.2,cfp:0.2,vl:2.2,abatt:34}
  },
  tva:{services:37500,vente:85000},
  salarie:{cotis:11.31,csg:9.53},
  foncier:{microPlafond:15000,microAbatt:30,deficit:10700,ps:17.2},
  meuble:{longuePlafond:83600,longueAbatt:50,classePlafond:83600,classeAbatt:50,nonClassePlafond:15000,nonClasseAbatt:30},
  capital:{ir:12.8,ps:18.6,pfu:31.4},
  is:{reduit:15,seuil:42500,normal:25}
};
