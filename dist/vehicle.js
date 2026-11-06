import { BODY_TYPES, VEHICLE_TYPES, escapeHTML } from './core.js';
import { modelProfile } from './vehicle-models.js';
import { kindArtwork } from './vehicle-kinds.js';
import { illustratedVehicle } from './vehicle-illustration.js';
import { carIllustrations } from './illustrations/catalog.js';

const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const aliases = { vw: 'volkswagen', volkswagen: 'volkswagen', frod: 'ford', 'mercedes benz': 'mercedes', 'mercedes-benz': 'mercedes', 'chevy': 'chevrolet', 'alfa romeo': 'alfa' };
const makeKey=make=>aliases[normalize(make)]||(normalize(make)==='land rover'?'landrover':normalize(make));
const modelKey=(make,model)=>make==='toyota'?normalize(model).replace(/\b(corrolla|corrola|corola)\b/g,'corolla'):normalize(model);
const displayModel=name=>name.replace(/\b[a-z]/g,letter=>letter.toUpperCase());

// These select an illustrative body style, not an exact model or generation.
// Match within the make to avoid collisions such as Fiat 500 / Peugeot 5008.
const models = {
  volkswagen: { pickup: 'amarok|saveiro', suv: 't cross|t roc|taos|tiguan|touareg|nivus|atlas|id 4', wagon: 'golf variant|passat variant|suran|spacefox|fox suran', sedan: 'vento|bora|virtus|voyage|santana|passat|jetta|polo classic', van: 'transporter|caravelle|caddy|kombi|multivan', coupe: 'scirocco|arteon', hatchback: 'golf|polo|gol|fox|up|beetle|escarabajo|id 3' },
  toyota: { pickup: 'hilux|tacoma|tundra', suv: 'corolla cross|yaris cross|rav4|rav 4|sw4|fortuner|land cruiser|rush|c hr', coupe: 'supra|86|gr86', van: 'hiace|sienna|innova', hatchback: 'etios|yaris|aygo|agya', sedan: 'corolla|camry|avensis|prius' },
  ford: { pickup: 'ranger|maverick|f 100|f 150|f 250|f 350', suv: 'ecosport|kuga|territory|bronco|explorer|edge|escape|everest', van: 'transit|tourneo', coupe: 'mustang|puma coupe', sedan: 'focus sedan|fiesta sedan|mondeo|falcon|fusion|escort sedan|orion', hatchback: 'fiesta|focus|ka|escort' },
  chevrolet: { pickup: 's10|s 10|silverado|montana|colorado|c 10', suv: 'tracker|captiva|trailblazer|equinox|spin|blazer|suburban|tahoe', coupe: 'camaro|corvette', sedan: 'onix plus|prisma|cruze|cobalt|aveo|classic|corsa classic|corsa sedan|astra sedan|vectra|malibu', van: 'n300|express', hatchback: 'onix|corsa|celta|agile|astra|spark|sonic' },
  renault: { pickup: 'alaskan|oroch', suv: 'duster|captur|koleos|kardian|arkana|austral', van: 'kangoo|master|trafic|scenic|espace', sedan: 'logan|fluence|symbol|megane sedan|r9|r19|12|19|9', coupe: 'fuego|megane coupe', hatchback: 'clio|sandero|kwid|twingo|megane' },
  fiat: { pickup: 'toro|strada|titano|fullback', suv: 'pulse|fastback|freemont|500x', van: 'fiorino|ducato|doblo|qubo|multipla', wagon: 'palio weekend|siena weekend', sedan: 'cronos|siena|grand siena|linea|tempra|duna|tipo sedan', hatchback: 'argo|mobi|uno|palio|punto|500|bravo|stilo|tipo|147' },
  peugeot: { pickup: 'landtrek|hoggar', suv: '2008|3008|4008|5008', van: 'partner|expert|boxer|rifter|traveller', wagon: '206 sw|207 sw|307 sw|308 sw|407 sw|508 sw', convertible: '206 cc|207 cc|307 cc|308 cc', coupe: 'rcz|406 coupe|407 coupe', sedan: '301|408|508|504|505|405|406|407|306 sedan|307 sedan', hatchback: '106|107|108|205|206|207|208|306|307|308|309' },
  citroen: { suv: 'c3 aircross|c4 aircross|c5 aircross|c4 cactus|c5 x', van: 'berlingo|jumpy|jumper|spacetourer|picasso', sedan: 'c4 lounge|c4 sedan|c elysee|c5|c6', hatchback: 'c3|c4|c2|c1|saxo|xsara|ax' },
  honda: { pickup: 'ridgeline', suv: 'hr v|hrv|cr v|crv|wr v|wrv|zr v|pilot|passport', van: 'odyssey|freed', convertible: 's2000', coupe: 'cr z|nsx|civic coupe', hatchback: 'fit|jazz|civic hatchback|city hatchback', sedan: 'civic|city|accord|insight' },
  nissan: { pickup: 'frontier|np300|np 300|navara|titan', suv: 'kicks|qashqai|x trail|xtrail|murano|pathfinder|patrol|juke|terra', van: 'nv200|nv 200|urvan|serena', coupe: 'gt r|350z|370z|z', hatchback: 'march|note|tiida|leaf|micra', sedan: 'versa|sentra|altima|maxima|sunny' },
  bmw: { suv: 'x1|x2|x3|x4|x5|x6|x7|ix|ix1|ix3', coupe: 'm2|m4|m8|serie 2 coupe|serie 4|serie 8|i8', convertible: 'z3|z4|z8', hatchback: 'serie 1|118i|120i|125i|135i|140i|i3', sedan: 'serie 3|serie 5|serie 7|320i|328i|330i|335i|340i|m3|m5|i4|i5|i7' },
  mercedes: { suv: 'gla|glb|glc|gle|gls|eqa|eqb|eqc|clase g', van: 'vito|sprinter|clase v', convertible: 'sl|slk|slc', coupe: 'amg gt|cla|cls|cle', hatchback: 'clase a|clase b|a 180|a 200|a 250', sedan: 'clase c|clase e|clase s|c 200|c 250|c 300|e 220|e 300|eqe|eqs' },
  audi: { suv: 'q2|q3|q4|q5|q6|q7|q8', wagon: 'a4 avant|a6 avant|rs4|rs6|allroad', coupe: 'tt|r8|a5|rs5', hatchback: 'a1|a3', sedan: 'a4|a6|a7|a8|s3|s4|s6|s8' },
  jeep: { pickup: 'gladiator', suv: 'renegade|compass|commander|cherokee|wrangler|avenger|wagoneer' },
  hyundai: { suv: 'creta|tucson|santa fe|kona|palisade|venue|ioniq 5', van: 'staria|h1|h 1', coupe: 'genesis coupe|veloster', sedan: 'elantra|accent|sonata|ioniq 6|hb20s', hatchback: 'i10|i20|i30|hb20|atos|getz' },
  kia: { suv: 'sportage|sorento|seltos|sonet|niro|stonic|ev3|ev5|ev6|ev9', van: 'carnival|carens', sedan: 'cerato|forte|optima|k3|k4|k5|stinger', hatchback: 'picanto|rio|ceed|soul' },
  suzuki: { suv: 'vitara|jimny|s cross|grand vitara', hatchback: 'swift|baleno|alto|celerio|ignis' },
  mitsubishi: { pickup: 'l200|l 200|triton', suv: 'outlander|montero|pajero|asx|eclipse cross', sedan: 'lancer', hatchback: 'mirage|colt' },
  mazda: { suv: 'cx 3|cx 30|cx 5|cx 50|cx 60|cx 9|cx 90', convertible: 'mx 5|miata', hatchback: 'mazda2|2|mazda3|3', sedan: 'mazda6|6' },
  tesla: { suv: 'model x|model y', pickup: 'cybertruck', sedan: 'model 3|model s', coupe: 'roadster' },
  byd: { suv: 'atto 3|yuan|song|tang|seal u|sealion', pickup: 'shark', sedan: 'seal|han|king|qin', hatchback: 'dolphin|seagull' },
  chery: { suv: 'tiggo|omoda|jetour', sedan: 'arrizo', hatchback: 'qq|fulwin|face' },
  volvo: { suv: 'xc40|xc60|xc90|ex30|ex40|ex90', wagon: 'v40|v60|v70|v90', sedan: 's40|s60|s80|s90' },
  seat: { suv: 'arona|ateca|tarraco', wagon: 'leon st', sedan: 'cordoba|toledo', hatchback: 'ibiza|leon|mii' },
  skoda: { suv: 'kamiq|karoq|kodiaq|enyaq', sedan: 'octavia|superb', hatchback: 'fabia|scala|citigo' },
  mini: { suv: 'countryman|paceman|aceman', wagon: 'clubman', hatchback: 'cooper|one|john cooper works' },
  alfa: { suv: 'tonale|stelvio|junior', sedan: 'giulia|156|159|164|166', coupe: '4c|8c|gt|brera', hatchback: 'mito|giulietta|147|145|146' },
  porsche: { suv: 'cayenne|macan', sedan: 'panamera|taycan', convertible: 'boxster|spyder', coupe: '911|cayman|718' },
  subaru: { suv: 'forester|crosstrek|tribeca|ascent|xv', wagon: 'outback|levorg', coupe: 'brz', sedan: 'impreza|legacy|wrx' },
  landrover: { suv: 'defender|discovery|range rover|evoque|freelander|velar' }
};

const hints = [
  ['convertible', /\b(cabrio|cabriolet|convertible|descapotable|roadster|spider|spyder)\b/],
  ['wagon', /\b(wagon|variant|avant|touring|rural|familiar|break|weekend|sw)\b/],
  ['sedan', /\b(sedan|saloon|4 puertas|4p)\b/],
  ['hatchback', /\b(hatchback|hatch|sportback|5 puertas|3 puertas|5p|3p)\b/],
  ['pickup', /\b(pickup|pick up|doble cabina|cabina simple)\b/],
  ['suv', /\b(suv|crossover|todoterreno)\b/],
  ['van', /\b(van|furgon|furgoneta|minivan|monovolumen|combi|utilitario)\b/],
  ['coupe', /\b(coupe|deportivo)\b/]
];

export function vehicleModelSuggestions(make){
  return [...new Set(Object.values(models[makeKey(make)]||{}).flatMap(names=>names.split('|')))].sort().map(displayModel);
}

export function vehicleAppearance(car = {}) {
  const make = normalize(car.make), brand=makeKey(car.make), model=modelKey(brand,car.model);
  if(car.type&&Object.hasOwn(VEHICLE_TYPES,car.type)&&!['car','pickup','suv','van'].includes(car.type)){
    return {body:car.type,label:VEHICLE_TYPES[car.type],drawingLabel:VEHICLE_TYPES[car.type],source:'type',profile:null,profileId:`type-${car.type}`,trim:0,stage:!make?0:!model?1:!/^\d{4}$/.test(String(car.year))?2:3};
  }
  const catalogue=models[brand]||{};
  const match=Object.entries(catalogue).flatMap(([body,names])=>names.split('|').map(name=>({body,name}))).filter(({name})=>` ${model} `.includes(` ${name} `)).sort((a,b)=>b.name.length-a.name.length)[0];
  let body = Object.hasOwn(BODY_TYPES, car.body) ? car.body : ['pickup','suv','van'].includes(car.type)?car.type:null;
  let source = body ? 'manual' : 'fallback';
  if (!body) {
    const hint = hints.find(([, pattern]) => pattern.test(model));
    if (hint) { body = hint[0]; source = 'model'; }
  }
  if (!body) {
    if (match) { body = match.body; source = 'model'; }
  }
  // An unknown model stays usable; the form lets its owner choose any body.
  body ||= 'hatchback';
  const trim = [...make].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 3;
  const profile = modelProfile(brand, model, car.year, body);
  const hasModelIllustration = Boolean(profile && Object.hasOwn(carIllustrations, profile.id));
  const stage = !make ? 0 : !model ? 1 : !/^\d{4}$/.test(String(car.year)) ? 2 : 3;
  const recognizedModel=match?displayModel(match.name):'';
  return { body, label: BODY_TYPES[body], source, trim, profile, profileId: profile?.id || body, stage, hasModelIllustration,recognizedModel,
    drawingLabel: hasModelIllustration ? profile.label : stage===2&&recognizedModel?`${recognizedModel} · Completá el año`:source==='fallback'&&stage>=2?'Modelo sin identificar · Esquema orientativo':`${BODY_TYPES[body]} · Esquema orientativo` };
}

const silhouettes = {
  hatchback: {
    body: 'M65 161 81 123 116 110 165 65Q178 53 207 53H326Q351 53 372 71L424 112 494 126Q520 132 525 149L533 177 516 189H74L60 177Z',
    glass: 'M127 108 173 70Q181 64 203 64H244V108ZM257 64H324Q341 64 360 80L394 108H259Z',
    seams: 'M251 114 254 174M402 114 411 174M129 115 119 165', handles: [190, 305], rear: 84, roof: 56
  },
  sedan: {
    body: 'M49 161 64 133 130 117 194 69Q208 57 235 57H333Q357 57 378 73L435 113 504 128Q528 133 534 152L539 178 522 190H60L45 178Z',
    glass: 'M148 112 201 76Q210 68 234 68H259V112ZM272 68H332Q350 68 366 81L407 112H274Z',
    seams: 'M266 118 270 178M416 117 425 177M151 118 140 169', handles: [207, 320], rear: 64, roof: 60
  },
  suv: {
    body: 'M52 165 65 117 100 102 135 52Q146 38 173 38H329Q355 38 378 60L427 104 501 116Q526 122 532 145L537 178 520 194H58L47 181Z',
    glass: 'M111 102 145 55Q151 49 174 49H218V102ZM231 49H281V102H232ZM294 49H327Q346 49 363 66L399 102H295Z',
    seams: 'M224 108 228 177M287 108 291 177M407 108 420 177', handles: [183, 331], rear: 65, roof: 41, raised: true,
    details: '<path d="M145 33H329M150 28V34M322 28V34" stroke="#9fac90" stroke-width="4"/><path d="M88 178H496" stroke="#46533f" stroke-width="9"/>'
  },
  pickup: {
    body: 'M38 163 47 105H218L229 65Q233 52 250 52H337Q353 52 368 69L408 108 501 122Q525 128 532 149L538 179 520 193H47L35 179Z',
    glass: 'M233 105 242 70Q245 63 257 63H277V105ZM289 63H334Q345 63 357 77L382 105H291Z',
    seams: 'M218 109V177M283 110 287 177M394 110 404 177', handles: [245, 337], rear: 48, roof: 55, raised: true,
    details: '<path d="M48 104H218" stroke="#46533f" stroke-width="7"/><path d="M209 106V78H218V107" fill="#59694d"/><path d="M226 184H385" stroke="#9ba98b" stroke-width="5"/>'
  },
  wagon: {
    body: 'M48 161 65 114 103 60Q111 49 135 49H329Q353 49 376 70L428 111 502 127Q525 132 532 152L537 178 520 190H58L44 178Z',
    glass: 'M78 108 112 64Q118 60 137 60H215V108ZM228 60H280V108H229ZM293 60H328Q344 60 361 76L400 108H294Z',
    seams: 'M222 115 226 176M286 115 290 176M410 115 420 176', handles: [181, 332], rear: 63, roof: 52,
    details: '<path d="M122 44H328" stroke="#a9b69a" stroke-width="4"/>'
  },
  coupe: {
    body: 'M49 163 68 136 137 116 211 78Q232 66 265 66H327Q350 66 371 83L414 115 497 129Q523 134 531 153L537 177 521 190H60L45 178Z',
    glass: 'M165 113 218 84Q237 76 260 76H265V113ZM278 76H324Q341 76 360 91L385 113H280Z',
    seams: 'M274 118 279 176M397 118 408 177M168 119 154 167', handles: [310], rear: 66, roof: 69,
    details: '<path d="M188 179H399" stroke="#c1cdb1" stroke-width="3"/>'
  },
  convertible: {
    body: 'M49 163 66 134 152 115H339L354 83 367 80 404 116 495 128Q522 134 531 152L537 177 521 190H60L45 178Z',
    glass: 'M351 112 361 91 387 112Z',
    seams: 'M264 119 269 177M397 121 407 177M165 119 151 167', handles: [299], rear: 64, roof: 83,
    details: '<path d="M174 114V100Q174 94 182 94H201Q210 94 210 104V114M265 114V100Q265 94 273 94H292Q301 94 301 104V114" fill="#334133"/><path d="M155 116H344" stroke="#c7d2b6" stroke-width="4"/>'
  },
  van: {
    body: 'M50 166 62 64Q64 38 91 38H346Q369 38 387 66L421 118 491 131Q516 137 524 156L530 181 513 196H58L46 182Z',
    glass: 'M77 101 82 61Q83 51 96 51H204V101ZM217 51H291V101H218ZM304 51H342Q355 51 369 73L389 106H305Z',
    seams: 'M211 108V179M297 109V180M400 113 410 179M72 108H291', handles: [238, 345], rear: 62, roof: 41, raised: true,
    details: '<path d="M84 126H285M89 175H289" stroke="#6f815d" stroke-width="2"/>'
  }
};

function wheel(x, y, radius, trim) {
  const spokes = Array.from({ length: trim === 1 ? 5 : 8 }, (_, index) => {
    const angle = index * 360 / (trim === 1 ? 5 : 8);
    return `<path d="M0 -8V-${radius - 12}" transform="rotate(${angle})"/>`;
  }).join('');
  return `<g transform="translate(${x} ${y})"><circle r="${radius}" fill="#172126"/><circle r="${radius - 6}" fill="url(#vehicle-rim)" stroke="#596c75" stroke-width="2"/><circle r="${radius - 12}" fill="#35464f"/><g stroke="#d3e0e5" stroke-width="${trim === 1 ? 5 : 3.5}" stroke-linecap="round">${spokes}</g><circle r="8" fill="#aebfc7"/><circle r="3.5" fill="#5e727d"/></g>`;
}

export function carArtwork(car = {}) {
  const appearance = vehicleAppearance(car), shape = silhouettes[appearance.body];
  if(appearance.source==='type')return kindArtwork(car,appearance,escapeHTML);
  const illustrated=illustratedVehicle(car,appearance,escapeHTML);
  if(illustrated)return illustrated;
  const name = [car.make, car.model, car.year].filter(Boolean).join(' ').trim();
  const label = escapeHTML(name ? `Esquema orientativo${appearance.source==='fallback'?'':` de ${appearance.label}`} para ${name}. No es una ilustración del modelo.` : 'Esquema de un auto. Completá la marca, el modelo y el año para identificarlo.');
  const y = shape.raised ? 188 : 184, radius = shape.raised ? 37 : 34;
  const lights = appearance.trim === 1 ? 'M481 129 518 141 520 148 479 143Z' : appearance.trim === 2 ? 'M480 130 516 140 519 148 482 145ZM483 149 520 152 520 156 485 153Z' : 'M480 128 516 140 520 151 479 144Z';
  return `<svg class="vehicle-illustration vehicle-schematic" data-renderer="schematic" data-artwork="body" data-body="${appearance.body}" data-profile="${appearance.profileId}" data-stage="${appearance.stage}" viewBox="0 0 580 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">
    <defs>
      <linearGradient id="vehicle-body" x1="0" y1="0" x2="0.15" y2="1"><stop stop-color="#f5f7f7"/><stop offset=".28" stop-color="#dce3e5"/><stop offset=".52" stop-color="#b3c0c4"/><stop offset=".64" stop-color="#d0d9dc"/><stop offset="1" stop-color="#788b91"/></linearGradient>
      <linearGradient id="vehicle-glass" x1="0" y1="0" x2=".6" y2="1"><stop stop-color="#657b85"/><stop offset=".55" stop-color="#23343d"/><stop offset="1" stop-color="#425a65"/></linearGradient>
      <radialGradient id="vehicle-rim"><stop stop-color="#86979f"/><stop offset=".8" stop-color="#c7d3d8"/><stop offset="1" stop-color="#52646e"/></radialGradient>
      <filter id="vehicle-shadow"><feGaussianBlur stdDeviation="6"/></filter>
    </defs>
    <ellipse cx="291" cy="219" rx="231" ry="9" fill="#101a10" opacity=".55" filter="url(#vehicle-shadow)"/>
    <g class="vehicle-bodywork car-paint">
      <path d="${shape.body}" fill="url(#vehicle-body)" stroke="#93a5ac" stroke-width=".8"/>
      <path d="${shape.glass}" fill="url(#vehicle-glass)" stroke="#c3cfd5" stroke-width="2"/>
      <path d="M${shape.rear} 127 418 119M85 157H488" fill="none" stroke="#d4dfc5" stroke-opacity=".3" stroke-width="2"/>
      <path d="${shape.seams}" fill="none" stroke="#71828a" stroke-opacity=".7" stroke-width="1.4"/>
      ${shape.handles.map(x => `<path d="M${x} 122h22" stroke="#61727a" stroke-width="4" stroke-linecap="round"/>`).join('')}
      ${shape.details || ''}
      <path class="car-finishing" d="${shape.taillight || `M${shape.rear} 135 ${shape.rear + 28} 131 ${shape.rear + 23} 145 ${shape.rear - 5} 150Z`}" fill="#c9755a"/>
      <path class="car-finishing" d="${shape.headlight || lights}" fill="#e8edd4"/>
      <g class="car-finishing">${shape.grille || '<path d="M493 155 525 160 523 174 500 177Z" fill="#3c4b34"/>'}</g>
      <path d="M396 109 411 111 415 119 394 118 387 114Z" fill="#b2bdc2" stroke="#dce3e5"/>
      <path d="M${145 - radius - 7} ${y + 5}a${radius + 7} ${radius + 7} 0 0 1 ${2 * (radius + 7)} 0M${445 - radius - 7} ${y + 5}a${radius + 7} ${radius + 7} 0 0 1 ${2 * (radius + 7)} 0" fill="#263027"/>
      <path d="M193 187H397" stroke="#d5dfe3" stroke-opacity=".5" stroke-width="3"/>
    </g>
    <g class="car-wheels">${wheel(145, y, radius, appearance.profile ? 0 : appearance.trim)}${wheel(445, y, radius, appearance.profile ? 0 : appearance.trim)}</g>
    <g class="car-tracing" fill="none" stroke="#d9e8bc" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path class="car-draw-line" pathLength="1" d="${shape.body}"/>
      <path class="car-draw-line car-draw-detail" pathLength="1" d="${shape.glass}"/>
      <path class="car-draw-line car-draw-detail" pathLength="1" d="${shape.seams}"/>
      <circle class="car-draw-line car-draw-detail" pathLength="1" cx="145" cy="${y}" r="${radius}"/>
      <circle class="car-draw-line car-draw-detail" pathLength="1" cx="445" cy="${y}" r="${radius}"/>
    </g>
  </svg>`;
}
