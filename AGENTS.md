# ATLAXIA v2 — AGENTS.md

## 1. Propósito de este archivo

Este documento define cómo debe trabajar cualquier agente de desarrollo dentro del repositorio de ATLAXIA para construir la versión 2.0 de la web corporativa.

La v2 se desarrollará **dentro del repositorio actual**, pero aislada en una carpeta llamada:

```text
/v2
```

La carpeta `/v2` será añadida a `.gitignore` por el propietario del repositorio mientras dure esta fase de exploración y desarrollo.

El repositorio actual puede y debe consultarse como fuente de contexto para entender:

- stack técnico actual;
- estructura del proyecto;
- contenido de la web existente;
- assets disponibles;
- estilos y decisiones visuales previas;
- componentes que puedan aportar contexto;
- textos actualmente publicados;
- enlaces, demos, imágenes y recursos existentes.

Sin embargo, salvo instrucción explícita, **no se debe modificar, refactorizar, eliminar, mover ni romper ningún archivo de la web actual fuera de `/v2`**.

La web actual se considera **legacy de referencia**, no base que haya que preservar arquitectónicamente.

---

## 2. Objetivo de ATLAXIA v2

La nueva web debe dejar de presentar ATLAXIA como si la empresa fuese únicamente su actual software de supervisión y detección de anomalías.

La narrativa principal debe ser:

> ATLAXIA es una empresa tecnológica orientada a construir software, inteligencia aplicada y herramientas de visualización para entornos industriales complejos. El producto actual es la primera demostración concreta de esas capacidades, no la definición completa de la empresa.

La arquitectura debe quedar preparada para que, en el futuro, la sección actual de "Qué estamos construyendo" pueda evolucionar a "Productos" sin rehacer la identidad ni la estructura completa de la web.

---

## 3. Idiomas

La web será bilingüe.

### Idioma principal

El idioma por defecto es:

```text
español
```

La primera visita debe renderizar la web en español.

### Idioma secundario

Debe existir una opción visible y accesible para cambiar a:

```text
English
```

Requisitos:

- el cambio debe hacerse mediante un selector claro, por ejemplo `ES / EN`;
- no usar traducción automática en runtime;
- todo el contenido visible debe salir de una capa de contenido/i18n;
- evitar strings de interfaz hardcodeados directamente dentro de componentes reutilizables;
- guardar la preferencia del usuario de forma local si tiene sentido;
- actualizar correctamente el atributo `lang` del documento;
- español debe seguir siendo el fallback;
- el contenido inglés debe transmitir el mismo significado y tono, no ser una traducción literal torpe;
- no usar banderas como único mecanismo para representar idiomas.

Arquitectura orientativa:

```text
src/
  content/
    es/
    en/
```

o una alternativa equivalente si el stack existente justifica otra solución.

---

## 4. Arquitectura narrativa de la home

La home debe ser larga, sencilla y narrativa.

El menú principal debe navegar por scroll a cinco grandes bloques:

```text
Visión
Qué hacemos
Qué estamos construyendo
Quiénes somos
Contacto
```

El hero actúa como introducción y no necesita figurar como elemento de navegación.

Puede haber bloques narrativos o transiciones adicionales entre estas secciones sin que necesariamente aparezcan en el menú.

### Orden conceptual

```text
Hero
↓
Visión
↓
Qué hacemos
↓
Transición narrativa / From data to understanding
↓
Qué estamos construyendo
↓
Quiénes somos
↓
Contacto
```

La lógica narrativa general debe ser:

```text
empresa
→ visión
→ capacidades
→ evidencia
→ producto actual
→ origen y equipo
→ conversación
```

No:

```text
producto
→ features
→ demo
→ contacto
```

---

## 5. Hero

El hero debe explicar qué es ATLAXIA sin entrar inmediatamente en GNN, SCADA o detección de anomalías.

Debe situar a ATLAXIA en un territorio aproximado como:

- tecnología para sistemas industriales complejos;
- software industrial;
- inteligencia aplicada;
- comprensión de datos y comportamiento;
- herramientas para las personas que operan esos sistemas.

Evitar titulares vacíos del tipo:

- "revolucionamos la industria";
- "transformamos el futuro con IA";
- "next-generation AI";
- "disruptive technology";
- cualquier frase que no pueda sostenerse con evidencia.

El hero puede utilizar un recurso gráfico técnico ligero:

- nodos;
- señales;
- sensores;
- relaciones;
- diagramas;
- gráficas;
- anotaciones;
- UI industrial;
- planos o retículas.

Evitar visuales 3D pesados y recursos genéricos de "IA futurista".

---

## 6. Visión

Debe responder:

- por qué existe ATLAXIA;
- qué problemas generales quiere resolver;
- cómo entiende los sistemas industriales complejos;
- hacia dónde quiere llevar la empresa.

No debe convertirse todavía en la explicación detallada del producto actual.

Idea narrativa de referencia:

```text
Datos
→ Contexto
→ Comportamiento
→ Comprensión
→ Acción
```

Se puede representar mediante una animación progresiva al hacer scroll.

Regla:

> La visión debe describir una tesis de empresa que siga siendo válida aunque el producto actual cambie.

---

## 7. Qué hacemos

Debe definir las capacidades generales de ATLAXIA como empresa.

Capacidades iniciales:

1. Software industrial
2. Inteligencia aplicada
3. Visualización de datos complejos
4. Investigación aplicada

No presentar estas capacidades como una lista de servicios de consultora.

Cada afirmación debería estar acompañada, cuando sea posible, por una prueba visual real.

Principio de diseño y contenido:

> No claim without evidence.

Ejemplos:

- si se habla de software industrial, mostrar interfaz;
- si se habla de inteligencia aplicada, mostrar modelos, relaciones o salidas;
- si se habla de visualización compleja, mostrar dashboards o gráficas;
- si se habla de investigación, mostrar origen, universidad, proyectos, publicaciones o evidencias reales disponibles.

No inventar clientes, pilotos, métricas, colaboraciones, premios ni resultados.

---

## 8. Bloque narrativo: de datos industriales a comprensión

Entre "Qué hacemos" y "Qué estamos construyendo" puede existir una transición visual que explique cómo ATLAXIA entiende el problema.

Concepto aproximado:

```text
SENSORES
● ● ● ● ●

↓ relaciones

●───●
│ ╲ │
●───●

↓ comportamiento esperado

Observed
Expected

↓ desviación

Anomaly

↓ comprensión

variable
desviación
relaciones relevantes
contexto
```

Este bloque debe ayudar a explicar la lógica detrás del análisis relacional/GNN sin necesitar un muro de texto.

Preferencia técnica:

- SVG;
- React;
- Motion o una solución equivalente;
- animaciones ligadas al scroll cuando aporten comprensión.

Lottie puede utilizarse para ilustraciones cerradas y predefinidas, pero no debe ser la solución por defecto para interacciones que deban responder a datos, estado o scroll.

---

## 9. Qué estamos construyendo

Aquí sí se presenta el producto actual.

Debe entenderse como:

- primer producto;
- primer foco;
- primera materialización de las capacidades de ATLAXIA.

No llamarlo "prototipo" como encabezado principal.

Aquí se puede explicar:

- supervisión industrial;
- valores observados y esperados;
- históricos;
- detección de desviaciones;
- relaciones entre señales;
- grafos;
- IA/GNN;
- explicación de anomalías;
- dashboard;
- eventos;
- operación on-premise/edge;
- funcionamiento en paralelo al SCADA;
- capturas reales;
- vídeo;
- demo.

Siempre verificar el contenido existente del repositorio antes de redactar detalles técnicos nuevos.

Una estructura visual recomendada es un storytelling sticky:

```text
01 Monitorizar
02 Entender
03 Relacionar
04 Investigar
05 Desplegar
```

La interfaz o visual principal puede ir cambiando conforme avanza el scroll.

---

## 10. Quiénes somos

Esta sección debe tener peso.

ATLAXIA es una startup pequeña y parte de la credibilidad actual está en:

- quién está detrás;
- de dónde nace;
- investigación previa;
- relación con universidad;
- proyectos;
- premios;
- trayectoria técnica;
- experiencia relevante.

No convertir la sección en tres CV completos.

Estructura preferente:

```text
Origen de ATLAXIA
↓
Investigación / problema industrial / tecnología
↓
Evidencias y reconocimientos reales
↓
Equipo
```

Para cada miembro:

- foto;
- nombre;
- rol;
- una frase corta sobre su aportación;
- enlace profesional si ya existe en el proyecto o ha sido proporcionado.

No inventar biografías.

---

## 11. Contacto

No debe limitarse a "Solicitar demo".

Debe permitir diferentes intenciones:

```text
Quiero conocer el producto
Quiero colaborar con ATLAXIA
Investigación / universidad
Partnerships
Otra consulta
```

"Solicitar demo" sigue siendo una opción comercial importante.

El componente de contacto debe poder enrutar o etiquetar la intención sin necesitar formularios completamente distintos.

---

## 12. Dirección visual

La identidad debe alejarse del aspecto genérico de startup de IA.

Evitar como lenguaje dominante:

- orbes brillantes;
- gradientes sin función;
- renders abstractos de IA;
- 3D pesado;
- imágenes de stock;
- fábricas genéricas;
- robots humanoides;
- exceso de glassmorphism;
- animaciones únicamente decorativas.

Priorizar:

- diagramas técnicos;
- planos;
- grids;
- coordenadas;
- etiquetas;
- sensores;
- líneas de relación;
- nodos;
- señales;
- gráficas;
- timelines;
- interfaces reales;
- capturas del producto;
- elementos de sistemas industriales;
- visualización de datos.

La sensación debe estar más cerca de:

```text
industrial
técnico
preciso
contemporáneo
sobrio
humano
```

que de:

```text
cyberpunk
sci-fi
crypto
AI hype
```

---

## 13. Referencias de diseño y qué se rescata de cada una

Estas webs son referencias conceptuales, no plantillas a copiar.

### Cerebrium
https://cerebrium.ai/

Rescatar:

- sección tipo WHY;
- smooth scroll;
- progresión narrativa.

### Anveril
https://anveril.com/

Rescatar:

- narrativa visual;
- transición "from vision";
- animaciones que ayudan a entender conceptos.

Aplicación posible:

- explicar mediante nodos cómo una GNN relaciona señales para razonar sobre alertas.

### uAvionix
https://www.usavionix.com/

Rescatar:

- storytelling;
- presentar distintos elementos dentro de un sistema;
- experiencia visual inmersiva sin copiar su complejidad.

### Matta
https://matta.ai/

Rescatar:

- lenguaje de planos y documentación técnica;
- estética industrial;
- composición visual técnica.

### Prolibu
https://prolibu.com/es/platform/sales/

Rescatar:

- animaciones con un propósito;
- cada componente se mueve por una razón entendible.

### Vectr
https://www.vectrfl.com/

Rescatar:

- lenguaje visual industrial y animación.

No rescatar:

- dependencia de 3D pesado si compromete rendimiento.

### Boiler Lab
https://boilerlab.ai/

Rescatar:

- navegación;
- especialmente la idea de navbar flotante/inferior;
- tipografía y dirección general como inspiración.

### Radiant
https://radiant.co/

Rescatar:

- forma de presentar distintos productos o bloques tecnológicos.

### Rig
https://rig.ai/

Rescatar:

- planteamiento de CTA para demo;
- claridad del flujo comercial.

---

## 14. Component-Driven Development

CDD es una prioridad estructural del proyecto, no una limpieza posterior.

No construir primero páginas monolíticas para después "extraer componentes".

Trabajar desde piezas aisladas y componibles.

Arquitectura orientativa:

```text
src/
  components/
    primitives/
      Button/
      Badge/
      Container/
      Section/
      SectionHeader/
      Surface/
      Divider/

    layout/
      SplitLayout/
      BentoGrid/
      StickyLayout/
      FullBleed/
      HorizontalScroller/

    data-display/
      Metric/
      Timeline/
      NodeGraph/
      SignalChart/
      TechnicalPanel/
      StatusIndicator/

    storytelling/
      ScrollStory/
      StickyStory/
      ProcessFlow/
      EvidenceCard/
      CapabilityCard/
      ProductShowcase/
      TechnicalDiagram/

    navigation/
      FloatingNav/
      LanguageSwitcher/
      SectionNav/

    contact/
      ContactRouter/
      ContactForm/

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

Adaptar nombres a las convenciones reales del stack encontrado, pero mantener la separación conceptual.

---

## 15. Qué es reutilizable y qué no

Un componente de sección específico de ATLAXIA no tiene por qué ser reutilizable.

Ejemplo:

```text
VisionSection
```

puede ser específico.

Sin embargo, las piezas con las que se construye sí deben intentar ser genéricas.

Ejemplos:

```text
ProcessFlow
StickyStory
EvidenceCard
NodeGraph
TechnicalPanel
FloatingSectionNav
LanguageSwitcher
ContactRouter
```

Regla:

> No generalizar prematuramente un componente cuya API todavía no se entiende.

Primero construir una abstracción suficientemente limpia para ATLAXIA y validar que realmente puede funcionar fuera de la web antes de convertirla en componente de librería.

---

## 16. Criterios para que un componente pueda exportarse posteriormente

Un componente candidato a la futura web/librería de componentes debe:

- no contener copy específico de ATLAXIA;
- no depender obligatoriamente de assets de ATLAXIA;
- recibir datos y contenido mediante props o children;
- funcionar con diferentes longitudes de contenido;
- ser responsive;
- ser accesible;
- disponer de estados documentados;
- manejar `prefers-reduced-motion` si incluye movimiento;
- no depender de contexto global innecesario;
- tener una API pequeña y comprensible;
- evitar props booleanas infinitas;
- poder utilizarse en otro proyecto sin copiar media aplicación;
- tener ejemplos claros en Storybook o herramienta equivalente;
- incluir variantes solo cuando representen necesidades reales.

---

## 17. Storybook

Storybook es recomendado para desarrollar y documentar los componentes aislados.

Si el stack actual permite integrarlo sin introducir fricción desproporcionada:

- configurarlo dentro de `/v2`;
- escribir stories para componentes reutilizables;
- cubrir estados relevantes;
- documentar variantes;
- usar controles cuando ayuden a probar APIs;
- incluir estados responsive cuando sea útil.

No es necesario crear una story para cada wrapper trivial.

Prioridad:

- componentes reutilizables;
- componentes con estados;
- componentes animados;
- componentes con APIs configurables.

---

## 18. Sistema de animación

Cada animación debe pertenecer al menos a una de estas categorías:

```text
reveal
transition
focus
feedback
story
```

Si una animación no aporta información, jerarquía, orientación, feedback o narrativa, debe cuestionarse.

Preferencias:

### CSS
Para:

- hover;
- focus;
- fades sencillos;
- transforms básicos;
- transiciones pequeñas.

### Motion
Para:

- scroll;
- SVG;
- layout;
- secuencias;
- animaciones interactivas;
- cambios de estado complejos.

### Lottie
Para:

- ilustraciones cerradas;
- animaciones precompuestas;
- recursos puramente visuales cuyo estado no depende de datos complejos.

### Evitar
- Three.js;
- WebGL;
- 3D pesado;

salvo que exista una razón clara y se autorice explícitamente.

---

## 19. Rendimiento

La web debe sentirse tecnológica sin castigar el tiempo de carga.

Priorizar:

- SVG frente a vídeo o canvas pesado cuando sea suficiente;
- lazy loading;
- imágenes optimizadas;
- formatos modernos;
- carga diferida de vídeo;
- animaciones eficientes;
- evitar listeners de scroll manuales si existe una alternativa más eficiente;
- minimizar dependencias;
- no cargar librerías grandes por un solo efecto;
- mobile-first en decisiones de rendimiento.

El objetivo no es conseguir una puntuación artificial perfecta, sino evitar que la identidad visual haga la web lenta.

---

## 20. Accesibilidad

Obligatorio:

- navegación por teclado;
- focus visible;
- contraste suficiente;
- estructura semántica;
- `aria-*` solo donde aporte valor;
- labels correctas;
- navegación comprensible sin animación;
- `prefers-reduced-motion`;
- textos alternativos adecuados;
- controles de idioma accesibles;
- estados hover que no sean el único modo de revelar información.

Las animaciones narrativas no pueden bloquear el acceso al contenido.

---

## 21. Responsive

No diseñar desktop y "arreglar móvil" al final.

Todos los componentes reutilizables deben contemplar:

- desktop;
- tablet;
- móvil.

El navbar inferior/flotante es una referencia, no una obligación en móvil.

Puede existir:

- navegación inferior en desktop;
- navegación superior/compacta en móvil;

si resulta más usable.

---

## 22. Contenido y tono

La web debe estar escrita en castellano corriente.

Evitar:

- clichés;
- grandilocuencia;
- marketing vacío;
- frases de IA;
- lenguaje de agencia;
- exceso de adjetivos;
- emojis;
- hashtags.

Preferir:

- frases claras;
- argumentos concretos;
- evidencia;
- lenguaje técnico entendible;
- explicar antes que impresionar.

No inventar datos para "rellenar" una sección.

Si falta información real, usar placeholders claramente identificados o dejar el bloque preparado.

---

## 23. Regla de evidencia

Siempre que sea posible:

```text
afirmación
+
prueba visual
```

Ejemplos:

```text
software industrial
→ interfaz

visualización compleja
→ dashboard

investigación
→ proyecto / universidad / publicación / evidencia real

producto
→ demo / captura / vídeo

piloto
→ evidencia real cuando exista
```

No utilizar logotipos de organizaciones sin confirmar que pueden mostrarse públicamente.

---

## 24. Navbar

Dirección preferida:

- flotante;
- compacta;
- con navegación por sección;
- puede explorar una posición inferior en desktop;
- indicar la sección activa;
- incluir selector de idioma;
- contacto claramente accesible.

No forzar esta solución si las pruebas de usabilidad o responsive muestran problemas.

---

## 25. Futuro: sección Productos

La arquitectura debe permitir que:

```text
Qué estamos construyendo
```

evolucione a:

```text
Productos
```

Una posible API conceptual:

```tsx
<ProductShowcase products={products} />
```

No diseñar la home de forma que el producto actual sea una excepción imposible de escalar.

---

## 26. Forma de trabajar del agente

Antes de programar:

1. inspeccionar el repositorio;
2. identificar stack, build system y dependencias;
3. localizar contenido y assets útiles de la web actual;
4. identificar qué partes pueden consultarse sin reutilizar arquitectura legacy;
5. comprobar si ya existe Storybook, Motion, i18n u otra solución equivalente;
6. proponer estructura de `/v2`;
7. detectar riesgos o incompatibilidades.

Después:

1. crear estructura base;
2. definir tokens;
3. preparar i18n;
4. construir primitives;
5. construir layouts;
6. construir storytelling/data-display;
7. construir secciones;
8. componer home;
9. añadir animaciones justificadas;
10. revisar accesibilidad, responsive y rendimiento.

No comenzar construyendo una home monolítica.

---

## 27. Qué NO debe hacer el agente

No:

- modificar la web legacy sin autorización;
- borrar archivos existentes;
- cambiar la configuración raíz del repositorio de forma destructiva;
- inventar contenido empresarial;
- inventar clientes;
- inventar métricas;
- inventar premios;
- inventar pilotos;
- inventar partnerships;
- copiar visualmente una web de referencia;
- añadir 3D por estética;
- hardcodear todo el contenido bilingüe dentro de JSX;
- convertir cada `div` en un componente;
- crear abstracciones sin un caso real;
- sacrificar legibilidad por animación;
- hacer cambios globales de dependencias sin justificarlo.

---

## 28. Decisiones que ya están cerradas

No hace falta volver a preguntar por:

- estructura narrativa general;
- existencia de una home larga;
- menú por secciones;
- español como idioma principal;
- inglés mediante selector;
- CDD como enfoque;
- aislamiento dentro de `/v2`;
- uso del repositorio actual como referencia;
- producto actual presentado como primer producto/foco;
- contacto abierto a distintos perfiles;
- peso importante de "Quiénes somos";
- necesidad de evidencia visual;
- rechazo del 3D pesado;
- dirección visual técnica/industrial;
- futura evolución de "Qué estamos construyendo" a "Productos".

Solo pedir confirmación cuando aparezca una decisión realmente nueva que cambie alcance, identidad, contenido factual o arquitectura.

---

## 29. Definición de terminado para la primera iteración

La primera iteración de arquitectura puede considerarse lista cuando exista:

- `/v2` ejecutable;
- sistema de estilos/tokens base;
- arquitectura de i18n ES/EN;
- selector de idioma funcional;
- navegación por secciones;
- estructura completa de la home;
- contenido inicial real o claramente marcado como pendiente;
- componentes principales aislados;
- Storybook o equivalente para los componentes reutilizables seleccionados;
- responsive funcional;
- `prefers-reduced-motion`;
- ausencia de cambios destructivos en la web legacy;
- documentación suficiente para continuar el desarrollo.

La primera iteración no necesita tener todas las animaciones finales.

Primero arquitectura, contenido y componentes. Después polish.
