# Ilustraciones de vehículos

Recursos creados con la herramienta integrada ImageGen (modo **generate**, no CLI). Son ilustraciones digitales con transparencia; la web anima sus contornos y después muestra el color. No se usa la fotografía de referencia como imagen de la aplicación.

## Catálogo y selección

Todos los PNG y sus contornos están en [dist/illustrations](../dist/illustrations/). El registro es [catalog.js](../dist/illustrations/catalog.js).

El Corolla tiene tres recursos propios adicionales, detallados en [referencias y prompts del Corolla](corolla-illustrations.md). Los archivos `body-*.png` de la tabla se conservan como recursos históricos: **ya no se seleccionan como reemplazo de un modelo**.

| Archivo | Selección |
| --- | --- |
| ford-fiesta-2015-v2.png | Ford Fiesta hatchback, 2013–2017 |
| volkswagen-golf-2017-v2.png | Volkswagen Golf Mk7, 2013–2020 |
| peugeot-208-2016-v2.png | Peugeot 208 primera generación, 2013–2019 |
| chevrolet-onix-2016-v2.png | Chevrolet Onix hatchback, 2013–2016 |
| body-hatchback-v2.png | Base genérica: hatchback |
| body-sedan-v2.png | Base genérica: sedan |
| body-suv-v2.png | Base genérica: suv |
| body-pickup-v2.png | Base genérica: pickup |
| body-wagon-v2.png | Base genérica: wagon |
| body-coupe-v2.png | Base genérica: coupe |
| body-convertible-v2.png | Base genérica: convertible |
| body-van-v2.png | Base genérica: van |

Las ilustraciones por modelo representan su generación, no cada acabado o versión regional. Si no hay un recurso del modelo y año elegidos, se muestra únicamente un esquema de líneas con la etiqueta «Esquema orientativo». No se usa una imagen genérica que pueda confundirse con otro modelo. La carrocería se reconoce por marca/modelo o se elige en el formulario. Motos, camiones y otros vehículos conservan las figuras SVG de su tipo.

La marca y el modelo arman un esquema. El año completo habilita la ilustración de la generación disponible; sin año no se elige una generación arbitraria. Los contornos parten del alfa y las zonas oscuras del PNG, sin modificar el raster original. Con movimiento reducido se muestra el resultado sin animación. Si un recurso no carga, permanece su contorno.

## Referencias

Para el Fiesta se utilizó como referencia de identidad la fotografía [2015 Ford Fiesta Zetec 1.2 Front](https://commons.wikimedia.org/wiki/File:2015_Ford_Fiesta_Zetec_1.2_Front.jpg), de **Vauxford**, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Se redibujaron las superficies; la fotografía no se distribuye con la app. Las demás imágenes usaron la ilustración del Fiesta únicamente como referencia de estilo y composición.

## Prompts finales

Parámetro común: `transparent_background: true`. Se realizó una llamada por recurso.

### Fiesta

Referencia: fotografía indicada arriba.

```text
Use case: stylized-concept. Asset type: one polished automotive illustration for the dark forest-green hero card of a vehicle-maintenance web app. Image 1 is a reference for the vehicle identity and proportions ONLY, not a photo to display. Draw an unmistakable 2015 Ford Fiesta Kinetic Design five-door hatchback, front three-quarter view pointing to the right, with the left flank visible and a modest view of the front. Preserve the model's compact hatchback proportions, swept long headlights, large chrome-lined trapezoidal grille, blue Ford oval, short rear and characteristic side-window line. Style: premium hand-finished digital automotive illustration, visibly drawn with refined clean contour lines and smooth stylized shading, handsome and precise, rounded natural curves, crisp details readable at 400px wide; NOT a photograph and NOT a low-poly blocky rendering. Pearl-silver white body, deep graphite windows, charcoal tires, tasteful silver five/split-spoke alloy wheels. Balanced soft highlights, subtle cool shadows. Single car isolated with a genuinely transparent background, no floor, no surroundings, no people, no text or captions, no watermark, blank front license plate. Horizontal composition, complete car and both visible wheels fully within frame with 6% safe transparent padding. The result must look like a beautiful drawn car and not a simplified generic sedan. This reference photograph must never be incorporated as a photographic patch: redraw every surface as illustration.
```

### Golf, 208 y Onix

Referencia de estilo: `ford-fiesta-2015-v2.png`. Plantilla (sustituir `{SUBJECT}` por el texto correspondiente):

```text
Use case: stylized-concept. Asset type: a single automotive illustration for a vehicle garage web app. Image 1 is a STYLE AND COMPOSITION REFERENCE ONLY: copy its polished digital illustration style, silver-white palette, dark windows, transparent background, right-facing front three-quarter view and level of finish. Replace its vehicle identity completely with this subject: {SUBJECT} Create a visibly DRAWN premium automotive illustration with smooth shaded planes, refined clean contour work and stylized highlights, not a photograph. Pearl-silver white paint, graphite windows, charcoal tires, clean silver alloy wheels. Accurate natural curves and coherent perspective. Entire car and both visible wheels fully inside the frame with 6 percent transparent safe padding. Genuine alpha transparency, no environment, no floor or background, no people, captions, watermark or decorative text. Blank registration plate. One car only. Use the correct model's body, lights, grille and proportions, rather than adapting the Fiesta design.
```

**volkswagen-golf-2017-v2.png**

```text
Volkswagen Golf Mk7 five-door hatchback, model year 2017. Use the Golf's unmistakable squared-off C pillar, straight shoulder crease, crisp rectangular twin-element headlights, slim horizontal grille and central VW roundel. It must be recognizable as a Golf, with its own correct compact proportions.
```

**peugeot-208-2016-v2.png**

```text
Peugeot 208 first-generation five-door hatchback, model year 2016. Preserve the 208's curving compact roof, sculpted sides, distinctive swept feline headlights, small rounded floating chrome-trimmed grille and Peugeot lion on the bonnet. Correct first-generation 208 proportions and glazing.
```

**chevrolet-onix-2016-v2.png**

```text
Chevrolet Onix first-generation five-door hatchback, model year 2016. Preserve its rounded compact roof, short hatchback rear, angular swept headlamps, two-part Chevrolet grille with the horizontal body-color bar and central gold bowtie, and its own recognizable side-window shape.
```

### Bases por carrocería

Referencia de estilo: `ford-fiesta-2015-v2.png`. Plantilla:

```text
Use case: stylized-concept. Asset type: a premium drawn vehicle illustration for a maintenance app. Image 1 is a STYLE AND VIEW reference only; do NOT copy its vehicle identity. Draw this subject: {SUBJECT} Style: visibly illustrated automotive concept art with elegant ink contours, smooth simplified shaded planes and hand-drawn highlights. NOT a photograph, NOT photo-textured, NOT low-poly or blocky. Match the reference's pearl-silver white body, graphite windows, charcoal tires, tasteful silver alloy wheels, right-facing front three-quarter view and complete vehicle composition. Genuine transparent alpha background, no floor, no environment, no people, no shadow plane, no badges or logos, blank license plate, no captions or text, no watermark. One vehicle only, both visible wheels fully within the frame with safe transparent padding. Make the entire silhouette coherent and recognizable as the specified body type, even at 350px wide.
```

**body-hatchback-v2.png**

```text
a brand-neutral compact five-door hatchback, with a short rear overhang, a tall single-piece rear hatch, compact rounded roof and two side doors. No resemblance to one particular car brand; use balanced modern proportions.
```

**body-sedan-v2.png**

```text
a brand-neutral four-door sedan, with a clearly separate rear trunk and long rear deck, graceful three-box proportions, a lower roof and a longer wheelbase than a hatchback.
```

**body-suv-v2.png**

```text
a brand-neutral midsize five-door SUV crossover, with a taller roof, upright rear hatch, roof rails, raised ground clearance, broad wheel arches and large wheels. Clearly an SUV rather than a low hatchback.
```

**body-pickup-v2.png**

```text
a brand-neutral four-door double-cab pickup truck, with a visibly separate OPEN CARGO BED behind the cab, raised clearance, rugged tires, broad wheel arches and a strong truck front. Its open rear bed must be unambiguous.
```

**body-wagon-v2.png**

```text
a brand-neutral five-door station wagon (estate car), with an extended low roof reaching all the way to a long upright rear hatch, a clear third side window behind the rear passenger doors, low sedan-like ground clearance and long rear cargo area. Do NOT draw a tall SUV.
```

**body-coupe-v2.png**

```text
a brand-neutral sporty two-door coupe, with a low sweeping fastback roof, long two-door side glass, low stance, muscular but elegant fenders and a short rear deck. Do NOT draw a four-door car.
```

**body-convertible-v2.png**

```text
a brand-neutral two-door convertible sports car with its roof COMPLETELY OPEN and folded out of sight, two visible seats in an open cabin, a slim windshield frame, low stance and elegant short rear deck. It must clearly be an open-top convertible.
```

**body-van-v2.png**

```text
a brand-neutral compact passenger utility van or minivan, with a high boxy roof, near-vertical rear, large sliding side door, broad side windows, short nose and practical tall cabin. Do NOT draw an SUV.
```

