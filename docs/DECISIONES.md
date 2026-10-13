# ATLAXIA v2: decisiones técnicas

Registro de decisiones tomadas durante el desarrollo. Complementa `AGENTS.md`, `CLAUDE.md` y `README.md` (que no se modifican).

Última actualización: 2026-10-08 (Visión: "Hacia dónde vamos").

---

## Cómo arrancar

```bash
cd v2
npm install
npm run dev              # http://localhost:3000  (ES en /, EN en /en/)
npm run storybook        # http://localhost:6006
npm run check            # typecheck + lint + tests + build
npm run build            # export estático en ./out
npx serve out            # previsualizar el build (sirve 404.html correctamente)
```

Node 22 (`.nvmrc`). Con Node 25 funciona, pero Vitest muestra un aviso inofensivo sobre `--localstorage-file`.

---

## Stack

| Pieza | Elección | Motivo |
|---|---|---|
| Framework | Next.js 16 (App Router), `output: "export"` | Misma dirección que el legacy (React + TS) y mismo modelo de despliegue estático |
| React / TS | React 19.3, TypeScript 5.9 estricto con `noUncheckedIndexedAccess` | |
| Estilos | CSS Modules + variables CSS | Decisión del propietario. Componentes autocontenidos y portables |
| Tipografía | Overused Grotesk (variable 400-600) + JetBrains Mono (variable 400-600), recortadas al latín y servidas desde `src/assets/fonts` | Decisión del propietario (2026-09-30): la fuente de Boiler Lab. Sustituye a Open Runde; IBM Plex Sans se evaluó y se descartó |
| Storybook | 10, `@storybook/nextjs-vite`, addons docs y a11y | |
| Tests | Vitest 4 + Testing Library + jsdom | |
| Lint / formato | ESLint 9 (config de Next 16, Storybook, Prettier) + Prettier 3 | El legacy no tenía lint funcional |
| Iconos | lucide-react | La misma librería que usa el producto (atlaxia-demo) |
| Animación | CSS + IntersectionObserver; Lenis 1.3 (MIT) para el scroll con inercia | Lenis es lo que usa Cerebrium. Motion se añadirá cuando un componente lo necesite de verdad |

---

## Estructura

```text
v2/
  app/
    (es)/layout.tsx, page.tsx      Home ES en "/", <html lang="es">
    (en)/layout.tsx, en/page.tsx   Home EN en "/en/", <html lang="en">
    global-not-found.tsx           404 único y bilingüe
    icon.png, apple-icon.png
  src/
    styles/        tokens.css, base.css, fonts.css, Foundations.stories.tsx
    i18n/          config, metadata, preferencia de idioma, opciones del selector
    content/       es/, en/, shared/ (datos no traducibles), types.ts
    components/    primitives/, layout/, navigation/  (candidatos a librería)
    shell/         RootDocument, SiteNav, SiteFooter, Brand, PendingTag  (específico de ATLAXIA)
    views/Home/    composición de la home
    sections/      (vacío: llegará sección a sección)
    lib/           cx, paths
    assets/        brand/svg (logo original), fonts/ (woff2 recortadas + licencias OFL)
  docs/            este archivo y CONTENIDO.md
```

`src/views/Home` sustituye al `src/pages/Home` de CLAUDE.md: una carpeta `pages/` colisiona con el Pages Router de Next.

Convención por componente: `Nombre/Nombre.tsx`, `Nombre.module.css`, `Nombre.stories.tsx`, `Nombre.test.tsx` si tiene lógica, `index.ts`.

---

## Idiomas (i18n)

- **Rutas:** `/` es español y `/en/` es inglés. Cada idioma tiene su propio layout raíz (route groups), así el HTML estático sale con el `lang` correcto, `canonical` y `hreflang` (`x-default` apunta a `/`).
- **Sin librería i18n.** Diccionarios en `src/content/es` y `src/content/en`. El tipo `Dictionary` se deriva del español; el inglés usa `satisfies Dictionary`, así que una clave que falte o sobre rompe el build.
- **Fallback:** `getDictionary()` y `resolveLocale()` devuelven español ante cualquier valor desconocido.
- **Ids de sección** independientes del idioma (`src/content/shared/sections.ts`): `vision`, `capabilities`, `building`, `about`, `contact`. `building` pasará a `products` cuando haya catálogo.
- **Selector:** enlaces normales (funcionan sin JS y se indexan). Con JS conserva el `#hash` y guarda la elección en `localStorage` (`atlaxia.locale`).
- **Preferencia:** un script inline en el `<head>` de la home ES redirige a `/en/` solo si el visitante eligió inglés antes. La primera visita y los buscadores siempre ven español. No se usa `Accept-Language`.
- **404:** `global-not-found.tsx` (flag experimental `globalNotFound`, necesario con varios layouts raíz). Muestra español y debajo inglés, con `lang` en cada bloque.
  - **Solo importa `@/styles/index.css`**, la misma hoja que los layouts, y sus estilos propios van en línea con tokens.
  - **Motivo (fallo de `next dev`):** con un CSS module propio, Turbopack generaba un chunk aparte. Los manifiestos de las páginas lo registraban pero nunca lo enlazaban, y al editar un CSS compartido la recarga en caliente fallaba con "No link element found for chunk".
  - **Resultado:** al compartir el chunk, el `<link>` siempre existe. No afecta al build estático.
- **Tests:** mismas claves en ES y EN, sin strings vacíos, sin rayas ni puntos medios, fallback a ES.

---

## Tokens

Dos niveles en `src/styles/tokens.css`:

1. `--palette-*`: valores crudos. Solo los lee `tokens.css`.
2. Tokens semánticos (`--color-*`, `--text-*`, `--space-*`, `--radius-*`, `--duration-*`...): los únicos que usan los componentes.

`[data-surface="dark"]` redefine todos los tokens semánticos de color para los paneles tipo sala de control. `Surface tone="dark"` lo aplica, y cualquier componente funciona dentro sin variantes propias.

Los valores base salen del `globals.css` vigente del legacy (papel frío `#f2f4f8` y cobalto `oklch(0.58 0.14 255)`, radios 4/6/8, plano con una sola sombra). El `DESIGN.md` legacy (crema + teal) está desactualizado.

### Ajustes de contraste respecto al legacy

| Caso | Legacy | v2 |
|---|---|---|
| Texto secundario pequeño | `mute2 #6B7178` (4,48:1, no llega a AA) | `--color-text-muted #5B6169` (5,68:1) |
| Botón primario | cobalto con texto blanco (4,31:1) | tinta `#0E1116` con texto papel. El cobalto queda para señal, relación, enlaces y foco |
| Texto en acento | cobalto base (3,91:1) | `--color-accent-text` (6,56:1). El cobalto base solo para trazos y texto grande |
| Rojo de desviación sobre papel | `#f85149` (3,04:1) | `oklch(0.55 0.19 27)` (4,85:1). En oscuro se mantiene `#f85149` |
| Borde de controles | sin token de 3:1 | `--color-border-strong #7A8089` (3,6:1) |

### Significado fijo de colores en diagramas

- Observado: tinta.
- Esperado, modelo y relación: cobalto.
- Desviación: rojo.

### Motion

Duraciones `150 / 300 / 600 ms` que pasan a `0ms` con `prefers-reduced-motion` o con `data-motion="reduce"` en `<html>` (toolbar "Motion" de Storybook).

---

## Conflictos con el legacy y cómo se resuelven

| Conflicto | Solución |
|---|---|
| El `tsconfig.json` raíz incluía `v2/**` | Añadido `"v2"` al `exclude` de la raíz (autorizado por el propietario, única modificación fuera de v2) |
| `package-lock.json` en la raíz hace que Next infiera el padre como raíz del proyecto | `turbopack.root` y `outputFileTracingRoot` fijados en `next.config.ts` |
| `postcss.config.js` raíz (Tailwind 3) se encontraría subiendo directorios | `v2/postcss.config.mjs` propio (solo autoprefixer) |
| Resolución silenciosa de dependencias desde `../node_modules` | Todas las dependencias declaradas en `v2/package.json` |
| Node 25 tapa el `localStorage` de jsdom | Almacenamiento en memoria en `src/test/setup.ts` |

---

## Componentes de esta fase

| Componente | Capa | ¿Candidato a librería? |
|---|---|---|
| Button | primitives | Sí |
| Container | primitives | Sí (sin story, es un wrapper trivial) |
| Section | primitives | Sí |
| SectionHeader | primitives | Sí |
| Surface | primitives | Sí |
| Tag | primitives | Sí. Tonos y geometría del producto; icono opcional |
| SegmentedControl | primitives | Sí. Radios nativos, controlado o no controlado |
| LanguageSwitcher | navigation | Sí (no depende del router de Next) |
| FloatingSectionNav + useActiveSection | navigation | Sí. Sin copy ni router; iconos opcionales por item |
| StableLabel | primitives | Sí. Ancho estable entre traducciones y grosores |
| SmoothAnchorScroll | navigation | Sí. Scroll suave y foco para todas las anclas de la página |
| SplitLayout | layout | Sí. Dos columnas con container queries |
| NodeGraph | data-display | Sí. Grafo SVG de señales: foco, relacionadas y contexto |
| ProcessFlowReveal | storytelling | Sí. ProcessFlow que se reproduce una vez al entrar en pantalla |
| StickyLayout | layout | Sí. Columna fijada mientras la otra hace scroll |
| SmoothScroll | navigation | Sí. Scroll con inercia (Lenis); se apaga con movimiento reducido |
| SignalChart | data-display | Sí. Señales en el tiempo, banda esperada y desviaciones |
| StickyIndexStory | storytelling | Sí. Índice fijo de razones con paneles (patrón WHY de Cerebrium) |
| LayerStack | storytelling | Sí. Sistema en capas con columna transversal (patrón de producto de Radiant) |
| RootDocument, SiteNav, SiteFooter, Brand, PendingTag | shell | No, específicos de ATLAXIA |

Dependencias de los componentes portables: solo `src/lib/cx.ts` y los tokens semánticos. Los iconos se pasan como `ReactNode`, así que no dependen de lucide.

---

## Fuentes

- **Overused Grotesk:** archivo variable del repositorio oficial (RandomMaerks/Overused-Grotesk, OFL), copiado en `scripts/fonts/source/`. Trae ejes de peso (300 a 900) e inclinación.
- **JetBrains Mono:** el paquete de Fontsource, que queda como `devDependency` porque solo es la fuente del script.
- `scripts/subset-fonts.py` fija los ejes (Grotesk: peso 400 a 600 y sin inclinación; Mono: peso 400 a 600), recorta al rango latino (español e inglés completos) y conserva las features `case` y `tnum`.

| Archivo | Antes | Ahora |
|---|---|---|
| Overused Grotesk (variable) | 90,5 KB | 22,8 KB |
| JetBrains Mono (variable) | 40,4 KB | 27,8 KB |
| **Total** | **~131 KB** | **50,6 KB** |

Al tener el eje de peso completo entre 400 y 600, el medium (500) ya es real: los tags y el selector usan los mismos grosores que el producto.

El legacy cargaba cuatro grosores de Open Runde (~630 KB) más Nunito, IBM Plex Sans y JetBrains Mono. Las licencias OFL van junto a los woff2.

Regenerar:

```bash
python3 -m venv .venv-fonts && .venv-fonts/bin/pip install fonttools brotli
.venv-fonts/bin/python scripts/subset-fonts.py
```

### Fuentes descartadas

- **IBM Plex Sans:** se comparó en Storybook y el propietario eligió Open Runde. El producto (atlaxia-demo) sí la usa; la web comparte con el producto geometría, colores e iconos, no la fuente.
- **Open Runde:** usada hasta el 2026-09-30. Se sustituye por Overused Grotesk al estudiar Boiler Lab.

---

## Logo

- Fuente de verdad: `src/assets/brand/svg/` (símbolo, wordmark y logo completo, con `currentColor`).
- `src/shell/Brand/Brand.tsx` los incrusta como SVG inline: heredan el color (claro, oscuro o acento) y no añaden peticiones. Son decorativos por defecto; el enlace que los contiene lleva el nombre accesible.
- Favicon: `app/icon.svg` (símbolo centrado, cambia a claro con `prefers-color-scheme: dark`) más `app/icon.png` y `app/apple-icon.png` como alternativa.
- Decisión del propietario: se usa este logo tal cual. Los trazados solo tienen segmentos rectos (parecen vectorizados desde bitmap). Comprobado: a 120 px apenas se nota; a 480 px las facetas se ven claramente en la curva de la gota y en las esquinas. Sirve para cabecera y favicon, no para usos grandes (hero, cartelería). 

---

## Tags y selectores (consistencia con el producto)

Fuente: `atlaxia-demo` (`src/lib/badges.ts`, `src/components/ui/Badge.tsx`, `src/index.css`, `src/components/anomaly-management/Segmented.tsx`).

### Invariante de color (del producto, se aplica también a la web)

- Relleno saturado con texto blanco significa **criticidad ISA-18.2** y nada más: `critical`, `high`, `medium`, `low` y `normal`.
- Todo lo demás (placeholders, categorías, sectores, capacidades...) es **pizarra neutra graduada** (`neutral`, `neutral-faint`, `neutral-strong`, `neutral-muted`) y se distingue **por icono, nunca por color**.
- `cobalt` solo para referencias (normas, documentos).
- Los tonos de proceso del producto (etapas SWaT) no se trasladan a la web.

### Tag

- Geometría del chip del producto: 25 px de alto, 10 px de padding, texto de 11 px, radio de 7 px (`--radius-chip`), icono de 13 px con trazo 2.
- El texto va en medium (500), como en el producto.
- Colores copiados tal cual (`--color-tag-*`, claro y oscuro). El producto los marca como "do not recalculate".
- Placeholder de la web: `PendingTag`, tono `neutral` con icono de reloj, igual que el estado "Pendiente" del producto.

**Contraste: decisión del propietario (2026-09-29): se mantienen los colores exactos del producto**, por consistencia. Queda documentado el dato: en modo claro, cinco tonos no llegan a 4,5:1 con texto blanco de 11 px:

| Tono | Producto | Contraste | Ajuste mínimo con el mismo matiz |
|---|---|---|---|
| high | `#b56a1c` | 4,16 | `#ae6412` (4,53) |
| medium | `#a87a1a` | 3,84 | `#9b6e00` (4,54) |
| low | `#1f87b0` | 4,08 | `#107fa8` (4,54) |
| normal | `#707b91` | 4,26 | `#6c778d` (4,51) |
| neutral-faint | `#828ca0` | 3,38 | `#6d778a` (4,51), casi igual que `neutral-muted`: se pierde la gradación |

En modo oscuro todos cumplen. La web solo usa `neutral` (5,43:1) por ahora, así que no hay incumplimiento publicado. La story "Primitives/Tag, Product tones" enseña los que fallan.

### SegmentedControl

- Réplica del selector del producto: carril con fondo inset, radio de 8 px, padding de 4 px y separación de 2 px; opciones de 28 px (36 px en pantallas táctiles), radio de 6 px, texto de 12 px; la opción activa va elevada (fondo raised, semibold, `--shadow-raise`).
- Diferencia con el producto: usa radios nativos en lugar de botones con `aria-pressed`. Así las flechas del teclado, el envío en formularios y la semántica vienen de la plataforma, y sirve para ContactRouter.
- Una copia invisible en semibold reserva el ancho, así no hay salto de maquetación al seleccionar.
- `LanguageSwitcher` compone sus clases con `composes:` (verificado en Next/Turbopack y en Storybook/Vite), así que los dos selectores no pueden divergir.

## Navegación (FloatingSectionNav)

Revisada tras el feedback del propietario (2026-09-29): sin menú hamburguesa, barra inferior también en móvil, selector de idioma coherente, más aire entre secciones y acciones, y tamaño estable al cambiar de idioma.

### Comportamiento

- **Una sola barra flotante inferior en todos los anchos.** Contiene:
  - el símbolo del logo (se oculta por debajo de 400 px);
  - el carril de secciones;
  - el selector ES / EN;
  - "Contacto" como botón primario.
- **Pantallas anchas (desde 60rem):** las secciones muestran su título. Hay más separación entre las secciones y las acciones.
- **Pantallas estrechas:** las secciones son iconos (Compass, Layers, Box, Users) y "Contacto" es un icono de sobre. El nombre accesible sigue siendo el título. Los iconos evitan los de severidad del producto.
- **Logo:** una fila estática arriba de la página (se va con el scroll) con el logo completo, porque en móvil ya no hay barra superior.
- **Sección activa:** una pastilla elevada que se desliza a la sección que se lee.
  - Cuando ninguna sección está activa, **sale por el borde del carril en la dirección del lector**: a la derecha al pasar de la última (hacia Contacto y el pie), a la izquierda al volver al hero.
  - Vuelve a entrar por el mismo lado.
  - El carril recorta la pastilla (`overflow: clip`). La lógica está en `thumb.ts`, que es una función pura con tests.
- **Coherencia con el producto:** el selector de secciones, el de idioma y SegmentedControl comparten las mismas clases (carril inset, pastilla blanca, 12 px). Fallaba el padding del selector de idioma: el reset `ul[role="list"]` de base.css era más específico; ahora usa `:where()`.
- **Tamaño estable entre idiomas:** `StableLabel` reserva el ancho de la etiqueta más larga de todos los idiomas y de su versión semibold. Es el mismo principio que los badges del producto. La barra mide lo mismo en ES y EN (comprobado: 779 px en escritorio, 281 px en móvil). Lo usan:
  - las secciones y "Contacto";
  - las opciones de SegmentedControl;
  - el selector de idioma;
  - `PendingTag`.

  El helper `otherLocaleValues` saca las traducciones de los diccionarios.

### Decisiones técnicas

- **Sección activa:** `useActiveSection` usa IntersectionObserver con una banda de lectura en torno al 40 % del viewport, sin listeners de scroll.
- **Centrado:** con `inset-inline: 0` y `margin: auto`, no con `left: 50%` y `translateX`, que limitaría el ancho a medio viewport.
- **Pie:** tiene margen inferior extra en todos los anchos para que la barra no lo tape.
- **Offset de anclas:** solo `scroll-margin-top` en Section.
- **`placement="top"`:** sigue disponible para probar la barra arriba.
- **Tamaño de la barra (2026-10-01, a petición del propietario: más grande en todo):**
  - Escritorio: pestañas de 38 px (44 px en táctil), texto de 14 px, 16 px de padding lateral, carriles con 5 px de padding y radio de 11 px, 12 px de padding en la barra (74 px de alto en total), logo de 28 px, iconos de 20 px y el botón de contacto a la altura del carril.
  - Por debajo de 60rem: elementos cuadrados que escalan con el ancho, `clamp(34px, 10.5vw, 44px)`, para que la barra siempre quepa (304 px a 320 de ancho). El logo se oculta por debajo de 480 px.
  - Cómo se hace: `SegmentedControl` expone sus medidas como variables (`--seg-height`, `--seg-pad`, `--seg-font`, `--seg-track-pad`...) con los valores del producto por defecto. La barra las redefine y escala de una vez sus pestañas, el selector de idioma y el botón. Fuera de la barra el selector sigue siendo idéntico al del producto.
- **Scroll con inercia (SmoothScroll, Lenis):** lo que el propietario echaba en falta era la inercia de Cerebrium, no solo el desplazamiento suave de las anclas.
  - Lenis 1.3 con `autoRaf` y `lerp: 0.1`, montado en RootDocument. Añade la clase `lenis` a `<html>` y su CSS desactiva `scroll-behavior` mientras está activo.
  - No se monta con movimiento reducido y se destruye si el usuario lo activa con la página abierta.
  - La instancia se comparte en `src/lib/smoothScroll.ts` para que otros componentes la usen sin contexto de React.
- **Anclas (SmoothAnchorScroll):** un único listener delegado para los clics en anclas `#id`.
  - Con Lenis activo usa `lenis.scrollTo` con el `scroll-margin-top` de la sección como offset; si no, `scrollIntoView({ behavior: "smooth" })`.
  - `pushState` conservando el estado de Next, para que atrás y adelante sigan funcionando.
  - El foco pasa a la sección sin un segundo salto. Las secciones enfocadas por código (`tabindex="-1"`) no muestran anillo.

### Límites conocidos

- Por debajo de 320 px de ancho los elementos se quedan en 34 px y la barra podría no caber.
- Si la última sección del carril fuese muy corta, podría no llegar a la banda de lectura.

### Verificación

- **Tests:** la lógica de la pastilla (salir y entrar por cada lado), el nombre accesible con iconos, que las traducciones reservadas no se lean y el seguimiento de sección.
- **Chrome real (Claude in Chrome), comprobado:**
  - la posición de la pastilla sobre la sección y aparcada a la derecha al final de la página;
  - el mismo ancho en ES y EN;
  - la barra móvil a 390 y 360 px sin desbordar.
- **Pendiente de ver en una pestaña visible:** la pestaña automatizada estaba oculta, así que Chrome no pinta fotogramas. El deslizamiento animado solo se ha comprobado por sus posiciones, no a la vista.

---

## Layouts (SplitLayout, StickyLayout)

Los dos usan **container queries**: pasan a columnas cuando su contenedor mide al menos 48rem, no según el viewport. Así funcionan igual a ancho completo, dentro de un panel o en otro proyecto.

### SplitLayout

- **Slots:** `start` (normalmente el texto) y `end` (el visual o la evidencia).
- **`ratio`:** `1:1`, `5:7`, `7:5`, `4:8` u `8:4`, siempre referida a start:end.
- **`align`:** start, center, end o stretch.
- **`order="end-first"`:** cambia el orden solo en columnas. El DOM y la lectura siguen siendo start y luego end, y la proporción acompaña al contenido (con 7:5 el texto conserva sus 7/12).
- **Casos previstos:** hero (texto y visual), visión, origen y secciones que alternan.
- **Verificado en Chrome:**
  - 5:7 da una relación exacta de 0,714;
  - con `end-first`, el visual pasa a la izquierda y el texto mantiene 7/12;
  - se apila en un contenedor de 384 px y va en columnas a 1.480 px.

### StickyLayout

- **Slots:** `sticky` (el panel que se queda a la vista) y `children` (el contenido largo que pasa por delante).
- **`stickySide`:** start o end. El orden del DOM sigue al visual.
- **`stickyAlign`:** `top` (fijado bajo el offset) o `center` (centrado en la altura visible).
- **`offset`:** cualquier longitud CSS.
- **Contenedores estrechos:** se apila y deja de fijarse.
- **Caso previsto:** la narrativa 01 a 05 de "Qué estamos construyendo" (base de StickyStory).
- **Verificado en Chrome:** el panel se mantiene a 32 px del borde con su centro en el centro exacto del viewport durante todo el recorrido, y se suelta al terminar el contenido.
- **Aviso:** `position: sticky` deja de funcionar si algún ancestro tiene `overflow: hidden` o `auto`.

### Aviso común

`container-type` aplica contención de layout: el contenedor pasa a ser el bloque contenedor de los hijos con `position: fixed`. No meter UI fija (como la barra de navegación) dentro de estos layouts.

---

## Storytelling (ProcessFlow, StickyStory)

- **ProcessFlow:** nodos numerados y conectores que se rellenan hasta `activeIndex`. Sin `activeIndex`, se muestra completo y estático. Pasa de vertical a horizontal con una container query a 44rem. Es solo CSS: lo mueve quien lo usa.
- **StickyStory:** pasos sobre StickyLayout con una línea de lectura a media pantalla (`useActiveSection` con `keepLast`, ahora en `src/lib/hooks`).
  - El panel fijo cambia de visual con un fundido y muestra un indicador "02 / 05".
  - En contenedores estrechos cada paso lleva su visual en línea.
  - El énfasis va por color, no por opacidad, para mantener AA.
- **Aviso:** los visuales se renderizan dos veces (panel e inline). Si un visual usa ids de SVG, hay que generarlos únicos.
- **Verificado en Chrome:**
  - ProcessFlow horizontal con `activeIndex=2`: dos conectores rellenos y el nodo actual en cobalto;
  - ProcessFlow vertical en un contenedor de 22rem;
  - StickyStory al llegar al paso 4: paso activo "Investigar", contador "04 / 05" y solo ese visual expuesto, con el panel fijado.
- **Pendiente:** ver el fundido y el relleno animado en una pestaña visible (la automatizada no pinta fotogramas) y aplicarlos en las secciones reales.

---

## Secciones (Hero, Visión, Qué estamos construyendo, Contacto)

Viven en `src/sections/`. Son específicas de ATLAXIA y reciben su parte del diccionario. La Home las compone y el resto de bloques siguen como placeholders.

- **Hero (v3, 2026-10-01):** el propietario pidió menos texto, el titular en un solo color, quitar el cajetín, centrar el dibujo y un acabado premium al estilo de Cerebrium y Matta.
  - **Marco (Matta):** la barra de marca y el hero forman una sola hoja enmarcada con líneas finas, a `--frame-inset` del borde y con cruces de registro en las esquinas. El logo va en una celda oscura sobre el marco. La hoja completa cabe en la primera pantalla de escritorio.
  - **Composición (Cerebrium):** titular grande en tres líneas, de un solo color y en peso medium, abajo a la izquierda; una frase y los dos botones abajo a la derecha, sobre la misma línea base. Sin eyebrow ni cajetín.
  - **Dibujo centrado:** el símbolo construido sobre sus circunferencias reales (la que pasa por los tres vértices y la inscrita, calculadas en `geometry.ts`), con los lados prolongados, ejes, un dial de instrumento con marcas cada 5 grados, rayado de sección y los vértices como nodos. Todo comparte el mismo centro, también la rejilla de cruces.
  - **Movimiento:** al cargar, la construcción se abre desde el centro y el símbolo se dibuja (reveal). Después, dos señales recorren el contorno y otra la circunferencia, como datos moviéndose por el sistema (story). Cada señal es una cabeza nítida con una cola tenue. Las señales van en su propia capa SVG; el bucle se pausa fuera de pantalla (`HeroCanvas`) y desaparece con movimiento reducido.
  - **Dial que sigue al ratón (feedback, `HeroDial`):** con ratón, la zona de la rueda más cercana al puntero se oscurece (aro y marcas) y esa zona oscura sigue al puntero alrededor de la rueda con inercia; al alejarse, se apaga despacio. Nada cambia de tamaño ni de forma: el aro y las marcas son fijos. Versiones anteriores que agrandaban la rueda, la abombaban o alargaban las marcas se quitaron a petición del propietario. La intensidad depende de la distancia a la rueda: es máxima sobre el aro y nula a 280 unidades de él, así que en el centro del símbolo no actúa. Hay dos copias del mismo dial: una clara de base y otra oscura que solo se ve bajo una máscara radial colocada en el puntero; lo único que se mueve es esa máscara (rAF que se detiene en reposo). Sin listeners en pantallas táctiles ni con movimiento reducido.
  - **Por debajo de 60rem** el hero es una columna: el dibujo ocupa la altura que deja el texto, así la hoja llena exactamente una pantalla sin solaparse. En teléfonos el texto se compacta (titular de 34 px, entradilla a tamaño base y barra de marca de 56 px), y en pantallas de menos de 640 px de alto, aún más (titular de 30 px). Verificado con la altura visible real del navegador, barras incluidas: 390×664 (iPhone con Safari), 375×553 (iPhone SE), 360×700, 430×740 y 320×568. En todas, el hero cabe y el último botón queda por encima de la barra.
  - Los grosores de línea están en unidades del dibujo: unos 0,55 px por unidad en un portátil y 0,85 en una pantalla grande.
- **Visión (v2, patrón WHY de Cerebrium):** StickyIndexStory con un índice fijo de cuatro razones en tipografía grande y un panel por razón.
  - El índice no lleva punto delante de la etiqueta (2026-10-01).
  - Sin cabecera de sección (2026-10-01, a petición del propietario): se quitaron "01 Visión", el título y la entradilla. La sección abre directamente en el índice, como en Cerebrium, y su etiqueta "Visión" (antes "Por qué existimos") es el `h2` que nombra la región (`labelAs="h2"`).
- **Cabeceras sin numeración (2026-10-01, a petición del propietario):** las secciones ya no muestran el ordinal ("02", "03"...). `SectionHeader` conserva la prop `index` como opción del componente, pero la web no la usa. Los números de las capas del producto (04 a 01) y de los pasos se mantienen: son parte del contenido, no de la cabecera.
  - Contexto: cuatro señales sin contexto (SignalChart).
  - Relaciones: el grafo de señales que antes estaba en el hero (NodeGraph).
  - Comportamiento esperado: observado frente a esperado, con banda y desviación (SignalChart con leyenda).
  - De entender a actuar: la cadena Datos → Acción con ProcessFlowReveal.
  - Cierra con "Hacia dónde vamos". Los datos de las ilustraciones (`illustrations.ts`) son deterministas y genéricos: ninguna planta ni dataset real.
  - **Hacia dónde vamos (2026-10-08, opciones 1, 2 y 3 elegidas por el propietario; la 7 solo en su versión corta):**
    - La frase de objetivo se queda al tamaño que tenía: es el manifiesto corto. El manifiesto largo queda para una versión final antes del footer o para una frase destacada con un componente propio.
    - **Escala y hoja de ruta en una sola figura:** ScaleRings (señal, equipo, proceso, planta, sistemas) junto a un ProcessFlow vertical con Hoy, Siguiente y Objetivo. Cada etapa es un nivel de la escala (`stageLevel` en `Vision.tsx`) y comparten número: 01 en el anillo del proceso y en "Hoy". Lo cubierto va en continuo y cobalto; lo que falta, en discontinuo, como las líneas de construcción del hero y de Vectr.
    - **Sectores:** una ficha por sector (Vectr, industrias) con un esquema tipo P&ID en lugar de foto. Las burbujas de instrumento (LT, PT, FT, TT, ST, VT, JT) son las mismas señales que el grafo de "Relaciones", y la leyenda reutiliza sus nombres (`reasons.relations.nodes`). En agroalimentación, la banda esperada cambia en cada fase: repite visualmente la razón "Comportamiento esperado".
    - Encabezados: "Hacia dónde vamos" (h3), "Dónde empezamos" (h4) y cada sector (h5, dentro del `figcaption`).
    - Composición por container queries sobre el propio bloque: escala y hoja de ruta lado a lado desde 52rem; sectores apilados, en filas (dibujo y texto) desde 36rem y en tres columnas desde 56rem.
    - Movimiento (reveal y story): los anillos se abren hacia fuera y después aparecen relaciones y marcadores; en los esquemas, primero el equipo, luego los instrumentos y al final sus relaciones. Una sola vez, al entrar en pantalla. Con movimiento reducido o si ya estaban visibles al cargar, estado final.
    - Peso de la página exportada tras el cambio: 211 KB de HTML (47 KB con gzip).
  - El índice resalta la razón que cruza la línea de lectura (45 % a 55 % del viewport) y la mantiene entre paneles. Cada entrada enlaza a su panel. En móvil el índice va arriba y los paneles debajo.
- **Qué estamos construyendo (patrón de producto de Radiant):** sección oscura con LayerStack.
  - Cuatro capas de arriba abajo: interfaz de operación (04), observado frente a esperado (03), relaciones entre señales (02) y la planta junto al SCADA (01). Iconos de lucide, etiquetas monoespaciadas.
  - Desde 44rem, las piezas de cada capa comparten tres columnas para que los iconos se alineen como en un plano.
  - Columna transversal con el producto: SCADAXIA con la etiqueta "Nombre provisional", qué permite (01 a 05) y "Ver la demo" (demo.atlaxia.es, pestaña nueva).
  - Todo el copy sale del contenido legacy verificado y conceptual (ver política de evidencia en CONTENIDO.md).
- **Contacto (patrón book a demo de Rig):** sección oscura a sangre con una malla de alambre en perspectiva (SVG estático generado en `mesh.ts`, con máscara hacia el horizonte).
  - Título grande centrado, un CTA ancho con esquinas achaflanadas ("Solicitar demo" con icono de retorno) y las intenciones como enlaces de correo con asunto.
  - Sin formulario hasta tener los textos legales. El chaflán se pinta en `::before` para que el anillo de foco no se recorte.
- **Home:** compone las secciones en el orden de `navSectionIds`; las que faltan (Qué hacemos, Quiénes somos) siguen como placeholders.
- **Peso de la página:** 164 KB de HTML (41 KB con gzip), la mitad es el payload RSC de Next. Aceptable; si crece, las ilustraciones se pueden pasar a archivos SVG estáticos.
- **Stories:** "Sections" usa los diccionarios reales en ES y EN.

**Storyboard v3: el caso del agua (2026-10-08, pendiente de aprobar antes de animar):**

Las dos escenas Lottie también se rechazaron: un experto del sector no entendería qué hace ATLAXIA ni hacia dónde va, los textos eran pequeños y estaban en una esquina, y los sectores quedaban sueltos. Con el propietario se decidió el enfoque (ver CONTENIDO.md): no publicar hoja de ruta; contar un caso concreto en agua ("Dónde empezamos") y cerrar con una dirección en una frase y la invitación al piloto ("Hacia dónde vamos").

- **Storybook "Sections/Vision water case"**: cinco fotogramas estáticos del caso y uno de la dirección, en ES y EN. Se aprueban antes de animar.
- **El caso, en el lenguaje del operador:** estación de bombeo con P&ID (depósito, bomba B-101 con motor, retención, caudalímetro, impulsión a la red) y cinco instrumentos (LT-101, PT-102, FT-103, VT-104, JT-105). (1) El SCADA: cada señal contra un umbral, ninguna alarma. (2) La presión de impulsión empieza a bajar dentro del umbral. (3) Comparada con lo esperado para cada momento, ya está fuera. (4) Caudal, energía por m³ y vibración cambian con ella; el nivel no (descarta la aspiración). (5) Antes de la alarma el equipo programa la revisión; la proyección muestra dónde habría saltado el umbral.
- **Verosímil para un experto:** el desgaste de una bomba centrífuga baja la presión y el caudal y sube la energía específica y la vibración; el nivel estable descarta un problema de aspiración. Sin valores ni unidades: es una ilustración y así se rotula.
- **Solo lo que el producto ya hace:** observado frente a esperado, señales relacionadas y explicación de la desviación (contenido verificado). "Por qué" y "Qué hacer" aparecen como huecos en discontinuo en la tarjeta de "Hacia dónde vamos": la dirección sin prometer funciones.
- **Lenguaje visual del producto (ISA-101):** neutro cuando todo es normal, ámbar para la desviación, rojo solo para el umbral y la alarma del SCADA, y cobalto para lo que lee ATLAXIA. Etiquetas de estado con el `Tag` del producto. La bomba con voluta y álabes, como `PidPump` del demo.
- **Texto legible y en su sitio:** el mensaje de cada paso va grande bajo el titular (2 % del ancho del fotograma) y los nombres de instrumentos en HTML junto a cada burbuja, no dentro del SVG, para que no encojan con el dibujo. Los fotogramas se dimensionan en unidades de contenedor (`cqi`).
- **`mailto`** pasa a `src/lib/mailto.ts` y lo comparten Contacto y la invitación al piloto (asunto "ATLAXIA: Colaborar en el piloto").
- **Pendiente tras aprobar:** la escena de scroll que pasa de un fotograma a otro (dibujar la tendencia, encender las relaciones), su versión móvil, sustituir el bloque `where` de la home y borrar lo rechazado (ScaleRings, Schematic, `sectorDrawings.tsx`, WhereScene, SectorsScene, sus animaciones y `vision.where` y `vision.scenes`).

**Escenas de scroll con Lottie (2026-10-08, segunda propuesta para "Hacia dónde vamos"):**

El propietario rechazó el primer bloque (anillos, hoja de ruta en lista y fichas con leyenda) por genérico, cargado de texto y sin relación entre el diagrama y lo que se cuenta. Pidió titulares protagonistas, parallax y animaciones Lottie activadas por scroll que cuenten la historia. Las dos escenas viven en Storybook ("Sections/Vision scenes") hasta que decida; la home sigue con el bloque anterior.

- **Escena A, "Hacia dónde vamos" (`WhereScene`):** un zoom hacia fuera al estilo de Potencias de diez sobre un mundo dibujado como plano. La cámara no se mueve del sensor: señal, equipo, proceso (Hoy), planta en discontinuo (Siguiente) y red de plantas (Objetivo). Fuera de la animación solo hay el titular y tres palabras, que aparecen en su momento del scroll; la última lleva la frase de objetivo. 4,5 pantallas de scroll.
- **Escena B, "Dónde empezamos" (`SectorsScene`):** el titular se queda y los tres sectores entran de lado (pista horizontal movida por el scroll vertical). El dibujo de cada sector entra primero y se anima mientras llega; el nombre le sigue algo más rápido (parallax). 4 pantallas.
- **Lottie generado por código, no a mano:** `scripts/lottie/` (`lib.mjs`, `scene-where.mjs`, `scene-sectors.mjs`, `build.mjs`). Colores de los tokens (cobalto calculado desde OKLCH), las mismas curvas de easing que la web y solo lo que pintan igual Skottie y lottie-web: capas de forma y nulas, grupos, trazados, discontinuos, trim paths y transformaciones. Sin texto ni expresiones. `node scripts/lottie/build.mjs` escribe `public/animations/*.json` y, si existe, una copia en el reproductor de `../atlaxia-lottie` (proyecto `atlaxia-vision`) para previsualizar fotograma a fotograma. El `scene-1` de `main-project` de ese reproductor no se ha tocado: usa un sensor de SWaT y no se puede publicar.
- **Grosor constante durante el zoom:** el zoom de la escena A es de unas 80 veces. Cada grosor y discontinuo se muestrea cada 6 fotogramas con la inversa de la escala de la cámara, que se interpola en escala logarítmica para que la velocidad del zoom se sienta constante. Cada nivel solo se compensa mientras se ve. Pesa 366 KB en bruto y 14 KB con gzip; los sectores, entre 16 y 25 KB.
- **Orden de pintado:** en Lottie el primer elemento de un grupo va delante. El builder recibe las listas de grupos de atrás hacia delante y las invierte (`backToFront`); el trazo va antes que el relleno.
- **`ScrollScene`** (`storytelling`): la escena mide su avance (0 a 1) con un solo listener de scroll por rAF y lo publica como `--scene-progress` (para CSS) y por suscripción (para JS), sin renderizar React en cada fotograma. Con movimiento reducido no se fija y queda en su estado final (`data-static`).
- **`ParallaxLayer`:** capa que interpola desplazamiento, escala y opacidad entre dos valores dentro de un tramo del avance. Solo CSS (`clamp()` y `calc()` sobre `--scene-progress`), así que funciona también en Firefox, que no tiene animaciones CSS ligadas al scroll.
- **`ScrubLottie`** (`data-display`): lottie-web 5.13 en versión ligera (renderer SVG, 51 KB con gzip), con import dinámico y el JSON cargados solo cuando se acerca a la pantalla. El fotograma sigue al scroll con un suavizado ligero. Quita la capa `background`, que el reproductor necesita, para que se vea la página. Es decorativo (`aria-hidden`); cada escena lleva una descripción en `visually-hidden`.
- **Dependencia nueva:** `lottie-web@5.13.0`, versión fija. No añade vulnerabilidades: las dos que da `npm audit --omit=dev` (`next`, `source-map-js`) ya estaban.
- **Bordes:** las animaciones se difuminan en los bordes de su caja (máscara lineal) para que las tuberías que salen del encuadre no se corten en seco.
- **Verificación:** en la pestaña automatizada el rAF no corre sin pintar; cada posición del scroll se comprobó forzando un fotograma con una captura antes de la buena. Revisadas en escritorio (1512 px), en móvil (390 px) y con movimiento reducido.
- **Ajustes del propietario (2026-10-08):** en A se quitan los números 01 a 03 sobre las palabras de etapa y el titular baja un escalón (`.titleWhere`, hasta 5,5rem). En B sobraba espacio entre un nombre corto ("Agua") y el dibujo siguiente: los paneles tenían el ancho de la pantalla y una columna fija para el nombre. Ahora cada panel ocupa su ancho real, dibujo y nombre centrados, con un hueco fijo entre paneles (10vw en escritorio), y **`ScrollTrack`** (`storytelling/ScrollScene`) mide los paneles y desplaza la pista para centrar cada uno en su momento: progreso (0,55 + i) / 2,55, igual que antes, así los tramos de las animaciones no cambian. Escribe `translate` directamente; con movimiento reducido no actúa.
- **Escena B sin textos que compitan (2026-10-08):** con el dibujo a la izquierda y el nombre a la derecha, la fila se leía "[dibujo] Agua [dibujo] Agroalimentación": cada nombre quedaba entre dos dibujos y el desplazamiento horizontal del nombre (14vw) lo acercaba al dibujo siguiente. Ahora cada sector es una columna (nombre sobre su dibujo, alineados a la izquierda), con un hueco entre sectores muy superior al de dentro (16vw en escritorio, tres medianiles en móvil). Solo el sector centrado va a opacidad completa; los vecinos se atenúan al 28 %. El nombre entra en vertical. Sin numeración, como en A. El titular y los nombres se separan entre 32 y 64 px (7svh). Las tres animaciones de sector pasan a un encuadre de 1000 x 800 con el contenido subido (capa nula "framing"), para que el dibujo empiece justo bajo su nombre. Medido recorriendo el scroll de 0 a 1 en 1512 x 734, 1100 x 600 (lienzo de Storybook) y 390 x 700: ningún texto se superpone a otro elemento y la distancia mínima es de 42 px. Arreglos encontrados al medir: un tramo de parallax de longitud cero dividía por cero en CSS y escalaba el panel a 0 (`ParallaxLayer` lo convierte en escalón), y en móvil el dibujo tomaba los 1000 px del SVG como ancho (columna `minmax(0, 1fr)`).
- **Nada antes de tiempo (2026-10-08):** el propietario vio el depósito y la bomba del agua mientras la escena aún entraba, antes de que el titular se fijara. Ahora el primer fotograma de las cuatro animaciones está vacío. En los sectores, los equipos se dibujan en los primeros 30 fotogramas y el resto de capas (tuberías, caudal, gráfica, sensores, relaciones) se retrasa con el inicio de capa de Lottie (`st`, nuevo en el builder), sin retocar sus claves. En A, la tubería se abre desde el centro y el sensor aparece en los primeros 26 fotogramas, y el caudal y las ondas empiezan después. En la página, el primer sector parte de opacidad 0 y aparece en el primer 6 % del recorrido, ya con la escena fijada. Comprobado en Storybook: al entrar, solo el titular.
- **En la home (2026-10-08, aprobado por el propietario):** Visión cierra con las dos escenas a ancho completo, fuera del `Container`: primero A ("Hacia dónde vamos") y después B ("Dónde empezamos"). Se retiró el bloque rechazado (`ScaleRings`, `Schematic`, `sectorDrawings.tsx`, `useRevealOnce` y el contenido `vision.where`). El storyboard del caso del agua (`waterCase/`, `vision.waterCase`, `vision.direction`) sigue solo en Storybook, sin usar en la home.
- **Responsive, comprobado en la home real:** 1512 x 734, 1280 x 720, 768 x 740 y 390 x 740, sin scroll horizontal en ninguno. El escenario deja sitio a la franja fija del logo en todos los tamaños (`--frame-inset` + `--frame-bar`) y, por debajo de 60rem, también a la barra de secciones, que pasa abajo (mismo corte que `FloatingSectionNav`). En tableta y móvil el dibujo de cada sector se ajusta al ancho y se alinea arriba a la izquierda con su nombre (`ScrubLottie align="start"`). Con movimiento reducido el escenario recorta con `overflow: clip`, así la rejilla de fondo no ensancha la página. Ningún ancestro tiene `overflow`, así que `sticky` funciona con Lenis.
- **Peso:** 190 KB de HTML exportado (43 KB con gzip), menos que antes. Las animaciones se cargan aparte y solo al acercarse a la pantalla.

**Componentes nuevos (2026-10-08):**

- **`useRevealOnce`** (`lib/hooks`): la lógica de entrada de ProcessFlowReveal convertida en hook. Devuelve `static`, `armed` o `play`, y cada componente lo vuelca en `data-reveal` para que la animación sea solo CSS. ProcessFlowReveal no se ha migrado: su reproducción paso a paso tiene estado propio.
- **ScaleRings** (`data-display`): niveles concéntricos alrededor de una señal, con `currentIndex` y marcadores numerados opcionales. Las señales de cada anillo son deterministas y se apartan de la etiqueta y del marcador. Solo se dibujan relaciones dentro de lo cubierto.
- **Schematic** (`data-display`): marco de un esquema tipo P&ID (`role="img"` con descripción y revelado) y sus piezas: `Equipment` (`line`, `detail`, `guide`, `fill`), `Instrument`, `SignalLink`, `Trace` y `Annotation`. El marco es cliente y las piezas no, para que los dibujos se rendericen en servidor.
- **ProcessFlow:** `meta` opcional por paso (etiqueta mono sobre el título, centrada con el nodo). Los tramos no alcanzados pasan a ser discontinuos en todas las instancias; en la cadena de Visión solo se ve mientras se reproduce.
- **Texto en SVG:** igual que en NodeGraph, crece con container queries en contenedores pequeños. En Schematic, las anotaciones crecen menos y sin tracking porque van entre guías ("Fase 1", "Phase 1").

**NodeGraph y texto:** dentro de un SVG el texto escala con el gráfico. Las etiquetas crecen con container queries en contenedores pequeños (ajustado para un viewBox de unos 640 unidades): 17, 21 y 26 unidades por debajo de 520, 380 y 300 px, unos 10 px en pantalla en un teléfono de 320.

**Escenas de Visión en isométrico "anatomy" (2026-10-13, en la home por decisión del propietario):**

Las cuatro animaciones Lottie de las escenas A y B se han rehecho con la skill `anatomy`: los mismos storyboards (mismos tramos de progreso, mismas cámaras, mismas palabras de etapa), dibujados como maquetas isométricas de objetos reales en lugar de esquemas P&ID. La home usa estas (`SCENE_DRAWING` en `Vision.tsx`); las Lottie, sus JSON y `scripts/lottie/` siguen intactos y vuelven con `"lottie"`.

- **Qué representa cada una:**
  - _Agua_: estación de bombeo sobre un banco. Depósito con indicador de nivel de flotador, bomba en línea, toma de presión y retención, cruz y cinco líneas a arquetas (dos con válvula de compuerta y caudalímetro). La red se tiende desde el depósito, el agua la recorre, el nivel baja; LT, PT y dos FT se relacionan.
  - _Agroalimentación_: tanque por lotes con camisa, abierto por un lado (se ve subir el líquido y girar la turbina), accionamiento arriba, línea de llenado (fluye solo mientras se llena) y vapor a la camisa con válvula de control (fluye solo en la fase 2). Al lado, un registrador cuya pantalla muestra el rango esperado por fase y la temperatura medida. ST, TT y LT; el TT llega al registrador.
  - _Metalurgia_: horno de recalentar y desbaste de dos cajas. La pieza (12 → 9 → 7 de espesor, mismo ancho) se estira al pasar cada mordida, con conservación de volumen; rodillos y cilindros giran con la velocidad del metal en su sitio. Temperatura en la bóveda, vibración en la caja 1 y energía en la caja 2.
  - _Hacia dónde vamos_: zoom de potencias de diez sobre un mundo único. Transmisor de presión en su carrete (su pantalla muestra la señal), el skid de proceso con seis señales relacionadas (Hoy), la planta con el skid en cobalto y su límite dibujado alrededor (Siguiente) y varias plantas en red sobre un banco, con señales que salen de la nuestra (Objetivo).
- **Cómo se construye:** `node scripts/anatomy/build.mjs [id] [--audit]`. El kit de la skill está copiado en `scripts/anatomy/kit` (sin formatear ni lintar). Cada figura registra la forma real de cada pieza: el orden de pintado sale de la geometría (`settle`) y `--audit` prueba que no hay tuberías atravesando nada, piezas flotando o hundidas, ni cruces mal ordenados. Las cuatro pasan el audit y la comprobación de finales de línea de la skill.
- **Salida:** `public/animations/anatomy/<id>.svg` (dibujo estático, datos de trazado en pasos relativos) y `<id>.json` (línea de tiempo). Con gzip: agua 53 KB, agroalimentación 41 KB, metalurgia 29 KB, zoom 103 KB (las Lottie eran de 2 a 13 KB). Se cargan fuera del scroll: ver «Rendimiento del scroll con las figuras anatomy».
- **Zoom por niveles:** el zoom es de unas 200 veces. Cada nivel (transmisor, skid, planta, red) se dibuja a su propia escala y la cámara escala cada grupo, así cada pieza conserva su precisión. Los niveles fuera de cuadro no se dibujan (`display: none`), y el skid detallado cede el sitio a una versión pequeña en cobalto al pasar a la planta.
- **Todo va con el scroll:** `ScrubFigure` (`data-display`) carga el SVG y la línea de tiempo y sigue el progreso de la escena con el mismo suavizado que `ScrubLottie`. También lo que se repite (ventilador, caudal, turbina, la señal en la pantalla, los trazos de las relaciones) avanza con el progreso: cada figura recorre `span` segundos de movimiento de 0 a 1 (8 en los sectores, 30 en el zoom). Si la página no se mueve, la figura tampoco: comprobado en la home con capturas repetidas idénticas. Movimiento reducido: estado final. `player.ts` no depende de React; el build lo inyecta en las vistas previas (`?play` recorre el progreso solo).
- **Colores:** los tonos del kit salen de los tokens semánticos (papel, bordes, texto) y el único acento es el cobalto, con el mismo significado que en las Lottie: lo que lee ATLAXIA (instrumentos, relaciones, caudal). Sin colores de estado: la pieza caliente de metalurgia va en neutro para no chocar con el ámbar de desviación.
- **Interruptor:** `WhereScene` y `SectorsScene` aceptan `drawing="lottie" | "anatomy"` (por defecto `lottie`); la home pasa `"anatomy"`. Storybook: "Sections/Vision scenes" (ambas versiones, ES, EN y móvil) y "Data display/ScrubFigure".
- **Vistas previas:** `scripts/anatomy/preview/<id>.html` (fuera de git) con la lámina de la skill y un deslizador de progreso, para `capture`, `drive` y `lines` de la skill.

**Rendimiento del scroll con las figuras anatomy (2026-10-13):**

Con scroll rápido por Visión la página daba tirones cuando aparecían las figuras. Se midió antes de tocar nada y después de cada cambio, en Chrome real (no headless) controlado por CDP: rueda a unos 5.000 px/s con Lenis activo, desde cuatro pantallas antes de la escena A hasta el final de la B. Escritorio 1440 × 900 a 2x con la CPU normal (M1 Pro, 120 Hz) y 4 veces más lenta; móvil 390 × 844 a 3x con gestos táctiles y CPU 4×. Long Animation Frames, intervalos entre rAF y una traza de rendimiento por pasada. Mediana de 3 pasadas, antes y después seguidas en la misma sesión (entre sesiones hay hasta un 10 % de deriva).

- **Causas confirmadas** (por traza y quitando una cosa cada vez):
  - _Restilado de figuras enteras en cada frame._ `--scene-progress` cambia en cada frame y se hereda, así que se restilaban los 1.600 a 3.600 elementos de cada figura (3.275 por cambio en la escena A). En la B, además, el `--t` de las ParallaxLayer que envuelven cada sector, también heredado y dependiente del progreso: 3.552 elementos por frame.
  - _Estilo y layout forzados a mitad de frame._ Cada escena leía `getBoundingClientRect` en su rAF después de que la figura escribiera en el suyo: 31 ms por frame a 4×.
  - _Máscaras SVG._ Cada relación se dibuja a través de una máscara (un trazo ancho de su propia línea) que se compone fuera de pantalla en cada repintado, y las relaciones repintan en cada frame porque sus trazos corren. Sin máscaras, el tiempo de GPU bajaba a la mitad.
  - _Carga en mitad de la escena._ Los sectores 2 y 3 están a los lados del carril horizontal y el IntersectionObserver (margen solo vertical) los cargaba en mitad de la escena B: frames de 104 a 127 ms a 4×.
  - _Cientos de puntos de textura con `opacity`._ Cada uno es su propio efecto de composición y la página volvía a repartir capas (layerize) en cada frame.
- **Descartado por medida:** el desenfoque del halo (−2 % de GPU una vez arregladas las máscaras), `vector-effect: non-scaling-stroke` (solo cuesta layout y el zoom lo necesita), el `mask-image` de borde de la escena A, el `mix-blend-mode` de los líquidos y la doble suavización con Lenis (el coste está en cada seek, no en el bucle).
- **Cambios:**
  1. `ScrubFigure.module.css`: `--scene-progress: initial` en el marco de la figura. Nada dentro lo lee.
  2. `ParallaxLayer`: su progreso pasa a `--parallax-t`, registrado con `@property` como no heredado; solo lo lee la propia capa. Mismos valores calculados (comprobado en la escena B).
  3. `ScrollScene`: un solo bucle para todas las escenas. En cada frame mide todas y después publica, y `SceneProgress.frame()` deja que quien suaviza (ScrubFigure) dé su paso en ese mismo frame, después de las lecturas. ScrubFigure ya no tiene rAF propio, y el player no hace nada si el progreso no cambia.
  4. `player.ts`: en una pista de dibujo cuyo trazo es el de una máscara, la línea enmascarada se oculta hasta que empieza a dibujarse y la máscara se retira al completarse.
  5. `ScrubFigure/loader.ts`: los archivos se piden cuando la página ha cargado y está ociosa (con Save-Data, solo al acercarse). Cada figura se parsea en un `<template>` (inerte) y entra en su propio intervalo ocioso, una cada vez y con un frame dibujado entre dos, ya posicionada: el seek va antes de insertarla, así lo que todavía no se ve nunca se estila. Una figura que se acerca a la pantalla pasa delante. A 4×, la del zoom cuesta una tarea de 38 ms y un primer frame de 51 ms poco después de cargar, con la página en el hero; no se ha troceado más.
  6. Puntos de textura con `fill-opacity` en lugar de `opacity`: los mismos píxeles (un punto no tiene trazo), sin un efecto por punto.
- **Resultado** (antes → después):

  Mediana de 3 pasadas, código final, antes y después seguidos. "Ocupado" es el tiempo del hilo principal durante el recorrido; los frames lentos superan 1,5 veces el intervalo de refresco (120 Hz).

  | | Escritorio, CPU normal | Escritorio, CPU 4× | Móvil, CPU 4× |
  | --- | --- | --- | --- |
  | Frames de más de 50 ms | 0 → 0 | 20 → 0 | 27 → 0 |
  | Long Animation Frames | 0 → 0 | 13 → 0 | 26 → 0 |
  | Tareas largas | 0 → 0 | 18 → 0 | 22 → 0 |
  | Frame más largo | 42 → 17 ms | 142 → 41 ms | 125 → 42 ms |
  | Frames lentos | 65 → 1 | | |
  | Tiempo perdido en frames lentos | 701 → 8 ms | 1.852 → 1.087 ms | 2.940 → 2.118 ms |
  | Hilo principal ocupado | 1.987 → 1.479 ms | 3.773 → 3.133 ms | 6.234 → 5.367 ms |
  | Script | 725 → 281 ms | 1.432 → 687 ms | 1.836 → 1.017 ms |
  | Recálculo de estilo | 735 → 181 ms | 1.120 → 425 ms | 1.426 → 588 ms |
  | GPU (hilo principal) | 1.541 → 1.100 ms | | |

  Paso a paso (escritorio; cada fila incluye las anteriores; entre filas hay deriva de sesión):

  | Paso | CPU 4×: frames de más de 50 ms | CPU 4×: ocupado | CPU normal: frames lentos | CPU normal: GPU |
  | --- | --- | --- | --- | --- |
  | Antes | 20 | 3.807 ms | 63 | 1.482 ms |
  | 1. Figura aislada de `--scene-progress` | 13 | 3.666 ms | 42 | 1.611 ms |
  | 2. Bucle único de escenas | 11 | 3.343 ms | 41 | 1.630 ms |
  | 3. `--parallax-t` no heredado | 4 | 3.302 ms | 39 | 1.643 ms |
  | 4. Máscaras solo mientras dibujan | 4 | 3.177 ms | 5 | 1.088 ms |
  | 5. Carga en tiempo ocioso | 0 | 3.291 ms | 1 | 1.099 ms |
  | 6. Puntos con `fill-opacity` | 0 | 3.105 ms | 1 | 1.128 ms |

  Empezando el scroll justo al cargar la página (CPU 4×), las cuatro figuras ya están dentro antes de llegar a la escena: 0 tareas largas (antes 18) y frame más largo de 34 ms (antes 124).

- **Comprobación visual:** capturas de las dos escenas en 15 puntos de progreso, antes y después. Solo diferencias de antialiasing: bordes de algunos trazos de la línea de límite de la planta y de los extremos de las relaciones, y redondeo en el skid mientras se desvanece (como máximo 73 de 255 en píxeles sueltos). Ninguna forma cambia.
- **Probado y descartado:** `contain: size layout style` en el marco de la figura (alrededor de un 3 % menos de hilo principal, pero desplaza la figura de la escena A una fracción de píxel) y una capa de composición propia para el SVG (más GPU, sin ganancia clara).
- **Límite actual:** a 4× los frames de las escenas siguen en unos 33 ms (sin figuras, unos 17 ms). Lo que queda es layerize, pintado y layout de miles de trazados que cambian con el scroll. Bajar más pide figuras con menos elementos (el builder y `--audit`), con riesgo de cambiar el dibujo.

---

## Pendientes técnicos

- **Tags en modo claro:** cinco tonos están por debajo de 4,5:1 por decisión de consistencia. Tenerlo en cuenta en las capturas o réplicas del producto (etiquetas cortas, nunca como único portador de información: el icono y el texto ya lo cubren).
- **Destino de despliegue de v2:** el soporte de `NEXT_PUBLIC_BASE_PATH` está preparado. CI no se configura hasta decidirlo.
