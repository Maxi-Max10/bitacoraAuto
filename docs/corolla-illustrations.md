# Ilustraciones del Toyota Corolla

Modo: generación con **ImageGen integrado**, sin CLI. Los PNG conservan su transparencia y se guardaron en `dist/illustrations/`; los módulos JavaScript de la misma carpeta contienen los contornos para la animación.

| Archivo guardado | Perfil usado en la app |
| --- | --- |
| toyota-corolla-2015-v1.png | Corolla sedán 2014–2016; metadatos en corolla-2014.js |
| toyota-corolla-2018-v1.png | Corolla sedán 2017–2019; metadatos en corolla-2017.js |
| toyota-corolla-2022-v1.png | Corolla sedán 2020–2026; metadatos en corolla-2020.js |

Son ilustraciones de referencia de la generación. Acabados, versiones regionales y años de transición pueden tener diferencias. Corolla Cross, hatchback y rural no reciben la ilustración del sedán. Las variantes «corrolla», «corrola» y «corola» se reconocen únicamente dentro de Toyota; no se aplica una comparación difusa a todos los modelos.

Antes de completar el año se muestra un esquema y se pide ese dato. Si no existe una ilustración del modelo/año, se conserva el esquema con una etiqueta explícita. Las antiguas imágenes genéricas por carrocería dejaron de funcionar como reemplazo automático, porque podían parecer un Fiesta al cargar otro modelo.

## Referencias de identidad

Las fotografías y el folleto se usaron solo como referencia para redibujar el vehículo. No se distribuyen como imágenes de la aplicación.

- 2014–2016: fotografía de prensa del Corolla internacional, publicada en la [galería de 2014 de AutomobilesReview](https://www.automobilesreview.com/pictures/toyota/2014-corolla/wallpaper-01.html). El diseño se contrastó con [Toyota Europe: Corolla 2013, Design](https://newsroom.toyota.eu/2019-2013-the-new-toyota-corolla-dpl-design/).
- 2017–2019: [Toyota Global: Corolla de undécima generación, imagen europea de 2016](https://global.toyota/en/download/25167145/).
- 2020–2026: portada del [catálogo oficial regional del Corolla 2020 de Toyota Paraguay](https://www.toyota.com.py/pdf/corolla.pdf).

En las tres llamadas, la segunda referencia fue `ford-fiesta-2015-v2.png` exclusivamente para mantener el estilo de ilustración de la app. La identidad, carrocería y frente parten de la referencia del Corolla.

## Prompts finales

Parámetro común: `transparent_background: true`. Una llamada por recurso, dos referencias con sus roles descritos en el prompt.

### toyota-corolla-2015-v1.png

```text
Use case: stylized-concept. Create one premium DIGITAL DRAWING of the Toyota Corolla sedan sold in Argentina, model year 2015, E170/E180 international PRE-FACELIFT. Image 1 is the identity reference: preserve this exact generation's broad angular headlamp units, three chrome upper grille bars meeting the Toyota badge, trapezoidal lower grille, round foglamps in individual black housings, long four-door sedan body and separate trunk. Image 2 is STYLE ONLY from the app's illustration series: match the silver-white paint, graphite windows, refined clean contours and smooth drawn shading; DO NOT copy its Fiesta body, wheel placement or proportions. Pose: front three-quarter view facing RIGHT with the left side visible, entire car and both wheels within frame. It must look like the Corolla in image 1, not a hatchback, later facelift, American Corolla S or another Toyota. Visibly illustrated automotive art with crisp ink-like contour lines and simplified polished shaded planes, no photographic texture, redraw EVERY surface, not a photo or photo cutout. Genuine transparent background, no showroom, road, floor, scene, people or shadow plane. Pearl-silver white body, charcoal tires, tasteful silver alloy wheels, small correct Toyota oval. Blank license plate, no captions, no watermark, ample safe transparent padding.
```

### toyota-corolla-2018-v1.png

```text
Use case: stylized-concept. Create one premium DIGITAL DRAWING of the Toyota Corolla sedan sold in Argentina, model year 2018, E170/E180 facelift. Image 1 is the official Toyota identity reference: preserve its recognisable narrow sharp headlights, slim chrome upper grille meeting the Toyota badge, wide horizontal lower grille, two round foglamps, long four-door sedan body, separate trunk and correct side windows. Image 2 is STYLE ONLY from the app's illustration series: match the silver-white paint, graphite windows, refined clean contours and smooth drawn shading; DO NOT copy its Fiesta body, wheels placement or proportions. Pose: front three-quarter view facing RIGHT with the left side visible, entire car and both wheels within frame. Make it recognisably a Corolla sedan of this generation, not a hatchback, SUV, American Corolla S or another Toyota. Visibly illustrated automotive art with crisp ink-like contour lines and simplified polished shaded planes, no photographic texture, redraw EVERY surface, not a photo or photo cutout. Genuine transparent background, no road, floor, scene, motion blur, people or shadow plane. Pearl-silver white body, charcoal tires, tasteful silver alloy wheels, small correct Toyota oval. Blank license plate, no captions, no watermark, ample safe transparent padding.
```

### toyota-corolla-2022-v1.png

```text
Use case: stylized-concept. Create one premium DIGITAL DRAWING of the Toyota Corolla sedan sold in Argentina, model year 2022, E210 twelfth generation. Image 1 is an official regional Toyota brochure and is the IDENTITY reference ONLY: draw the single large white sedan on the RIGHT side of that brochure, preserving its distinctive narrow J-shaped headlights, slim wing-like upper grille meeting the Toyota oval, large trapezoidal black lower grille, elegant four-door sedan body and separate rear trunk. Do not reproduce any brochure text, tables, other cars, road or background. Image 2 is STYLE ONLY from the app's series: match its silver-white paint, graphite windows, refined clean contours and smooth drawn shading; DO NOT copy its Fiesta hatchback body or proportions. Pose: front three-quarter view facing RIGHT with the left side visible, entire car and both wheels fully within frame. The vehicle must be recognisably the E210 Corolla SEDAN from image 1, not a hatchback, Corolla Cross, Camry, sporty US SE version, or any Ford. Visibly illustrated automotive art with crisp ink-like contour lines and simplified polished shaded planes, no photographic texture, redraw EVERY surface, not a photograph or photo cutout. Genuine transparent background, no road, floor, scenery, people or shadow plane. Pearl-silver white body, charcoal tires, clean silver alloy wheels, small correct Toyota oval. Blank license plate, no captions, no watermark, ample safe transparent padding.
```

