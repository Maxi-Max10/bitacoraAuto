export const CATEGORIES = { mantenimiento: 'Mantenimiento', reparacion: 'Reparación', mejora: 'Mejora', revision: 'Revisión', otro: 'Otro' };
export const MAX_FILE_SIZE = 15 * 1024 * 1024;
export const MAX_FILES = 10;
export const BODY_TYPES = { hatchback: 'Hatchback / compacto', sedan: 'Sedán', suv: 'SUV / crossover', pickup: 'Pickup', wagon: 'Familiar / rural', coupe: 'Coupé / deportivo', convertible: 'Cabriolet / descapotable', van: 'Utilitario / monovolumen' };
export const freshState = () => ({ version: 1, car: { make: '', model: '', year: '', plate: '', km: 0, body: 'auto' }, entries: [] });
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export function validDate(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return false;
  const d = new Date(`${date}T${time}:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 16) === `${date}T${time}` && date >= '1900-01-01' && date <= '2100-12-31';
}
export function validateEntry(entry) {
  if (typeof entry.title !== 'string' || !entry.title.trim() || entry.title.length > 160) throw new Error('Escribí un título de hasta 160 caracteres.');
  if (!Object.hasOwn(CATEGORIES, entry.category)) throw new Error('Elegí un tipo de trabajo válido.');
  if (!Number.isInteger(entry.km) || entry.km < 0 || entry.km > 99999999) throw new Error('Ingresá un kilometraje válido, sin decimales.');
  if (!validDate(entry.date, entry.time)) throw new Error('Revisá la fecha y la hora del trabajo.');
  if (entry.cost !== null && (typeof entry.cost !== 'number' || !Number.isFinite(entry.cost) || entry.cost < 0 || entry.cost > 999999999999)) throw new Error('Ingresá un costo válido o dejá el campo vacío.');
  if (typeof entry.notes !== 'string' || entry.notes.length > 10000 || typeof entry.workshop !== 'string' || entry.workshop.length > 160) throw new Error('Las notas o el nombre del taller son demasiado largos.');
  if (!Array.isArray(entry.attachments) || entry.attachments.length > MAX_FILES) throw new Error('Podés adjuntar hasta 10 archivos por registro.');
  for (const f of entry.attachments) {
    if (typeof f.id !== 'string' || typeof f.name !== 'string' || !f.name || f.name.length > 255 || !(f.blob instanceof Blob) || f.blob.size > MAX_FILE_SIZE || typeof f.type !== 'string') throw new Error('Hay un adjunto inválido o de más de 15 MB.');
  }
  return entry;
}
export function validateCar(car) {
  if (!car || typeof car.make !== 'string' || typeof car.model !== 'string' || car.make.length > 60 || car.model.length > 80 || typeof car.plate !== 'string' || car.plate.length > 20 || !Number.isInteger(car.km) || car.km < 0 || car.km > 99999999 || (car.year !== '' && (!Number.isInteger(car.year) || car.year < 1900 || car.year > 2100))) throw new Error('Los datos del auto no son válidos.');
  if (car.body !== undefined && car.body !== 'auto' && !Object.hasOwn(BODY_TYPES, car.body)) throw new Error('Elegí una carrocería válida.');
  return car;
}
export async function serializeBackup(state) {
  const entries = await Promise.all(state.entries.map(async entry => ({ ...entry, attachments: await Promise.all(entry.attachments.map(async f => ({ id: f.id, name: f.name, type: f.type, data: await blobToDataURL(f.blob) }))) })));
  return JSON.stringify({ format: 'bitacora-auto', version: 1, exportedAt: new Date().toISOString(), car: state.car, entries }, null, 2);
}
export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('No se pudo leer uno de los archivos.')); reader.readAsDataURL(blob); });
}
export function deserializeBackup(text) {
  let raw;
  try { raw = JSON.parse(text); } catch { throw new Error('El archivo no es una copia JSON válida.'); }
  if (raw?.format !== 'bitacora-auto' || raw.version !== 1 || !Array.isArray(raw.entries) || raw.entries.length > 100000) throw new Error('Elegí una copia de seguridad creada con Bitácora.');
  const c = validateCar(raw.car);
  const car = { make: c.make, model: c.model, year: c.year, plate: c.plate, km: c.km, body: c.body ?? 'auto' };
  const entryIds = new Set(); const fileIds = new Set();
  const entries = raw.entries.map(e => {
    if (!e || typeof e.id !== 'string' || !e.id || entryIds.has(e.id) || !Array.isArray(e.attachments) || e.attachments.length > MAX_FILES) throw new Error('La copia tiene registros inválidos o repetidos.');
    entryIds.add(e.id);
    const attachments = e.attachments.map(f => {
      if (!f || typeof f.id !== 'string' || !f.id || fileIds.has(f.id) || typeof f.type !== 'string' || typeof f.data !== 'string' || f.data.length > MAX_FILE_SIZE * 1.34 + 1024 || !/^data:[^,]*;base64,[a-zA-Z0-9+/]*={0,2}$/.test(f.data)) throw new Error('La copia contiene un adjunto inválido.');
      fileIds.add(f.id);
      let binary; try { binary = atob(f.data.slice(f.data.indexOf(',') + 1)); } catch { throw new Error('No se pudo recuperar uno de los adjuntos.'); }
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      return { id: f.id, name: f.name, type: f.type, blob: new Blob([bytes], { type: f.type }) };
    });
    return validateEntry({ id: e.id, title: e.title, category: e.category, date: e.date, time: e.time, km: e.km, cost: e.cost, workshop: e.workshop, notes: e.notes, attachments });
  });
  car.km = Math.max(car.km, ...entries.map(e => e.km), 0);
  return { version: 1, car, entries };
}
export function sortEntries(entries, sort = 'newest') {
  return [...entries].sort((a, b) => sort === 'km' ? b.km - a.km : sort === 'oldest' ? `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`) : `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
}
export function filterEntries(entries, query, category) {
  const norm = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const q = norm(query.trim());
  return entries.filter(e => (category === 'todos' || e.category === category) && (!q || norm(`${e.title} ${e.workshop} ${e.notes} ${e.km}`).includes(q)));
}
export function openDatabase() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('bitacora-auto', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('data');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error('No se pudo abrir el almacenamiento. Habilitá los datos de sitios en tu navegador y recargá la app.'));
    req.onblocked = () => reject(new Error('Cerrá otras pestañas de Bitácora y recargá la app.'));
  });
}
export function loadState(db) {
  return new Promise((resolve, reject) => { const req = db.transaction('data').objectStore('data').get('state'); req.onsuccess = () => resolve(req.result || freshState()); req.onerror = () => reject(req.error); });
}
export function saveState(db, state) {
  return new Promise((resolve, reject) => { const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put(state, 'state'); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error || new Error('No se pudo completar el guardado.')); });
}
