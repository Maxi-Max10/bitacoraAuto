# Bitácora

Aplicación web en español para guardar el historial de mantenimiento de un auto.

## Abrir localmente

Desde esta carpeta, ejecutar `npm start` y abrir http://127.0.0.1:4173.
Requiere Python 3. No necesita instalar dependencias ni compilar.

## Funciones

- Datos del auto: marca, modelo, año, patente y kilometraje actual.
- Registro, edición y eliminación de trabajos con fecha y hora local, kilómetros, categoría, costo opcional en ARS, taller y notas.
- Hasta 10 adjuntos por trabajo, de hasta 15 MB cada uno, almacenados como archivos originales en IndexedDB.
- Historial con búsqueda sin acentos, filtros y orden por fecha o kilometraje.
- Galería de adjuntos con descarga de los archivos originales.
- Exportación y restauración de una copia JSON que incluye todos los archivos. Límite de importación: 200 MB.
- Modo de ejemplo separado de los datos personales. Se descarta al recargar o salir del ejemplo.
- Diseño adaptable a celular y teclado, diálogos accesibles y mensajes de error de guardado.

## Almacenamiento

Los datos se guardan en IndexedDB del navegador y del origen donde se abre la app. No hay sincronización con otros dispositivos ni servidor de datos. Borrar los datos de sitios o usar navegación privada puede perder el historial; descargar copias periódicas desde **Copia de seguridad**. Una copia descargada puede restaurarse en otra instalación, navegador o dispositivo. El guardado usa transacciones y solo reemplaza el estado visible tras completarse correctamente.

## Verificación

`npm test` comprueba validación de fechas y kilometraje, copia/restauración de archivos, datos corruptos y búsquedas. `npm run check` verifica la sintaxis de los módulos JavaScript.

La fuente opcional usa Google Fonts; con conexión limitada la interfaz usa las fuentes sans-serif del sistema. El resto de la aplicación no depende de servicios externos.
