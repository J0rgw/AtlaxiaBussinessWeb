# ATLAXIA Web v2

Nueva versión de la web corporativa de ATLAXIA.

> Este directorio contiene una reconstrucción completa de la web desde una arquitectura nueva. La web actual del repositorio se utiliza como fuente de contexto y assets, pero no como base que haya que reproducir.

---

## Objetivo

ATLAXIA v2 debe presentar ATLAXIA como una empresa tecnológica que construye tecnología para sistemas industriales complejos.

El producto actual de supervisión y detección de anomalías se presenta como el primer producto/foco de la compañía, no como la definición completa de ATLAXIA.

La arquitectura está diseñada para evolucionar de:

```text
Qué estamos construyendo
```

a:

```text
Productos
```

sin tener que rehacer la identidad corporativa ni la estructura completa de la home.

---

## Estado del proyecto

La nueva versión se desarrolla dentro de:

```text
/v2
```

Durante esta fase, `/v2` se mantendrá fuera del versionado principal mediante `.gitignore`.

La implementación debe consultar la web actual cuando necesite recuperar:

- textos;
- imágenes;
- vídeos;
- enlaces;
- recursos gráficos;
- información del producto;
- información del equipo;
- estructura técnica existente.

No se debe modificar la versión legacy salvo decisión explícita.

---

## Principios

### 1. Empresa antes que producto

La home debe explicar primero:

```text
qué es ATLAXIA
por qué existe
qué sabe construir
```

y después:

```text
qué producto está construyendo actualmente
```

### 2. No claim without evidence

Siempre que sea posible:

```text
afirmación + prueba visual
```

### 3. Component-Driven Development

La interfaz debe desarrollarse desde componentes aislados hacia secciones y páginas.

No crear primero una landing monolítica.

### 4. Movimiento con propósito

Las animaciones deben:

- explicar;
- orientar;
- conectar conceptos;
- dar feedback;
- dirigir atención.

No añadir movimiento únicamente para hacer la web "más moderna".

### 5. Técnica, no genérica

La identidad visual debe apoyarse en:

- diagramas;
- planos;
- nodos;
- relaciones;
- señales;
- dashboards;
- timelines;
- datos;
- interfaces industriales.

No en recursos genéricos de startups de IA.

---

# Arquitectura de contenido

La navegación principal de la home contiene:

```text
Visión
Qué hacemos
Qué estamos construyendo
Quiénes somos
Contacto
```

La página completa sigue aproximadamente esta secuencia:

```text
Hero
↓
Visión
↓
Qué hacemos
↓
De datos industriales a comprensión
↓
Qué estamos construyendo
↓
Origen de ATLAXIA
↓
Equipo
↓
Contacto
```

---

# Idiomas

ATLAXIA v2 es bilingüe.

Idiomas:

```text
ES — principal
EN — secundario
```

Comportamiento esperado:

- español por defecto;
- selector `ES / EN`;
- strings desacoplados de los componentes;
- preferencia persistente cuando sea apropiado;
- atributo `lang` correcto;
- traducciones inglesas editadas, no traducción automática en runtime.

---

# Secciones

## Hero

Debe responder inmediatamente:

> ¿Qué es ATLAXIA?

Sin entrar de primeras en detalles como GNN, SCADA o anomalías.

---

## Visión

Debe responder:

> ¿Por qué existe ATLAXIA?

Narrativa conceptual:

```text
Datos
→ Contexto
→ Comportamiento
→ Comprensión
→ Acción
```

---

## Qué hacemos

Cuatro capacidades iniciales:

```text
Software industrial
Inteligencia aplicada
Visualización de datos complejos
Investigación aplicada
```

No son una lista de servicios comerciales.

Son los territorios tecnológicos donde ATLAXIA construye.

---

## De datos industriales a comprensión

Bloque narrativo/visual que ayuda a explicar:

```text
sensores
→ relaciones
→ comportamiento esperado
→ desviaciones
→ contexto
```

Es un buen candidato para una animación SVG ligada al scroll.

---

## Qué estamos construyendo

Presenta el producto actual.

No utilizar "prototipo" como concepto principal.

Posible narrativa:

```text
01 Monitorizar
02 Entender
03 Relacionar
04 Investigar
05 Desplegar
```

Puede mostrar:

- interfaz;
- gráficas;
- observado vs esperado;
- eventos;
- grafos;
- explicación de anomalías;
- arquitectura edge;
- vídeo;
- demo.

---

## Quiénes somos

Debe explicar primero el origen de ATLAXIA.

Después:

- investigación;
- universidad;
- proyectos;
- premios;
- equipo.

Las personas deben tener presencia, pero no convertir la página en una colección de currículums.

---

## Contacto

Debe servir a:

- clientes;
- posibles partners;
- universidad;
- investigación;
- programas de emprendimiento;
- inversores;
- colaboradores;
- personas interesadas en el producto.

"Solicitar demo" es una opción, no el único destino.

---

# Estructura técnica orientativa

La estructura definitiva debe adaptarse al stack real del repositorio.

Conceptualmente:

```text
v2/
├── src/
│   ├── components/
│   │   ├── primitives/
│   │   ├── layout/
│   │   ├── data-display/
│   │   ├── storytelling/
│   │   ├── navigation/
│   │   └── contact/
│   │
│   ├── sections/
│   │   ├── Hero/
│   │   ├── Vision/
│   │   ├── Capabilities/
│   │   ├── DataToUnderstanding/
│   │   ├── CurrentProduct/
│   │   ├── Origins/
│   │   ├── Team/
│   │   └── Contact/
│   │
│   ├── content/
│   │   ├── es/
│   │   └── en/
│   │
│   ├── pages/
│   │   └── Home/
│   │
│   └── ...
│
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

---

# Componentes candidatos a reutilización

Algunos componentes que pueden tener valor fuera de ATLAXIA:

```text
Button
Section
SectionHeader
Surface
SplitLayout
StickyLayout
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

Un componente solo debe considerarse candidato real a librería cuando:

- no contiene copy ATLAXIA;
- no depende de assets ATLAXIA;
- recibe contenido por props/children;
- es responsive;
- es accesible;
- soporta reduced motion cuando corresponde;
- tiene una API clara;
- puede demostrarse en aislamiento.

---

# Storybook

Se recomienda Storybook para los componentes reutilizables.

Objetivos:

- desarrollar componentes aislados;
- documentar estados;
- probar variantes;
- validar APIs;
- facilitar su futura extracción a una web/librería personal de componentes React.

No es necesario documentar cada wrapper trivial.

---

# Animaciones

Jerarquía recomendada:

```text
CSS
→ microinteracciones

Motion
→ scroll, SVG, layout, estado

Lottie
→ animaciones cerradas/ilustrativas
```

Evitar por defecto:

```text
Three.js
WebGL
3D pesado
```

---

# Rendimiento

La web debe priorizar una sensación fluida y ligera.

Especial atención a:

- SVG;
- optimización de imágenes;
- lazy loading;
- vídeo diferido;
- tamaño de bundles;
- dependencias;
- animaciones;
- móvil.

---

# Accesibilidad

La v2 debe contemplar:

- navegación por teclado;
- focus visible;
- contraste;
- semántica;
- reduced motion;
- idioma del documento;
- alt text;
- controles accesibles;
- contenido disponible sin depender de hover o animación.

---

# Dirección visual

Palabras guía:

```text
industrial
técnico
preciso
contemporáneo
sobrio
humano
```

Recursos visuales preferidos:

```text
planos
retículas
coordenadas
diagramas
señales
nodos
relaciones
gráficas
timelines
interfaces
anotaciones
```

---

# Referencias

## Cerebrium
https://cerebrium.ai/

WHY + smooth scroll.

## Anveril
https://anveril.com/

Narrativa visual y transición entre visión y sistema.

## uAvionix
https://www.usavionix.com/

Storytelling de producto/sistema.

## Matta
https://matta.ai/

Planos y estética técnica industrial.

## Prolibu
https://prolibu.com/es/platform/sales/

Animaciones justificadas.

## Vectr
https://www.vectrfl.com/

Lenguaje industrial animado, evitando trasladar 3D pesado.

## Boiler Lab
https://boilerlab.ai/

Navbar y dirección tipográfica.

## Radiant
https://radiant.co/

Presentación de productos.

## Rig
https://rig.ai/

Flujo de demo y CTA comercial.

---

# Copy

La fuente de verdad debe ser primero el contenido español.

Tono:

- natural;
- concreto;
- técnico;
- comprensible;
- sin clichés;
- sin hype;
- sin emojis.

Una frase que podría servir para cualquier startup de IA cambiando el nombre de la empresa debe revisarse.

---

# Futuro

La arquitectura debe permitir incorporar nuevos productos sin cambiar la tesis central de la web.

Ejemplo:

```text
Productos

├── Producto actual
├── Producto futuro B
└── Producto futuro C
```

ATLAXIA debe seguir teniendo sentido aunque cambie el catálogo.
