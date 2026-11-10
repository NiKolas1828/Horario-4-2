# Mi Turno 4×2

Calendario interactivo para consultar los turnos de un ciclo **4×2**:

- 2 días de turno diurno (06:00 – 18:00)
- 2 días de turno nocturno (18:00 – 06:00)
- 2 días de descanso

El ciclo se repite cada 6 días. La fecha de inicio configurada por defecto es el
**31 de octubre de 2026**, el día en que comenzó el primer turno de noche.

## Cómo ejecutarlo

```bash
npm install
npm run dev
```

Abre la dirección que muestra Vite (normalmente `http://localhost:5173`).

Para generar la versión estática:

```bash
npm run build
npm run preview
```

## Qué incluye

- Calendario mensual con navegación entre meses y botón **Hoy**.
- Colores e iconos distintos para día, noche y descanso.
- Resumen del mes: cantidad de días, noches, libres y horas de trabajo.
- Filtro por tipo de turno tocando las tarjetas del resumen.
- Detalle del día seleccionado: horario, posición dentro del ciclo y siguiente turno.
- Panel **Ahora mismo** que indica si estás en jornada o de descanso, con reloj en vivo.
- Lista de los próximos 7 días.
- Configuración de la fecha de inicio del ciclo, guardada en `localStorage`.

## Desplegar en Vercel

La app es completamente estática: no necesita backend, base de datos ni variables
de entorno. Vercel puede construirla con `npm run build` y publicar la carpeta
`dist`.

### Opción A: desde GitHub (recomendada)

1. Crea un repositorio en GitHub y sube esta carpeta.
2. Entra a [vercel.com](https://vercel.com), inicia sesión y elige **Add New → Project**.
3. Importa el repositorio.
4. Vercel detectará Vite automáticamente. Verifica:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Pulsa **Deploy**.

Cada vez que hagas `git push`, Vercel volverá a desplegar la app.

### Opción B: desde la terminal

```bash
npx vercel
npx vercel --prod
```

La primera vez te pedirá iniciar sesión. Acepta las opciones que detecta
automáticamente (Vite, `npm run build`, `dist`).

### Notas útiles

- La URL gratuita será algo como `https://mi-turno-4x2.vercel.app`.
- El plan **Hobby** de Vercel es gratuito; para un uso interno de empresa conviene
  revisar sus condiciones y, si corresponde, usar el plan Pro.
- La app no tiene autenticación. Cualquiera con la URL puede verla. Si necesitas
  restringir el acceso, puedes usar la protección por contraseña de Vercel
  (planes pagos) o ponerla detrás de Cloudflare Access.
- La fecha de inicio del ciclo se guarda en el `localStorage` de cada navegador.
  Si tus compañeros tienen el mismo ciclo, verán lo mismo; si alguno tiene otro
  inicio de turno, puede cambiarlo en **Ciclo y configuración** sin afectar a los
  demás.
- Para actualizar la fecha por defecto para todos, cambia `DEFAULT_ANCHOR` en
  `src/App.jsx` y vuelve a desplegar.

## Cómo se calcula

La fecha ancla representa el primer día de noche. A partir de ahí:

```
noche · noche · descanso · descanso · día · día
```

La app calcula la diferencia en días entre cualquier fecha y el ancla, aplica
módulo 6 y obtiene el turno correspondiente. Así funciona también hacia atrás en
el tiempo y no se ve afectado por cambios de horario de verano.

> El turno de noche se marca en el día en que **empieza** (a las 18:00) y termina
> al día siguiente a las 06:00. Por eso, de madrugada, el panel “Ahora mismo”
> puede indicar que sigues en la noche del día anterior aunque el calendario ya
> muestre el día siguiente.

## Estructura

```
index.html
src/
  main.jsx
  App.jsx
  index.css
  lib/schedule.js        # lógica del ciclo y fechas
  components/
    Calendar.jsx         # calendario mensual
    Sidebar.jsx          # resumen, detalle, próximos días y configuración
    Icons.jsx            # iconos SVG
```
