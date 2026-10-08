# ATLAXIA v2 — CLAUDE.md

## Contexto

Estás trabajando en la versión 2.0 de la web corporativa de ATLAXIA.

La versión actual vive en este mismo repositorio y debe utilizarse como **fuente de contexto**, no como una arquitectura que haya que copiar.

La nueva versión debe desarrollarse exclusivamente dentro de:

```text
/v2
```

El propietario añadirá `/v2` a `.gitignore` durante esta etapa.

Salvo petición explícita:

- no modifiques archivos fuera de `/v2`;
- no refactorices la web actual;
- no borres assets;
- no cambies configuración legacy;
- no introduzcas cambios destructivos en el repositorio.

Lee también `AGENTS.md`. Si existe cualquier conflicto, prioriza las instrucciones más específicas de este archivo y después `AGENTS.md`.

---

# Resultado esperado

Construir una nueva home corporativa para ATLAXIA que cambie la narrativa de:

```text
ATLAXIA = software de detección de anomalías
```

a:

```text
ATLAXIA = empresa tecnológica para sistemas industriales complejos

producto actual = primera materialización de sus capacidades
```

La home tendrá como bloques principales:

```text
Visión
Qué hacemos
Qué estamos construyendo
Quiénes somos
Contacto
```

Debe funcionar como una única experiencia larga y narrativa con navegación por secciones.

---

# Idiomas

El idioma principal es español.

Debe existir un selector visible:

```text
ES / EN
```

Requisitos:

- español por defecto;
- inglés como idioma secundario;
- contenido desacoplado de los componentes;
- nada importante hardcodeado en JSX si pertenece al contenido;
- persistir preferencia si es razonable;
- actualizar `document.documentElement.lang`;
- español como fallback;
- traducciones inglesas naturales, no traducción automática en runtime.

---

# Antes de escribir código

Haz primero una auditoría breve del repositorio.

Identifica:

1. framework;
2. versión de React si existe;
3. TypeScript;
4. router;
5. sistema de estilos;
6. build tool;
7. package manager;
8. librerías de animación;
9. solución i18n si existe;
10. estructura de assets;
11. dónde está el contenido actual;
12. qué recursos visuales pueden reutilizarse;
13. scripts disponibles;
14. convenciones de lint/format;
15. posibles conflictos al crear `/v2`.

No asumas que el stack es exactamente el que esperas.

Adapta la implementación al stack real siempre que permita cumplir los objetivos.

Si la web actual ya es React + TypeScript, mantén esa dirección salvo que exista una razón técnica fuerte para no hacerlo.

No cambies el stack raíz únicamente por preferencias personales.

---

# Component-Driven Development

CDD es obligatorio.

No empieces creando un `Home.tsx` gigante.

Trabaja aproximadamente en este orden:

```text
tokens
→ primitives
→ layouts
→ data display
→ storytelling
→ sections
→ page
```

Arquitectura conceptual:

```text
src/
  components/
    primitives/
    layout/
    data-display/
    storytelling/
    navigation/
    contact/

  sections/
    Hero/
    Vision/
    Capabilities/
    DataToUnderstanding/
    CurrentProduct/
    Origins/
    Team/
    Contact/

  content/
    es/
    en/

  pages/
    Home/
```

No conviertas cada elemento HTML en componente.

Un componente reutilizable debe tener una razón clara para existir.

---

# Componentes especialmente interesantes

Prioriza una buena arquitectura para piezas que puedan terminar en una librería/web personal de componentes React:

```text
Section
SectionHeader
SplitLayout
StickyLayout
Surface
EvidenceCard
CapabilityCard
ProcessFlow
StickyStory
ScrollStory
NodeGraph
SignalChart
TechnicalPanel
ProductShowcase
FloatingSectionNav
LanguageSwitcher
ContactRouter
```

No todos tienen que implementarse en la primera iteración.

No inventes APIs gigantes antes de tener un caso real.

---

# Storybook

Si es compatible con el stack actual y no introduce una migración absurda:

- instala/configura Storybook dentro de `/v2`;
- crea stories de componentes reutilizables;
- documenta estados y variantes importantes;
- prueba contenido corto/largo;
- prueba casos móviles cuando proceda;
- añade reduced motion en componentes animados.

No uses Storybook como excusa para retrasar la composición de la home.

---

# Narrativa de cada sección

## Hero

Debe decir qué es ATLAXIA como empresa.

No abrir directamente con:

- GNN;
- anomalías;
- SCADA;
- features del producto.

Usar lenguaje relacionado con:

- sistemas industriales complejos;
- software industrial;
- inteligencia aplicada;
- comprensión de datos;
- tecnología industrial.

El visual puede ser técnico y animado, pero ligero.

---

## Visión

Explicar:

- por qué existe ATLAXIA;
- qué limitaciones encuentran en sistemas complejos;
- por qué los datos sin contexto no son suficientes;
- hacia dónde quieren llevar la empresa.

Idea conceptual:

```text
Datos → Contexto → Comportamiento → Comprensión → Acción
```

---

## Qué hacemos

Capacidades:

```text
Software industrial
Inteligencia aplicada
Visualización de datos complejos
Investigación aplicada
```

Cada capacidad debe intentar mostrar evidencia.

No redactes copy de consultora.

---

## Data to Understanding

Bloque narrativo opcional pero recomendado.

Mostrar progresivamente:

```text
sensores
→ relaciones
→ comportamiento esperado
→ desviación
→ contexto
```

Buen candidato para SVG + Motion.

Debe enseñar, no decorar.

---

## Qué estamos construyendo

Aquí aparece el producto actual.

Puede incluir:

- observación vs esperado;
- históricos;
- desviaciones;
- anomalías;
- relaciones;
- grafos;
- GNN;
- dashboards;
- eventos;
- explicación;
- on-premise/edge;
- operación junto al SCADA;
- capturas;
- vídeo;
- demo.

Verifica cada detalle en la web actual o contenido real antes de publicarlo.

Enfoque recomendado:

```text
01 Monitorizar
02 Entender
03 Relacionar
04 Investigar
05 Desplegar
```

Puede implementarse con una narrativa sticky.

---

## Quiénes somos

Dar peso a:

- origen;
- investigación;
- universidad;
- proyectos;
- premios;
- equipo.

No hacer tres currículums.

Primero explicar de dónde sale ATLAXIA y luego presentar a las personas.

No inventes información individual.

---

## Contacto

No ser solo "Book a demo".

Permitir intenciones como:

```text
Producto / demo
Colaboración
Partnership
Investigación / universidad
Otra consulta
```

---

# Dirección visual

ATLAXIA v2 no debe parecer una landing genérica de IA.

Prioriza:

- planos;
- diagramas;
- grids;
- relaciones;
- nodos;
- señales;
- datos;
- gráficas;
- timelines;
- interfaces;
- anotaciones;
- capturas reales.

Evita:

- orbes;
- renders IA genéricos;
- 3D sin función;
- WebGL pesado;
- fábricas de stock;
- glassmorphism indiscriminado;
- gradientes como sustituto de identidad.

Palabras guía:

```text
industrial
técnico
preciso
contemporáneo
sobrio
humano
```

---

# Animación

Toda animación debe justificar al menos una función:

```text
reveal
transition
focus
feedback
story
```

Tecnología preferida:

```text
CSS → microinteracciones
Motion → scroll, SVG, estado, layouts
Lottie → ilustraciones cerradas
```

Evita Three.js/WebGL salvo autorización explícita.

Cumple `prefers-reduced-motion`.

---

# Referencias

No copiar diseños. Extraer patrones.

- Cerebrium — WHY y smooth scroll  
  https://cerebrium.ai/

- Anveril — narrativa visual y transición de visión a sistema  
  https://anveril.com/

- uAvionix — storytelling de sistema  
  https://www.usavionix.com/

- Matta — estética de planos técnicos  
  https://matta.ai/

- Prolibu — animaciones justificadas  
  https://prolibu.com/es/platform/sales/

- Vectr — lenguaje industrial animado, sin asumir 3D  
  https://www.vectrfl.com/

- Boiler Lab — navegación y tipografía  
  https://boilerlab.ai/

- Radiant — presentación de productos  
  https://radiant.co/

- Rig — CTA/demo  
  https://rig.ai/

---

# Copy

Escribir primero en español.

Tono:

- claro;
- natural;
- técnico cuando corresponde;
- sin grandilocuencia;
- sin clichés;
- sin emojis;
- sin frases motivacionales;
- sin lenguaje de agencia.

Regla:

> Si una frase podría estar en la home de cualquier startup de IA cambiando el logo, probablemente no sirve.

La versión inglesa debe mantener ese mismo carácter.

---

# Evidencia

Aplicar siempre que sea posible:

```text
afirmación + evidencia
```

No inventar social proof.

Si no existe evidencia todavía:

- no inventarla;
- preparar el componente;
- marcar el contenido como pendiente;
- o eliminar el claim.

---

# Rendimiento

Evita convertir la web en una demo gráfica pesada.

Prioridades:

- SVG;
- imágenes optimizadas;
- lazy loading;
- vídeo diferido;
- dependencias justificadas;
- animación eficiente;
- mobile-first;
- componentes pequeños;
- evitar re-renders innecesarios.

---

# Accesibilidad

Obligatorio:

- teclado;
- focus;
- contraste;
- semántica;
- labels;
- reduced motion;
- idioma del documento;
- alt text;
- contenido accesible sin depender de hover;
- navegación comprensible sin animación.

---

# Forma de responder mientras desarrollas

Cuando recibas un prompt de trabajo:

1. inspecciona antes de asumir;
2. resume brevemente qué has encontrado;
3. indica qué vas a cambiar;
4. implementa;
5. ejecuta pruebas/lint/build aplicables;
6. resume archivos modificados;
7. identifica decisiones pendientes reales.

No preguntes de nuevo por decisiones ya cerradas en este documento.

Pregunta únicamente si aparece una decisión nueva que afecte a:

- hechos empresariales;
- copy factual;
- identidad;
- alcance;
- arquitectura crítica;
- dependencias destructivas.

Si puedes tomar una decisión técnica reversible y razonable, tómala y documenta el criterio.

---

# Restricción crítica

Fuera de `/v2`, modo lectura por defecto.

No toques legacy salvo que el usuario lo pida explícitamente.
