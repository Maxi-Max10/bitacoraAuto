import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BODY_TYPES, freshState, validateCar, deserializeBackup, serializeBackup } from '../dist/core.js';
import { vehicleAppearance, carArtwork } from '../dist/vehicle.js';

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
  assert.equal(new Set(drawings.map(svg => svg.match(/<g class="vehicle-bodywork">\s*<path d="([^"]+)"/)[1])).size, Object.keys(BODY_TYPES).length);
  const svg = carArtwork({make:'<script>alert(1)</script>',model:'" onload="bad'});
  assert.ok(!svg.includes('<script>'));
  assert.ok(!svg.includes(' onload="bad'));
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
