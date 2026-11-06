// Original vector profiles. A profile describes a specific model/generation;
// unsupported models keep an explicitly labelled body-style approximation.
const fiestaModern = {
  id: 'ford-fiesta-2013', label: 'Ford Fiesta · 2013–2017',
  body: 'M66 171 73 126 86 91 111 79 148 55Q170 41 205 41H290Q321 42 345 64L400 109 485 126Q515 132 525 153L532 180 514 194H80L64 181Z',
  glass: 'M99 109 110 88 158 64Q176 53 202 53H231V110ZM245 53H290Q309 54 330 73L371 110H247Z',
  seams: 'M237 115 243 177M383 115 400 179M117 114 108 160', handles: [184, 303], rear: 79,
  taillight: 'M86 91 102 85 98 123 78 139 80 119Z',
  headlight: 'M411 117Q424 118 451 129L481 137 476 146 444 140 424 130Z',
  grille: '<path d="M488 149 526 156 520 178 493 175Z" fill="#243029" stroke="#b7c6a6" stroke-width="1.6"/><path d="m493 155 30 5m-29 1 27 5m-26 1 24 4" stroke="#a0b095" stroke-width="1.2"/><ellipse cx="510" cy="145" rx="8" ry="3.4" fill="#344e53" stroke="#c2ceb5" stroke-width=".7"/><text x="510" y="146.5" text-anchor="middle" fill="#dbe5d0" font-size="4" font-family="Georgia,serif" font-style="italic">Ford</text>',
  details: '<path d="M119 138Q263 132 410 142M193 178H400" fill="none" stroke="#d6e1c7" stroke-opacity=".45" stroke-width="2"/><path d="M83 90 103 81 147 54" fill="none" stroke="#e1e9d4" stroke-opacity=".55" stroke-width="2"/><path d="m393 113 18 2 5 8-23-2-7-6Z" fill="#9aaa87" stroke="#c4d0b4"/>'
};

const fiestaClassic = {
  id: 'ford-fiesta-classic', label: 'Ford Fiesta · 2002–2012',
  body: 'M64 172 75 113 91 79 143 57Q159 49 187 49H305Q324 50 343 71L389 113 488 130Q514 137 523 156L530 181 513 194H77L62 182Z',
  glass: 'M94 109 108 84 151 66Q165 60 188 60H237V110ZM250 60H303Q316 60 332 80L360 111H252Z',
  seams: 'M243 116 248 178M374 117 390 178M113 115 104 163', handles: [186, 303], rear: 78,
  taillight: 'M83 90 98 84 95 127 76 142Z',
  headlight: 'M435 125 478 137 489 153 451 145Z',
  grille: '<path d="M488 159 526 166 523 178 495 175Z" fill="#344535"/><ellipse cx="505" cy="154" rx="7" ry="3" fill="#344e53" stroke="#c2ceb5" stroke-width=".7"/>',
  details: '<path d="M103 153H423" stroke="#5b6b4e" stroke-width="4"/>'
};

const fiestaNew = {
  ...fiestaModern, id: 'ford-fiesta-2018', label: 'Ford Fiesta · 2018–2023',
  body: 'M63 171 76 118 99 88 143 61Q164 45 199 45H298Q325 46 346 65L402 110 487 125Q514 131 525 151L532 181 514 194H77L61 181Z',
  glass: 'M104 110 117 88 152 68Q170 56 200 56H239V111ZM252 56H297Q316 57 332 73L375 111H254Z',
  taillight: 'M82 117 133 106 145 113 126 125 77 133Z',
  headlight: 'M429 122 476 134 489 144 474 148 445 138Z'
};

const fiestaPreFacelift = {
  ...fiestaModern, id: 'ford-fiesta-2009', label: 'Ford Fiesta · 2009–2012',
  headlight: 'M411 117 450 125 480 137 484 153 452 144 427 132Z',
  grille: '<path d="M493 163 526 169 520 184 496 180Z" fill="#27372b"/><path d="M489 144 518 149 520 154 491 150Z" fill="#41513b"/><ellipse cx="506" cy="147" rx="7" ry="3" fill="#344e53" stroke="#c2ceb5" stroke-width=".7"/>'
};

const golf = {
  id: 'volkswagen-golf', label: 'Volkswagen Golf',
  body: 'M63 172 72 110 91 67Q96 54 116 52H311Q334 53 352 74L394 112 489 129Q517 135 525 156L531 181 514 194H75L61 181Z',
  glass: 'M85 108 102 71Q106 63 121 63H239V109ZM252 63H309Q325 64 340 82L366 109H254Z',
  seams: 'M245 115 249 178M380 116 393 179M105 115 96 162', handles: [190, 305], rear: 74,
  taillight: 'M74 120 111 118 109 133 69 137Z', headlight: 'M450 132 494 139 505 151 458 146Z',
  grille: '<path d="M493 153 525 159 525 168 496 164Z" fill="#344535"/><path d="m496 156 27 5" stroke="#c6d4b6" stroke-width="2"/>',
  details: '<path d="M112 144H422" stroke="#9eae8e" stroke-width="2"/>'
};

const peugeot208 = {
  id: 'peugeot-208', label: 'Peugeot 208 · 2013–2019',
  body: 'M65 172 75 120 105 91 149 60Q170 45 200 44H292Q320 45 342 66L396 111 482 127Q510 134 521 154L528 181 511 194H78L62 181Z',
  glass: 'M103 111 118 91 159 68Q176 57 202 56H235L241 111ZM248 56H291Q310 57 328 75L370 112H252Z',
  seams: 'M244 117 250 177M382 119 396 179M123 115 111 161', handles: [191, 306], rear: 78,
  taillight: 'M79 118 111 108 126 113 108 135 72 143Z', headlight: 'M421 120 451 128 480 135 484 145 463 143 450 136 437 139Z',
  grille: '<path d="M488 154 521 159 516 179 490 175Z" fill="#2a382c" stroke="#c3d0b3" stroke-width="1.5"/>',
  details: '<path d="M130 143Q270 130 411 146" fill="none" stroke="#d5dfc4" stroke-opacity=".4" stroke-width="2"/>'
};

const onix = {
  id: 'chevrolet-onix', label: 'Chevrolet Onix · 2013–2019',
  body: 'M63 172 74 123 93 87 146 59Q162 49 190 48H304Q324 49 345 71L391 113 487 128Q515 135 524 154L531 181 513 194H76L61 181Z',
  glass: 'M95 109 109 88 155 68Q168 59 192 59H236V111ZM250 59H302Q315 59 332 80L364 111H252Z',
  seams: 'M243 117 249 179M378 118 392 179M117 116 106 162', handles: [188, 306], rear: 77,
  taillight: 'M80 113 111 110 107 134 73 142Z', headlight: 'M433 126 475 135 493 152 457 148Z',
  grille: '<path d="M491 153 526 160 524 168 494 163ZM495 170 522 174 517 185 496 182Z" fill="#2a382c"/><path d="m505 162 9 2v3l5 1v3l-5-1v3l-9-2v-3l-5-1v-3l5 1Z" fill="#c9bb83"/>',
  details: '<path d="M129 143H417" stroke="#bdcbaa" stroke-opacity=".5" stroke-width="2"/>'
};

export function modelProfile(make, model, year, body) {
  const has = name => (` ${model} `).includes(` ${name} `);
  const y = /^\d{4}$/.test(String(year)) ? Number(year) : null;
  if(!y)return null;
  if(make==='toyota'&&has('corolla')&&!/\b(cross|hatch|hatchback|wagon|touring|rural)\b/.test(model)&&body==='sedan'){
    if(y>=2014&&y<=2016)return {id:'toyota-corolla-2014',label:'Toyota Corolla · 2014–2016'};
    if(y>=2017&&y<=2019)return {id:'toyota-corolla-2017',label:'Toyota Corolla · 2017–2019'};
    if(y>=2020&&y<=2026)return {id:'toyota-corolla-2020',label:'Toyota Corolla · 2020–2026'};
  }
  if (make === 'ford' && has('fiesta') && body === 'hatchback') {
    if (y && y >= 2002 && y <= 2008) return { ...fiestaClassic, label: 'Ford Fiesta · 2002–2008' };
    if (y && y >= 2009 && y <= 2012) return fiestaPreFacelift;
    if (y && y >= 2018 && y <= 2023) return fiestaNew;
    if (y >= 2013 && y <= 2017) return fiestaModern;
  }
  if (make === 'volkswagen' && has('golf') && body === 'hatchback') {
    if(y>=2013&&y<=2020)return {...golf,id:'volkswagen-golf-mk7',label:'Volkswagen Golf · 2013–2020'};
    if(y>=2009&&y<=2012)return {...golf,id:'volkswagen-golf-mk6',label:'Volkswagen Golf · 2009–2012'};
  }
  if (make === 'peugeot' && has('208') && body === 'hatchback' && y >= 2013 && y <= 2019) return peugeot208;
  if (make === 'chevrolet' && has('onix') && body === 'hatchback') {
    if(y>=2013&&y<=2016)return {...onix,id:'chevrolet-onix-2013',label:'Chevrolet Onix · 2013–2016'};
    if(y>=2017&&y<=2019)return {...onix,id:'chevrolet-onix-2017',label:'Chevrolet Onix · 2017–2019'};
  }
  return null;
}
