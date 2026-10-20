# QA responsive — plan de corrección

Fecha de la auditoría: 2026-10-20 · Commit auditado: `3b12b35`

Este documento lo lee el agente que implementa las correcciones. Cada tarea trae el problema, la evidencia, la causa localizada, el cambio propuesto y cómo saber que está resuelta.

---

## 1. Método

- Export estático (`npm run build`), servido en local y recorrido con Chromium (Playwright). En cada viewport se baja 0,8 pantallas cada vez: se hace captura y se pasan comprobaciones automáticas (overflow, texto recortado, texto < 11 px, targets < 24 px, errores de consola o de red).
- **16 viewports**: 320x568, 360x740, 375x667, 390x844, 430x932, 667x375, 844x390, 768x1024, 820x1180, 1024x768, 1024x1366, 1280x720, 1366x768, 1440x900, 1920x1080 y 2560x1440. Hasta 1024 se emulan como táctiles.
- Variantes: `/en/` (textos más largos), `prefers-reduced-motion: reduce` y navegación solo con teclado (Tab).
- Revisión visual de unas 650 capturas. Los hallazgos altos y medios se confirmaron a mano.

**Estado base:** typecheck, lint, 159 tests, formato y build en verde. Cero errores de consola y de red. EN no añade problemas propios.

Script reutilizable: `scripts/qa/responsive-audit.mjs` (ver §5).

---

## 2. Resumen

| ID  | Problema                                                                  | Sev.  | Dónde                    |
| --- | ------------------------------------------------------------------------- | ----- | ------------------------ |
| R1  | `npm ci` falla: lockfile desincronizado                                   | Alta  | Repo / CI                |
| R2  | Visión en móvil apaisado: ilustraciones a 0 px y texto bajo el dock       | Alta  | 667x375, 844x390         |
| R3  | Bloque "El producto hoy" más ancho que la pantalla                        | Alta  | 320 px                   |
| R4  | El foco de teclado queda tapado por el dock inferior                      | Alta  | < 60rem                  |
| R5  | Foco en enlaces invisibles de las fichas cerradas del equipo              | Alta  | ≥ 60rem                  |
| R6  | Edge: titular + equipo no caben en pantallas bajas                        | Media | 1280x720, 1366x768, apaisado, 320 |
| R7  | "Empezamos por el agua" se sale del margen lateral                        | Media | Todos                    |
| R8  | Ilustraciones de sectores gigantes y cortadas en tablet vertical grande   | Media | 1024x1366 (y 768/820)    |
| R9  | Qué hacemos en tablet vertical: líneas de ~100 caracteres y 40 % vacío    | Media | 768–959 px               |
| R10 | Etiquetas del plano de Building a 3,5–4,5 px                              | Media | < 48rem                  |
| R11 | Equipo a 960–1100 px: fichas cerradas de ~137 px, nombres en 3 líneas     | Media | 1024x768, 1024x1366      |
| R12 | Huecos de 250–450 px al entrar en secciones (intros con scroll)           | Media | Todos, más en móvil alto |
| R13 | Columna "Alarma" de la tabla, una palabra por línea                       | Baja  | ≤ 390 px                 |
| R14 | Equipo en tablet vertical: foto escalonada respecto a su ficha            | Baja  | 640–959 px               |
| R15 | Targets táctiles pequeños (Ficha técnica, ES/EN, enlaces sueltos)         | Baja  | Varios                   |
| R16 | Tarjeta huérfana en "Por qué el agua"                                     | Baja  | 768 px                   |
| R17 | Pulidos sin confirmar a mano (ver tarea)                                  | Baja  | Escritorio               |

Las decisiones de diseño y contenido no corresponden al implementador: están en §4.

---

## 3. Plan por fases

Orden: **Fase 1 → 2 → 3**. Un commit por tarea o por grupo pequeño. Antes de cada push, `npm run check` en verde.

### Fase 1 — Roto (P0)

#### R1. Lockfile desincronizado

- **Evidencia:** `npm ci` → `Missing: @emnapi/runtime@1.11.3 from lock file`. Cualquier CI o despliegue con `npm ci` falla.
- **Cambio:** `npm install` para regenerar `package-lock.json`, sin cambiar versiones de `package.json`. Commit aislado.
- **Aceptación:** `rm -rf node_modules && npm ci` termina bien y `npm run check` pasa.

#### R2. Escenas de Visión (ScrollScene) en pantallas bajas

- **Evidencia:** en 667x375 y 844x390, las dos escenas fijadas al scroll de Visión ("Hacia dónde vamos" y "Empezamos por el agua") no muestran ninguna ilustración: el dibujo de cada sector queda en una mota de 2–3 px. Las descripciones de "Hoy", "En construcción" y "Dirección" quedan medio tapadas por el dock durante más de 300 px de scroll. Con reduced motion, la versión estática sí se ve bien.
- **Causa:** `ScrollScene` fija el escenario a `100svh` y solo pasa a estático con reduced motion (`src/components/storytelling/ScrollScene/ScrollScene.tsx:130`). `ChoreographedScene` ya cae a estático también con `(max-height: 36rem)` (`ChoreographedScene.module.css:57`). En `VisionScenes.module.css`, la fila del dibujo es `minmax(0, 1fr)` y, tras restar la barra superior, el título y `--pad-bottom` (`--space-24` por debajo de 60rem), se queda en ~0.
- **Cambio:**
  1. En `ScrollScene`, activar `data-static` también cuando `matchMedia("(max-height: 36rem)")` coincide (mismo umbral que `ChoreographedScene`).
  2. Escuchar el `change` de esa media query para cubrir la rotación del móvil: al pasar a estático, quitar el tracking y fijar progress a 1; al volver, quitar `data-static` y reanudar el tracking.
  3. No hace falta tocar `VisionScenes.module.css`: sus reglas `[data-static]` ya dan el layout correcto.
- **Tests:** ampliar `ScrollScene.test.tsx` mockeando `matchMedia` (estático con altura baja y vuelta al modo animado al cambiar).
- **Aceptación:** en 667x375 y 844x390 se ven todas las ilustraciones de las dos escenas y ningún texto queda bajo el dock. En 390x844 y 1280x720 el comportamiento no cambia. 320x568 (568 px < 576 px) también pasa a estático, igual que ya hace `ChoreographedScene`: es lo esperado.

#### R3. "El producto hoy" se sale a 320 px

- **Evidencia:** 320x568, `#building`. La tabla "Estación de bombeo, ejemplo ilustrativo" y el texto que la rodea llegan hasta x = 321: falta el borde derecho y el margen derecho es 0. A 360 px está bien.
- **Causa:** `.product` y `.productTop` (`src/sections/Building/shared.module.css:2` y `:9`) son grids sin columnas por debajo de 60rem. La columna implícita (`auto`) toma el min-content de la tabla.
- **Cambio:** `grid-template-columns: minmax(0, 1fr)` en `.product` y en `.productTop` (la regla de ≥ 60rem ya la sobrescribe). Comprobar que la tabla cabe; si no, ver R13.
- **Aceptación:** overflow horizontal 0 a 320 px (el script de §5 informa `overflow 0px`), con borde derecho de la tabla visible.

#### R4. Foco tapado por el dock inferior (< 60rem)

- **Evidencia:** con Tab, a 390x844 "Solicitar demo" recibe el foco bajo el dock. En 844x390 pasa lo mismo con los chips de contacto ("Investigación o universidad", "Partnerships", "Inversión"). Incumple WCAG 2.4.11.
- **Causa:** no hay `scroll-padding-bottom`. El navegador desplaza el foco hasta el borde inferior del viewport, que es justo donde está el dock (`FloatingSectionNav`).
- **Cambio:** en `src/styles/base.css`, por debajo de 60rem, `html { scroll-padding-bottom: <alto del dock + margen>; }`. Usar los tokens de `FloatingSectionNav` (`--nav-item` más paddings), o exponer uno nuevo si no existe. **No** añadir `scroll-padding-top`: el comentario de `base.css:12` explica que se sumaría a `scroll-margin-top`.
- **Aceptación:** recorriendo la página con Tab a 390x844 y a 844x390, ningún elemento enfocado queda bajo el dock.

#### R5. Enlaces invisibles enfocables en el equipo (≥ 60rem)

- **Evidencia:** a 1280x720, Tab llega a "LinkedIn de David Palazón Palau" mientras su ficha está cerrada: el foco cae en algo recortado e invisible, bajo el botón de nombre.
- **Causa:** a ≥ 60rem, las fichas cerradas se ocultan con `overflow-x: clip` (`TeamGallery.module.css`, bloque `@media (min-width: 60rem) and (scripting: enabled)`), pero su contenido sigue en el orden de tabulación.
- **Cambio:** en ese bloque, que la `.sheet` de una ficha cerrada no se pueda enfocar: `visibility: hidden` con `transition: visibility 0s var(--move)` al cerrar y sin retardo al abrir, o bien `inert` desde el componente. En < 60rem las fichas siempre están visibles: no tocar.
- **Aceptación:** a 1280x720 y 1440x900, Tab solo pasa por los botones de nombre y por el contenido de la ficha abierta. El test de `TeamGallery` cubre que la ficha cerrada no es enfocable.

### Fase 2 — Feo o incómodo (P1)

#### R6. Edge: la composición no cabe en pantallas bajas

- **Evidencia:**
  - 1280x720 y 1366x768: el titular, el equipo e "instalado en la planta." ocupan unos 850 px y nunca caben enteros.
  - 667x375 y 844x390: el equipo ocupa casi todo el alto y "Todo el software" queda bajo la barra superior.
  - 320 px: el equipo cruza 3 de las 5 líneas.
  - El solape texto/equipo es **intencionado** (copia del texto en color papel, enmascarada por el equipo). Lo que falla es la escala, no el solape.
- **Causa:** `--device-w` (`EdgeShowcase.module.css:26`) y el `font-size` de `.title, .type` (`:47`) dependen solo de `vw`.
- **Cambio:** añadir un tope en `svh` a los dos, por ejemplo:
  - `--device-w: clamp(11rem, min(8rem + 30vw, 60svh), 34rem)`;
  - `font-size: clamp(2.25rem, min(0.4rem + 6.6vw, 12svh), 7.5rem)`.
  - Ajustar los factores hasta cumplir la aceptación. `.type` comparte la regla, así que la máscara sigue alineada.
- **Aceptación:** en 1280x720, 1366x768, 844x390 y 667x375 hay un punto del scroll en el que titular y equipo se ven completos entre la barra superior y el dock. En 1440x900 y 1920x1080 el resultado es igual al actual (comparar capturas). A 320 px, el equipo cruza 2 líneas como máximo.

#### R7. El titular del carrusel de sectores se sale del margen

- **Evidencia:** en todos los viewports, "Empezamos por el agua" pasa del margen (20–50 px) a x ≈ 0–12 px mientras avanza el carrusel. A 1024x768 la "E" toca el borde.
- **Causa:** `ParallaxLayer` del titular con `x={["0vw", "-4vw"]}` (`src/sections/Vision/SectorsScene.tsx:60`). El desplazamiento se come el gutter.
- **Cambio:** quitar el `x` del titular. El parallax lo mantiene la capa `grid` (línea 57).
- **Aceptación:** durante toda la escena, el borde izquierdo del titular coincide con el gutter de la página.

#### R8. Ilustraciones de sectores en tablet vertical

- **Evidencia:** a 1024x1366 cada ilustración mide ~1000 px, sale cortada por los bordes y deja ~450 px vacíos bajo el titular. A 768 y 820 la ilustración activa se corta por la derecha.
- **Causa:** a ≥ 60rem, `.panelDrawing` toma `height: 100%` de la fila y el ancho sale del 5:4. En vertical la fila es muy alta.
- **Cambio:** a ≥ 60rem, limitar también por ancho: `height: min(100%, calc((100vw - 2 * var(--gutter)) * 0.8))` (0,8 = 4/5). Rehacer la captura de 768 y 820 tras R2 y R7; si el corte sigue, aplicar la misma idea por debajo de 60rem.
- **Aceptación:** a 1024x1366, 820x1180 y 768x1024 la ilustración activa se ve entera dentro del panel.

#### R9. Qué hacemos en tablet vertical (48rem–59.99rem)

- **Evidencia:** a 820x1180 el texto del paso 01 va en una sola línea de ~108 caracteres (~95 a 768). En los pasos 01–05, el 35–40 % inferior de la pantalla queda vacío.
- **Causa:** `.stepBody` (`src/sections/Capabilities/Capabilities.module.css:99`) no tiene medida máxima. La composición apilada de este tramo deja la gráfica arriba y nada abajo.
- **Cambio:**
  - `max-width: var(--measure-text)` en `.stepBody` (el token existe, 62ch).
  - En 48–59.99rem, centrar en vertical el bloque gráfica + pasos dentro del escenario, sin cambiar la coreografía ni la longitud de scroll.
- **Aceptación:** ≤ 75 caracteres por línea a 768 y 820. Ningún paso deja una franja vacía de más del 25 % del alto.

#### R10. Etiquetas ilegibles en el plano de Building (< 48rem)

- **Evidencia:** las etiquetas de nodo del grafo (`NodeLabels`, `.label` con `font-size: calc(var(--w) * 0.0125)` en `Building.module.css:207`) se calculan a 3,5 px a 320 y a 4,2 px a 375. El texto SVG del plano (`plan.module.css`, 8–9,5 px en un viewBox de 640) acaba en ~4 px.
- **Cambio:** por debajo de 48rem, poner un suelo legible al tamaño renderizado (≥ 9 px reales), con `max(...)` en `.label` y en los textos SVG. Si el plano se satura con ese tamaño, mostrar en móvil solo las etiquetas de nodo y ocultar las de zona o equipo, que no son esenciales. Que no se solapen entre sí.
- **Aceptación:** el script de §5 no informa `tiny-text` en `#building` a 375 px. Captura revisada sin solapes de etiquetas.

#### R11. Galería del equipo a 960–1100 px

- **Evidencia:** a 1024 px, las fichas cerradas (David, Jorge) miden ~137 px. Los nombres ocupan 3 líneas y "CTO Y DESARROLLO DE IA" otras 3.
- **Causa:** a ≥ 60rem, el `--sheet-w` y el retrato de la ficha abierta dejan poco ancho a las cerradas.
- **Cambio** (elegir el menor que funcione):
  - empezar la galería horizontal en 64rem en vez de 60rem (la media query aparece en `TeamGallery.module.css:232`, `:252` y `:335`);
  - o reducir `--sheet-w` y `--row-h` entre 60 y 75rem.
- **Aceptación:** a 1024x768, los nombres de las fichas cerradas ocupan como máximo 2 líneas.

#### R12. Huecos al entrar en secciones

- **Evidencia:** en todos los viewports quedan 250–450 px vacíos al entrar en Qué hacemos, Qué estamos construyendo y Quiénes somos (más en 390x844 y 430x932). Entre "Influencias" y "El producto hoy" quedan 360–670 px de fondo oscuro vacío a 1024.
- **Alcance:** solo investigar y hacer ajustes de espaciado (`--intro-top`, `--intro-bottom` y el padding final de escenas en `SectionIntro.module.css`). **No** cambiar `length` ni el timing de los cues sin el visto bueno del propietario (ver D4).
- **Aceptación:** ninguna captura (paso de 0,8 pantallas) es una pantalla entera sin contenido legible.

### Fase 3 — Pulido (P2)

- **R13. Columna "Alarma".** A ≤ 390 px, "Dentro de límites" va en 3 líneas y "Sin alarma" en 2. Por debajo de 30rem, reducir el `padding-inline` de las celdas de `.exampleTable` o apilar la alarma bajo el nombre de la señal. Aceptación: máximo 2 líneas por celda a 375.
- **R14. Foto escalonada (640–959 px).** `TeamGallery.module.css:235` usa `align-items: end`, así que la foto empieza ~120 px por debajo de "PERFIL". Cambiar a `start`.
- **R15. Targets pequeños.**
  - `.spec summary` ("Ficha técnica", 18 px de alto, `shared.module.css:264`): `min-height: 44px` con `@media (pointer: coarse)`. Revisar también los ~70 px vacíos que deja debajo cuando está plegada.
  - ES/EN (16 px de ancho): con `pointer: coarse`, que cada opción mida al menos 44 px de ancho (iPad a 1024 px); con ratón, al menos 24 px.
  - Enlaces sueltos (LinkedIn, 19 px; correos de Contacto y footer, 22 px; fuentes "iAgua…", 14 px): `padding-block` para llegar a 24 px sin mover el layout.
- **R16. Tarjeta huérfana.** A 768 px, "Por qué el agua" pasa a 2 columnas y "ES-ISAC Aguas" se queda sola, seguida de ~350 px vacíos. Hacer que entren 3 columnas desde 48rem o usar 1 columna.
- **R17. Por confirmar con capturas propias antes de tocar nada.**
  - Un punto azul de 1x2 px se queda en la nav tras "Equipo" al llegar a Contacto (1280, 1366).
  - El contorno de la "A" del hero toca "para" a 1280x720.
  - En el diagrama de red OT, "Historizador" y "ATLAXIA" tocan el borde de su caja a 430 px.
  - A 1280x720, el correo de Contacto queda a 11 px del borde inferior.

---

## 4. Decisiones del propietario (no implementar sin respuesta)

| ID  | Tema                                                                                                                                                                         | Opciones                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| D1  | La franja superior de marca sigue clara sobre las secciones oscuras (Building, Contacto). En apaisado, franja + dock se comen el ~38 % del alto útil.                          | Variante oscura sobre `[data-surface="dark"]` · ocultar el dock al bajar en pantallas bajas · dejarlo |
| D2  | El primer fotograma de "Hacia dónde vamos" es una esfera gris sola, que se lee como el "orbe" que la guía visual prohíbe.                                                    | Arrancar la animación más tarde · añadir etiqueta · dejarlo                                       |
| D3  | El footer muestra en público "Pendiente · Datos legales pendientes de completar".                                                                                             | Aportar los datos legales                                                                         |
| D4  | Longitud de las escenas con scroll: en tablet vertical, Qué hacemos mide ~8.400 px y Building ~10.000 px (en móvil, ~3.200 px).                                              | Aceptar · acortar `length` por tramo                                                             |
| D5  | Edge en móvil: el solape titular/equipo es legible pero exigente a 320–390 px.                                                                                              | Mantener con la escala de R6 · apilar titular y equipo en < 30rem                                 |

---

## 5. Verificación

```bash
npm ci && npm run check                      # base en verde
npx serve out -l 4173                        # o: python3 -m http.server 4173 -d out
npm i --no-save playwright-core
node scripts/qa/responsive-audit.mjs                  # 16 viewports, ES y EN
REDUCED=1 ONLY=390x844,844x390,1280x720 node scripts/qa/responsive-audit.mjs
SHOTS=1 ONLY=320x568,844x390 PATHS=/ node scripts/qa/responsive-audit.mjs   # capturas
```

- Salida en `scripts/qa/out/` (ignorado por git). Con `CHROMIUM=<ruta>` se usa un Chromium ya instalado.
- Falsos positivos conocidos del script:
  - `tap-small` en enlaces dentro de una frase: WCAG los exime.
  - Los textos `.visually-hidden` ya se filtran.
- R4 y R5 se verifican recorriendo la página con Tab y mirando el elemento enfocado.

**Criterio global de cierre:** `npm run check` en verde, overflow 0 en los 16 viewports, ningún hallazgo alto abierto y capturas de 320x568, 390x844, 844x390, 768x1024, 1024x1366 y 1280x720 revisadas a ojo tras los cambios.

## 6. Reglas para el implementador

- Solo lo que pide cada tarea. Nada de refactors de paso.
- No cambiar copy, hechos ni la coreografía (cues, `length`) salvo donde la tarea lo diga.
- Respetar tokens, `prefers-reduced-motion` y la versión sin JavaScript (`scripting: none`).
- Tocar un componente reutilizable (`ScrollScene`, `TeamGallery`) implica actualizar su test y, si cambia de comportamiento, su story.
- Si una tarea choca con una decisión de §4, parar y anotarla en vez de decidir.

---

## 7. Estado tras la corrección

Rama `claude/great-cannon-6qk1rj`, commits locales (sin push). Estado final: `npm run check` y `npm run format:check` en verde, overflow 0 px en los 16 viewports.

| ID  | Estado           | Commit    | Nota                                                                                                                                                                  |
| --- | ---------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | hecho            | `a121eda` | Lockfile regenerado sin tocar `package.json`; `rm -rf node_modules && npm ci` y `npm run check` pasan.                                                                |
| R2  | hecho            | `ff10424` | `ScrollScene` pasa a estático con `(max-height: 36rem)` y sigue la rotación; tests con `matchMedia` simulado.                                                          |
| R3  | hecho            | `b122039` | Columna `minmax(0, 1fr)` en `.product` y `.productTop`; para que la tabla cupiera hizo falta el padding de R13.                                                        |
| R4  | hecho            | `8241f4f` | `scroll-padding-bottom` bajo 60rem con la altura del dock. Tab a 390x844, 844x390, 320x568 y 768x1024: ningún foco tapado.                                             |
| R5  | hecho (variante) | `a44736a` | `tabIndex={-1}` en el enlace de las fichas no fijadas, en el componente, en lugar de `visibility` o `inert`: así la vista previa y el clic con puntero siguen funcionando. |
| R6  | hecho            | `8fe9b7f` | Topes de `svh` y de ancho en `--device-w` y en el titular; 1440x900 y 1920x1080 idénticos píxel a píxel. Añade `animation-range` más corto con `max-height: 36rem`.      |
| R7  | hecho            | `eef0923` | Sin `x` en el titular; el borde izquierdo coincide con el gutter durante toda la escena.                                                                               |
| R8  | hecho            | `75054ee` | Solo a ≥ 60rem; a 768 y 820 el marco ya quedaba entero tras R2 y R7. A 1024x1366 quedan ~400 px libres bajo la ilustración (no es parte de la aceptación).             |
| R9  | hecho            | `f2ccbe5` | Medida `sangría + 55ch` (máx. 75 caracteres con el espacio final) y bloque centrado de 48rem a 59.99rem.                                                               |
| R10 | hecho (parcial)  | `3fe06b8` | Nombres de nodo (HTML) a 11 px mínimo, solo letras en hoja estrecha. Los textos SVG del plano siguen a 15 unidades (6,5 a 8 px reales a 320–375): con 17 o 20 se solapan. |
| R11 | hecho            | `f367a06` | `--sheet-w` con segunda pendiente bajo 80rem: fichas cerradas de 150 px a 1024 y nombres en 2 líneas. Los cargos siguen en 3 líneas.                                    |
| R12 | hecho (acotado)  | `a67d8a5` | Sin pantallas vacías en 16 viewports, ES y EN, salvo apaisado, corregido con espaciado. Los huecos de 300–450 px de las escenas fijadas dependen de D4 y no se tocan.   |
| R13 | hecho            | `b122039` | Padding de celda reducido bajo 30rem; "Dentro de límites" en 2 líneas a 375 y en 3 a 320.                                                                              |
| R14 | hecho            | `5a03404` | `align-items: start`.                                                                                                                                                  |
| R15 | hecho            | `ce7bee0` | `summary` 24/44 px, ES/EN 24/44 px, enlaces sueltos con padding y margen negativo. Queda el botón de nombre del equipo (22 px de alto) a ≥ 60rem, fuera de la lista.     |
| R16 | hecho            | `7d96b80` | `minmax(12rem, 1fr)` y hueco `space-8` entre 48rem y 60rem: tres columnas a 768.                                                                                       |
| R17 | hecho (2 de 4)   | `7684e84` | Corregidos el punto del indicador y "Historizador" a 430 px. Sin cambio: tangente de la A del hero y correo a 11 px (depende del scroll).                              |

Decisiones D1–D5: sin implementar. D4 sigue abierta y condiciona los huecos de R12; D5 se queda con la escala de R6 (a 320 px el equipo cruza 2 líneas).
