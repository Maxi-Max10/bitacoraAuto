import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BODY_TYPES, VEHICLE_TYPES, freshState, validateCar, deserializeBackup, serializeBackup } from '../dist/core.js';
import { vehicleAppearance, carArtwork, vehicleModelSuggestions } from '../dist/vehicle.js';

test('elige carrocerías distintas por marca y modelo, con alias y versiones', () => {
  for (const [make, model, body] of [
    ['VW', 'Golf 1.4 TSI', 'hatchback'], ['Toyota', 'Corolla XEI', 'sedan'],
    ['Toyota', 'Corolla Cross', 'suv'], ['Ford', 'Ranger XLT', 'pickup'],
    ['Peugeot', '208 Allure', 'hatchback'], ['Peugeot', '2008', 'suv'],
    ['Renault', 'Kangoo', 'van'], ['Volkswagen', 'Golf Variant', 'wagon'],
    ['Ford', 'Mustang GT', 'coupe'], ['Mazda', 'MX-5', 'convertible'],
    ['Fiat', '500', 'hatchback'], ['Peugeot', '5008', 'suv'],
    ['Mercedes-Benz', 'GLC 300', 'suv'], ['Audi', 'A3 Sedán', 'sedan'],
    ['Chevrolet', 'Onix Plus', 'sedan'], ['Chevrolet', 'Onix LT', 'hatchback']
  ]) assert.equal(vehicleAppearance({make, model}).body, body, `${make} ${model}`);
});

test('no mezcla marcas ni encuentra números dentro de otros modelos', () => {
  assert.equal(vehicleAppearance({make:'Ford', model:'Golf'}).source, 'fallback');
  assert.equal(vehicleAppearance({make:'Peugeot', model:'12008'}).source, 'fallback');
});

test('acepta cualquier marca con selección manual y respeta su elección', () => {
  for (const body of Object.keys(BODY_TYPES)) {
    const car = {make:'Una marca nueva', model:'Modelo desconocido', body};
    assert.equal(vehicleAppearance(car).body, body);
    assert.match(carArtwork(car), new RegExp(`data-body="${body}"`));
  }
  assert.equal(vehicleAppearance({make:'Toyota', model:'Hilux', body:'sedan'}).body, 'sedan');
  assert.equal(vehicleAppearance({make:'Marca nueva', model:'Modelo SUV'}).body, 'suv');
  assert.equal(vehicleAppearance().source, 'fallback');
});

test('los SVG cambian realmente de silueta y escapan la marca y el modelo', () => {
  const drawings = Object.keys(BODY_TYPES).map(body => carArtwork({body}));
  assert.equal(new Set(drawings.map(svg => svg.match(/<g class="vehicle-bodywork car-paint">\s*<path d="([^"]+)"/)[1])).size, Object.keys(BODY_TYPES).length);
  const svg = carArtwork({make:'<script>alert(1)</script>',model:'" onload="bad'});
  assert.ok(!svg.includes('<script>'));
  assert.ok(!svg.includes(' onload="bad'));
});

test('Fiesta tiene un dibujo propio que cambia con el año, sin usar fotografías', () => {
  const car = {make:'FORD', model:'FIESTA SE 1.6', year:2015};
  assert.equal(vehicleAppearance(car).profileId, 'ford-fiesta-2013');
  assert.equal(vehicleAppearance({...car, year:2010}).profileId, 'ford-fiesta-2009');
  assert.equal(vehicleAppearance({...car, year:2019}).profileId, 'ford-fiesta-2018');
  assert.equal(vehicleAppearance({...car, year:1995}).profile, null);
  const drawing = carArtwork(car);
  assert.match(drawing, /data-profile="ford-fiesta-2013"/);
  assert.match(drawing, /car-draw-line/);
  assert.match(drawing, /data-renderer="illustrated"/);
  assert.match(drawing, /ford-fiesta-2015-v2\.png/);
  assert.match(drawing, /aria-label="Ilustración animada de FORD FIESTA SE 1\.6 2015"/);
  assert.ok(!drawing.includes('<img'));
  assert.notEqual(drawing, carArtwork({...car, model:'Focus'}));
  assert.equal(vehicleAppearance({...car, body:'sedan'}).profile, null);
});

test('el armado del dibujo progresa con marca, modelo y año', () => {
  assert.equal(vehicleAppearance({}).stage, 0);
  assert.equal(vehicleAppearance({make:'Ford'}).stage, 1);
  assert.equal(vehicleAppearance({make:'Ford',model:'Fiesta'}).stage, 2);
  assert.equal(vehicleAppearance({make:'Ford',model:'Fiesta',year:'201'}).stage, 2);
  assert.equal(vehicleAppearance({make:'Ford',model:'Fiesta',year:2015}).stage, 3);
});

test('cambiar de marca, modelo o generación elige otra ilustración', () => {
  const cases=[
    [{make:'Ford',model:'Fiesta SE',year:2015},'ford-fiesta-2015-v2.png'],
    [{make:'VW',model:'Golf 1.4 TSI',year:2018},'volkswagen-golf-2017-v2.png'],
    [{make:'Peugeot',model:'208 Allure',year:2016},'peugeot-208-2016-v2.png'],
    [{make:'Chevrolet',model:'Onix LT',year:2016},'chevrolet-onix-2016-v2.png'],
    [{make:'Toyota',model:'Corolla XEI',year:2015},'toyota-corolla-2015-v1.png'],
    [{make:'Toyota',model:'Corolla XEI',year:2018},'toyota-corolla-2018-v1.png'],
    [{make:'Toyota',model:'Corolla XEI',year:2022},'toyota-corolla-2022-v1.png']
  ];
  const sources=cases.map(([car,filename])=>{
    const drawing=carArtwork(car);
    assert.match(drawing,/data-artwork="model"/);
    assert.ok(drawing.includes(filename));
    assert.equal(vehicleAppearance(car).hasModelIllustration,true);
    return drawing.match(/<image href="([^"]+)"/)[1];
  });
  assert.equal(new Set(sources).size,cases.length);
  for(const car of [
    {make:'Ford',model:'Fiesta',year:2010},
    {make:'Volkswagen',model:'Golf',year:2023},
    {make:'Peugeot',model:'208',year:2024},
    {make:'Chevrolet',model:'Onix',year:2019},
    {make:'Ford',model:'Golf',year:2018},
    {make:'Otra marca',model:'Modelo nuevo',year:2026},
    {make:'Ford',model:'Fiesta',year:2015,body:'sedan'}
  ]){
    assert.equal(vehicleAppearance(car).hasModelIllustration,false);
    assert.match(vehicleAppearance(car).drawingLabel,/Esquema orientativo/);
    assert.ok(!carArtwork(car).includes('data-artwork="model"'));
    assert.ok(!carArtwork(car).includes('ford-fiesta-2015-v2.png'));
  }
});

test('un modelo sin ilustración muestra un esquema y nunca una imagen de otro auto',()=>{
  const sources=Object.keys(BODY_TYPES).map(body=>{
    const car={make:'Marca nueva',model:'Modelo desconocido',year:2026,body};
    const drawing=carArtwork(car);
    assert.match(drawing,/data-artwork="body"/);
    assert.match(drawing,/data-renderer="schematic"/);
    assert.match(drawing,new RegExp(`data-body="${body}"`));
    assert.match(drawing,/No es una ilustración del modelo/);
    assert.ok(!drawing.includes('<image'));
    return drawing.match(/<g class="vehicle-bodywork car-paint">\s*<path d="([^"]+)"/)[1];
  });
  assert.equal(new Set(sources).size,Object.keys(BODY_TYPES).length);
});

test('reconoce Corolla con errores habituales y exige año antes de elegir generación',()=>{
  for(const model of ['Corolla','corrolla','CORROLA','corola XEI']){
    const pending={make:'toyota',model,body:'auto',year:''};
    assert.equal(vehicleAppearance(pending).body,'sedan');
    assert.equal(vehicleAppearance(pending).recognizedModel,'Corolla');
    assert.equal(vehicleAppearance(pending).hasModelIllustration,false);
    assert.match(vehicleAppearance(pending).drawingLabel,/Completá el año/);
    assert.ok(!carArtwork(pending).includes('<image'));
    assert.match(carArtwork({...pending,year:2015}),/toyota-corolla-2015-v1\.png/);
    assert.match(carArtwork({...pending,year:2018}),/toyota-corolla-2018-v1\.png/);
    assert.match(carArtwork({...pending,year:2022}),/toyota-corolla-2022-v1\.png/);
  }
  for(const car of [
    {make:'Toyota',model:'Corolla',year:1998},
    {make:'Toyota',model:'Corolla Cross',year:2022},
    {make:'Toyota',model:'Corolla Cross',year:2022,body:'sedan'},
    {make:'Toyota',model:'Corolla Hatchback',year:2022},
    {make:'Ford',model:'Corolla',year:2022},
    {make:'Toyota',model:'corrolla',year:'202'}
  ])assert.ok(!carArtwork(car).includes('<image'),JSON.stringify(car));
  assert.equal(vehicleAppearance({make:'Toyota',model:'corrolla cross',year:2022}).body,'suv');
  for(const [make,model] of [['Ford','Fiesta'],['VW','Golf'],['Peugeot','208'],['Chevrolet','Onix']])assert.ok(!carArtwork({make,model}).includes('<image'),'sin año no inventa una generación');
});

test('sugiere modelos únicamente de la marca seleccionada',()=>{
  assert.ok(vehicleModelSuggestions('toyota').includes('Corolla'));
  assert.ok(vehicleModelSuggestions('Toyota').includes('Corolla Cross'));
  assert.ok(!vehicleModelSuggestions('Toyota').includes('Fiesta'));
  assert.ok(vehicleModelSuggestions('VW').includes('Golf'));
  assert.deepEqual(vehicleModelSuggestions('Marca desconocida'),[]);
});

test('conserva la carrocería en las copias y abre copias anteriores', async () => {
  const state = freshState();
  state.car = {...state.car, make:'Toyota', model:'Etios', body:'sedan'};
  const restored = deserializeBackup(await serializeBackup(state));
  assert.equal(restored.car.body, 'sedan');
  delete state.car.body;
  const old = deserializeBackup(await serializeBackup(state));
  assert.equal(old.car.body, 'auto');
  assert.doesNotThrow(() => validateCar(state.car));
  assert.throws(() => validateCar({...state.car, body:'<svg>'}));
});

test('otros tipos de vehículo conservan su tipo y tienen una figura adecuada', async()=>{
  for(const type of Object.keys(VEHICLE_TYPES)){
    const car={...freshState().car,type,make:'Marca',model:'Modelo',year:2020};
    assert.doesNotThrow(()=>validateCar(car));
    assert.match(carArtwork(car),/<svg/);
    const restored=deserializeBackup(await serializeBackup({...freshState(),car}));
    assert.equal(restored.car.type,type);
  }
  assert.equal(vehicleAppearance({type:'motorcycle',make:'Honda',model:'Wave'}).body,'motorcycle');
  assert.equal(vehicleAppearance({type:'truck',make:'Volvo',model:'FH'}).body,'truck');
  assert.throws(()=>validateCar({...freshState().car,type:'invalid'}));
});
