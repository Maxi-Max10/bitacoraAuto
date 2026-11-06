import {fiestaIllustration} from './fiesta.js';
import {golfIllustration} from './golf.js';
import {peugeot208Illustration} from './peugeot208.js';
import {onixIllustration} from './onix.js';
import {corolla2014Illustration} from './corolla-2014.js';
import {corolla2017Illustration} from './corolla-2017.js';
import {corolla2020Illustration} from './corolla-2020.js';

// Artwork is selected by a model-generation key, never by the previous vehicle.
// A model/year outside this catalog uses a line schematic, never another car.
export const carIllustrations={
  'ford-fiesta-2013':fiestaIllustration,
  'volkswagen-golf-mk7':golfIllustration,
  'peugeot-208':peugeot208Illustration,
  'chevrolet-onix-2013':onixIllustration,
  'toyota-corolla-2014':corolla2014Illustration,
  'toyota-corolla-2017':corolla2017Illustration,
  'toyota-corolla-2020':corolla2020Illustration,
};
