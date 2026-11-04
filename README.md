# Bitácora

Garage personal con cuentas de usuario, varios vehículos por cuenta e historiales de mantenimiento separados.

Producción: https://bitacoraauto.vercel.app

## Funciones

- Crear una cuenta con email y contraseña, iniciar y cerrar sesión.
- Agregar autos, motos, pickups, SUV, utilitarios, camiones, colectivos, motorhomes, embarcaciones, bicicletas y otros vehículos.
- Elegir un vehículo activo y consultar sus datos, trabajos, costos y adjuntos.
- Datos e historiales privados por cuenta. El servidor comprueba la sesión y la propiedad del vehículo en cada operación.
- Hasta 10 adjuntos de 15 MB por trabajo. Los originales se guardan en un almacén privado y se descargan mediante una ruta autenticada.
- Copia JSON del vehículo seleccionado, con sus archivos completos. Importar una copia agrega un vehículo nuevo y conserva los demás.
- Importación explícita del historial de la versión anterior guardado en IndexedDB. Los datos originales del navegador no se eliminan.
- Control de versión por vehículo: si cambió en otra pestaña o dispositivo, el servidor rechaza el guardado anterior para evitar sobrescribirlo.
- Dibujo SVG animado según tipo de vehículo y perfiles de modelos disponibles. Los modelos sin dibujo propio se identifican como «Base genérica».

## Arquitectura

La interfaz está en `dist/`, con módulos JavaScript y CSS. `src/cloud.js` se empaqueta en `dist/cloud.js` durante la compilación.

`api/index.js` es la entrada de la API de Vercel. Better Auth administra usuarios, contraseñas, cookies de sesión y límites de intentos. PostgreSQL Neon almacena cuentas, sesiones, vehículos, registros y metadatos de archivos. Vercel Blob guarda los adjuntos de forma privada.

El esquema de `server/schema.sql` usa claves foráneas de vehículo y usuario para conservar la relación de propiedad. Las consultas reciben siempre el usuario de la sesión; nunca confían en un identificador de usuario enviado por el navegador.

Las rutas de escritura validan el origen de la solicitud. Los identificadores de archivos se comprueban contra su usuario y vehículo antes de emitir permisos de subida o guardarlos en un registro. No se exponen credenciales al navegador.

## Desarrollo local

Requiere Node.js 24.

1. Ejecutar `npm ci`.
2. Vincular la carpeta al proyecto Vercel correcto y obtener sus variables de desarrollo en `.env.local`. `.env.example` enumera los nombres necesarios; no contiene credenciales.
3. Usar `BETTER_AUTH_URL=http://localhost:4260` para desarrollo.
4. Ejecutar `npm run db:migrate` una vez al preparar una base.
5. Ejecutar `npm run dev` y abrir http://localhost:4260.

No subir `.env.local`, credenciales ni la carpeta `.vercel` a GitHub. Producción y desarrollo tienen claves de sesión distintas.

## Verificación

- `npm test`: validaciones, copias, dibujos y compatibilidad de datos anteriores.
- `node --env-file=.env.local --test --test-isolation=none tests/garage.integration.test.js`: prueba real de dos cuentas, aislamiento de vehículos y control de concurrencia. Crea únicamente cuentas sintéticas con dominio `example.invalid` y las elimina al terminar.
- `npm run build`: verificación sintáctica y empaquetado del cliente.

En cada compilación de producción en Vercel se ejecutan las migraciones idempotentes. Las migraciones de autenticación rechazan cambios que no se pueden aplicar de forma segura.

El guardado de un vehículo admite hasta 5.000 registros y 2,5 MB de metadatos por operación; los archivos se transfieren por separado a Blob. La restauración conserva el límite de 200 MB de la copia local.

## Publicación

`main` de `Maxi-Max10/bitacoraAuto` está conectado al proyecto `bitacoraauto` de Vercel. Los cambios enviados a esa rama se publican automáticamente. `vercel.json` configura la instalación, compilación, salida estática y funciones en la región de São Paulo, cerca de la base de datos.

Las cuentas nuevas empiezan con un garage vacío. Los usuarios anteriores deben crear su cuenta y elegir **Sumarlo a mi cuenta** para importar el vehículo de ese navegador.
