# ATLAXIA v2: referencias estudiadas

Observado en las webs reales (Chrome, 2026-09-29). Son patrones que se extraen, no diseños que se copian.

## Qué quiere el propietario de cada referencia (2026-09-30)

Las referencias son por sección, no todas para el hero.

| Referencia | Qué se rescata | Dónde se aplica | Estado |
|---|---|---|---|
| Cerebrium | La sección WHY, el scroll con inercia y la composición del hero | Visión (StickyIndexStory), toda la página (Lenis) y hero | Hecho |
| Anveril | El gráfico "from vision": una animación Lottie de cómo los nodos de la GNN razonan sobre las alertas | Bloque "De datos a comprensión" | Pendiente de capturas (la intro no avanza en pestaña oculta) |
| uAvionix | Contarlo todo como una historia; una industria en la que se ven distintas cosas, como recurso visual o animación Lottie | Hero y narrativa general | Pendiente de capturas (3D bloquea la extensión) |
| Matta | La estética de planos técnicos | Hero (marco y dibujo) y paneles de ilustración | Hecho con la captura del hero |
| Prolibu | Todos los componentes animados, cada animación con un porqué | Todos los componentes | Pendiente de capturas de las animaciones |
| Vectr | Animación de estilo industrial, sin 3D para no penalizar la carga | Hero | Pendiente de capturas |
| Boiler Lab | La barra de navegación inferior y la tipografía | Navegación (hecho) y fuente Overused Grotesk (hecho) | Hecho |
| Radiant | La forma de enseñar sus productos | Qué estamos construyendo (LayerStack) | Hecho |
| Rig | La parte de book a demo | Contacto | Hecho |

### Patrones observados que se han usado

- **Cerebrium, WHY:** índice fijo a la izquierda con las razones en tipografía grande; la activa en color de texto, el resto atenuado; a la derecha, paneles con visual, título y texto que pasan con el scroll. Usa Lenis (`html.lenis`).
- **Radiant, producto:** capas numeradas apiladas con iconos de línea y etiquetas monoespaciadas, conectadas a una columna transversal (su FlightDeck); marco fino con marcas en las esquinas.
- **Rig, book a demo:** bloque oscuro a sangre con una malla de alambre ondulada, frase centrada en dos líneas y un botón ancho con esquina achaflanada e icono de retorno.
- **Boiler Lab:** Overused Grotesk (400 a 600) con JetBrains Mono para las etiquetas.
- **Cómo animan las referencias (2026-10-08, revisado en su código):**
  - **Anveril** usa dotLottie (`@lottiefiles/dotlottie-web`, WASM sobre canvas). Su bloque "From Vision / To Systems" va fijado, con cuatro Lottie de 520 x 520 a 60 fps (84 a 144 fotogramas, 74 a 167 KB, 437 capas: una por punto de la matriz), una frase que se revela letra a letra y un índice de pasos. Sus sectores: índice pequeño, una imagen con transición pixelada en canvas y una frase que se escribe sola.
  - **Prolibu** usa Lenis, Three.js y animaciones isométricas propias en JSON (cajas y fotogramas clave, 5 a 13 KB), no Lottie.
  - **uAvionix** es WebGL con modelos .glb y un scroll de 53.000 px.
  - En ATLAXIA: escena fijada y avance por scroll como Anveril, pero con lottie-web ligero (SVG) en vez de dotLottie (WASM de unos 500 KB), porque los dibujos son de líneas y pocas capas.
- **Vectr, proceso e industrias (2026-10-08):** lista de pasos numerados 01 a 04 donde el activo se destaca y se despliega; en la página de industrias, índice de sectores con una ficha por sector (foto, título y lista con líneas finas). En "Hacia dónde vamos" se usan la numeración con un paso actual destacado (hoja de ruta) y una ficha por sector, con dibujo técnico en lugar de foto. Sus líneas de construcción discontinuas marcan aquí lo que aún no se ha alcanzado.

## Patrones del hero (primera ronda)

| Referencia | Visto | Patrones |
|---|---|---|
| Cerebrium | Sí | Titular gigante como protagonista, **en líneas desplazadas** ("Real-time AI / that / scales with you"); una palabra en color de acento; párrafo corto y CTAs abajo a la derecha; botones con texto en mayúsculas monoespaciadas; navegación en píldora compacta |
| Anveril | Parcial (la intro no avanza en pestaña oculta) | Escena mínima de entrada: símbolo centrado y la frase **repartida en los bordes** ("A NEW CLASS" arriba, "OF ENTERPRISE" abajo) en mayúsculas monoespaciadas; narrativa que avanza con el scroll |
| uAvionix | No (carga 3D bloquea la captura) | Solo se vio el cargador: silueta del sistema en oscuro y "LOADING ASSETS" monoespaciado |
| Matta | No (WebGL bloquea la captura) | Pendiente: pedir capturas al propietario |
| Prolibu | Sí | Etiqueta monoespaciada sobre el titular ("SUITE DE VENTAS"); titular centrado con **palabra clave en negrita**; formas geométricas grandes de fondo; indicador de scroll; navegación en píldora oscura flotante |
| Vectr | Sí | Fondo claro gris azulado (muy cercano al papel de ATLAXIA); titular grande y oscuro centrado; **líneas de construcción punteadas** (elipses tipo órbita o plano) cruzando la escena; objetos industriales tenues; "Scroll to discover our process" monoespaciado y subrayado |
| Boiler Lab | Sí | Titular enorme centrado; subtítulo y "SCROLL DOWN TO EXPLORE" en mayúsculas monoespaciadas muy espaciadas; **navegación inferior como carril a todo el ancho** con las secciones sobre una línea |
| Radiant | Sí | Fondo negro; navegación en mayúsculas monoespaciadas con un solo CTA en color; **titular que aparece línea a línea con máscara**; palabras clave en color de acento |
| Rig | Sí | Fondo cobalto a sangre con textura de líneas de escaneo; **símbolo gigante recortado detrás**; titular enorme; botones con esquina achaflanada; **ticker monoespaciado** abajo; líneas verticales que enmarcan el contenedor |

## Rasgos comunes

1. **La tipografía es el héroe:** titulares de 6 a 9vw. Nunca una tarjeta de producto al lado.
2. **Microetiquetas monoespaciadas en mayúsculas:** encima del titular, en los bordes, en CTAs y en las señales de scroll.
3. **Una capa gráfica de fondo con función identitaria:** líneas de construcción (Vectr), símbolo recortado (Rig), geometría (Prolibu).
4. **Movimiento de entrada con propósito:** revelado por líneas (Radiant) o escena que avanza con scroll (Anveril).
5. **Una palabra en acento** dentro del titular (Cerebrium, Radiant, Prolibu).

## Aplicación en ATLAXIA (hero v3, 2026-10-01)

Con las capturas de Cerebrium y Matta que pasó el propietario.

| Elemento | De dónde sale |
|---|---|
| Hoja enmarcada con líneas finas; logo en una celda oscura sobre el marco | Matta |
| Titular grande de un solo color abajo a la izquierda; frase corta y dos botones abajo a la derecha | Cerebrium |
| Ilustración técnica de líneas con mucho aire alrededor | Matta |
| Pieza gráfica protagonista detrás del titular, con luz suave | Cerebrium (sus cintas 3D, traducidas a un dibujo plano y ligero) |
| Revelado del titular línea a línea con máscara | Radiant |
| Navegación flotante inferior (ya existente) | Boiler Lab |

Se quitó del hero: eyebrow, palabra en acento, cajetín y anotaciones con números.

La paleta sigue siendo clara (papel y cobalto) por consistencia con el producto.
