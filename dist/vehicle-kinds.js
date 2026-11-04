const drawings={
  motorcycle:'M120 180 235 138 317 180 253 180 211 129 172 129M235 138 291 109 347 119 423 180M390 94 423 180M372 93H404M214 122H164M285 109 268 92 303 83 331 97 347 119M353 116l29-9 9 9M144 166 166 133',
  bicycle:'M120 180 227 180 173 109 120 180 231 131 292 180 363 180M227 180 268 105 329 105 363 180M253 102H286M314 93 328 105 343 96',
  truck:'M54 161V57H333V180H210M333 180V91H410L455 136V180H493M354 105H399L425 137H354ZM65 72H321M66 154H320M456 151H485M207 180H325',
  bus:'M62 180V66Q62 45 83 45H447Q471 45 478 68L495 180H62M80 65H143V112H80ZM155 65H218V112H155ZM230 65H293V112H230ZM305 65H368V112H305ZM380 65H445L461 112H380ZM373 122V179M80 137H352M454 141H483',
  motorhome:'M55 179V59H329L349 82H410L461 128 480 180H55M73 78H147V119H73ZM167 78H241V119H167ZM263 83H308V174H263ZM353 96H399L431 129H353ZM75 143H240M461 145H480',
  boat:'M55 154Q277 170 514 137L450 194H150L55 154M161 159 202 112H365L415 150M245 111V70H324L359 111M259 81H311L333 105H248ZM193 217q30-15 60 0t60 0t60 0t60 0',
  other:'M98 180V112L172 69H332L423 112 486 142V180H98M185 84H243V112H144M255 84H324L380 112H255'
};
const wheelPositions={motorcycle:[120,423],bicycle:[120,363],truck:[166,434],bus:[151,424],motorhome:[145,416],other:[158,427]};
export function kindArtwork(car,appearance,escape){
  const type=car.type,shape=drawings[type]||drawings.other,wheels=wheelPositions[type]||[];
  return `<svg class="vehicle-illustration kind-illustration" data-body="${type}" data-profile="type-${type}" data-stage="${appearance.stage}" viewBox="0 0 580 250" role="img" aria-label="${escape(`${appearance.label}: ${car.make||''} ${car.model||''}`)}"><ellipse cx="280" cy="218" rx="212" ry="8" fill="#111c12" opacity=".4"/><g class="car-paint" fill="none" stroke="#b8c8a3" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><path d="${shape}"/>${wheels.map(x=>`<circle cx="${x}" cy="180" r="33" fill="#253327"/><circle cx="${x}" cy="180" r="22" stroke="#8fA77c"/><path d="M${x-15} 165l30 30m0-30-30 30" stroke-width="3"/>`).join('')}</g><g class="car-tracing" fill="none" stroke="#e1edc9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path class="car-draw-line" pathLength="1" d="${shape}"/></g></svg>`;
}
