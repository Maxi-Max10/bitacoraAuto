# Verificación del historial compartido y la interfaz

Fecha: 6 de noviembre de 2026.

## Navegadores y tamaños

Se ejecutaron pruebas automatizadas de la interfaz en Chrome 156, Edge 156, Firefox 157 y WebKit 27.2. WebKit valida el motor usado por Safari; no equivale a una prueba en un dispositivo físico con Safari para iOS/macOS.

Se revisaron anchos de 320, 390, 620, 768, 1024, 1440 y 1920 píxeles para garage, historial, datos del vehículo, adjuntos y sus formularios. El historial público, el detalle de solo lectura, el acceso y el registro se comprobaron también en celular, tablet y escritorio. No hubo errores JavaScript ni desbordes horizontales en esas pruebas.

Las flechas tipográficas se reemplazaron por SVG; los selectores utilizan la misma flecha. Se corrigieron desbordes por importes, notas y nombres de archivos largos. Los formularios contemplan tamaños nativos de fecha y hora, zoom de campos en móviles y el espacio de navegación inferior.

## Flujo real

La prueba de navegador completó 33 comprobaciones con dos cuentas sintéticas, tres vehículos y un adjunto de 6 MB. Al terminar se eliminaron únicamente esas cuentas y sus archivos.

- Registro, sesión, varios vehículos, cierre de sesión y cambio de cuenta.
- Importación del historial anterior sin borrar el original del navegador.
- Subida privada, descarga binaria exacta y copia completa con adjuntos.
- Aislamiento entre cuentas y vehículos, rechazo de escrituras desde otro origen y control de versiones.
- Generación y copia real del enlace público; consulta desde un navegador sin sesión.
- Ausencia de patente, datos de la cuenta y controles de edición en la vista pública.
- Rechazo de POST, PUT y DELETE en la ruta pública.
- Adjuntos privados por defecto y descarga anónima únicamente al incluirlos expresamente.
- Renovación que invalida el enlace anterior; revocación que invalida el historial y sus descargas.
- Mensaje de enlace no disponible después de revocarlo.

La suite de PostgreSQL verifica además que la base almacene solo el hash del token, que el enlace refleje cambios del historial y que eliminar un vehículo invalide su enlace. Las pruebas se encuentran en `tests/garage.integration.test.js` y `tests/shares.test.js`.

## Uso

En el historial del vehículo: **Compartir historial → Generar enlace → Copiar**. El titular puede incluir fotos y comprobantes o elegir **Revocar enlace**. Si genera un enlace nuevo, el anterior deja de funcionar. La patente y los otros vehículos no se comparten; el contenido de notas y adjuntos elegidos forma parte del historial visible.

## Buscador del historial

Se amplió la búsqueda de ambas vistas con un campo visible a todo el ancho, etiqueta, instrucciones, contador accesible y botón para borrar de 44 píxeles. Los filtros se acomodan en varias filas en pantallas pequeñas. El campo mantiene 16 píxeles en móviles y tablets para evitar el zoom al enfocarlo.

Se comprobaron búsquedas de varias palabras entre campos, fechas locales, fechas con nombre de mes, kilómetros con separador de miles y nombres de adjuntos. También se verificaron Escape, el botón de borrado, conservación del foco y combinación con categorías y orden. La búsqueda pública recibe solo los adjuntos autorizados para ese enlace.

Las mismas pruebas de búsqueda se ejecutaron en los cuatro motores indicados arriba y en los tamaños de celular, tablet y escritorio, sin desbordes ni errores JavaScript. La suite de lógica incluye una prueba de regresión de estos casos en `tests/core.test.js`.
