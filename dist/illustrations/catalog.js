import {fiestaIllustration} from './fiesta.js';
import {golfIllustration} from './golf.js';
import {peugeot208Illustration} from './peugeot208.js';
import {onixIllustration} from './onix.js';
import {hatchbackBodyIllustration} from './body-hatchback.js';
import {sedanBodyIllustration} from './body-sedan.js';
import {suvBodyIllustration} from './body-suv.js';
import {pickupBodyIllustration} from './body-pickup.js';
import {wagonBodyIllustration} from './body-wagon.js';
import {coupeBodyIllustration} from './body-coupe.js';
import {convertibleBodyIllustration} from './body-convertible.js';
import {vanBodyIllustration} from './body-van.js';

// Artwork is selected by a model-generation key, never by the previous vehicle.
// A model outside this catalog falls back to its own body-style drawing.
export const carIllustrations={
  'ford-fiesta-2013':fiestaIllustration,
  'volkswagen-golf-mk7':golfIllustration,
  'peugeot-208':peugeot208Illustration,
  'chevrolet-onix-2013':onixIllustration,
};

// Brand-neutral illustrations for vehicles without a model-specific asset.
export const bodyIllustrations={
  hatchback:hatchbackBodyIllustration,
  sedan:sedanBodyIllustration,
  suv:suvBodyIllustration,
  pickup:pickupBodyIllustration,
  wagon:wagonBodyIllustration,
  coupe:coupeBodyIllustration,
  convertible:convertibleBodyIllustration,
  van:vanBodyIllustration,
};
