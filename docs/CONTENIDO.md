# ATLAXIA v2: registro de contenido

Fuente de verdad para el copy. Todo lo que se publique tiene que salir de aquí o de una fuente marcada como válida. Si algo no está aquí, no se inventa: se marca como pendiente.

Última actualización: 2026-10-18 (posicionamiento, home reestructurada y copy aprobado por el propietario; ver «Decisiones del propietario (2026-10-17 y 18)», que sustituyen a lo anterior donde choquen).

---

## Hechos confirmados por el propietario (2026-09-29)

| Tema | Hecho | Dónde vive en código |
|---|---|---|
| Marca | Se escribe **ATLAXIA** | `src/content/shared/company.ts` |
| TrueData | ~~Nombre legacy sin relación con ATLAXIA. No mencionar~~ **Sustituido (2026-10-17):** TRUEDATA es el origen de la tecnología y se menciona en Quiénes somos | `about.origin` |
| Email | `hola@atlaxia.es` | `company.ts` |
| Demo | Se puede enlazar `https://demo.atlaxia.es` | `company.ts` |
| Producto | ~~Nombre provisional SCADAXIA~~ **Sustituido (2026-10-17):** la web no nombra el producto | |
| Sectores foco | ~~Agrifood, metalurgia y agua~~ **Sustituido (2026-10-17):** agua primero; agroalimentación y metalurgia solo como posible expansión | `vision.scenes.sectors` |
| Equipo | Juan Miguel Navarro Ruiz, CEO, catedrático de Telecomunicación; David Palazón Palau, CTO y desarrollo de IA, doctorando de Telecomunicación; Jorge Arcas Verdejo, CMO y desarrollo full-stack, estudiante de Ingeniería Informática | `about.team` (2026-10-18) |
| Origen del equipo | Equipo nacido en la UCAM a partir de la colaboración en proyectos de investigación. Se puede nombrar la UCAM así; sin logo ni relación institucional | `about.chapters.origin` |
| Investigación | Adquirida en diversos proyectos de investigación | |
| Proyectos | El análisis inteligente del SCADA (el producto que vende la web legacy) | |
| Premio | **Santander X Award, Proyecto de emprendimiento 2026**: 2.000 € (competición de startups universitarias) | Pendiente de pasar a contenido |
| Programas | Ninguno por ahora ("estamos empezando"). No se mencionan programas de emprendimiento o aceleración | |
| Dataset | El modelo se ha trabajado con SWaT. **No se publica** (ver política de evidencia) | |
| Rumbo (2026-10-08) | Después del primer producto: explicar la causa de cada desviación, recomendar y actuar, y más productos según las necesidades industriales. **Interno, no se publica como hoja de ruta**: el propietario lo ve contraproducente para una empresa aún no constituida. Aprobado (2026-10-08): publicar solo una dirección en una frase y una invitación a construirlo con plantas de agua | |
| Piloto (2026-10-08) | ATLAXIA busca plantas de agua para colaborar y probar el piloto. Se puede publicar como invitación | Pendiente de pasar a contenido |
| Sector del caso (2026-10-08) | Agua: el caso concreto de "Dónde empezamos" se cuenta en una instalación de agua | |

## Decisiones del propietario (2026-10-17 y 18)

Aprobadas para publicar. Donde choquen con lo anterior, mandan estas.

- **Categoría:** «Inteligencia industrial para infraestructuras críticas» (título, meta, pie y Quiénes somos).
- **Hero:** el texto de main («Tecnología para entender sistemas industriales complejos» y «Software para ver lo que ocurre en una planta, entender por qué y decidir a tiempo.»).
- **Datos:** no salen de la planta en ningún caso. Todo el software funciona en un equipo instalado en la planta, sin depender de la nube (bloque del equipo, `edge`).
- **Vocabulario:** «anomalía», nunca «desviación». «Solo lee: nunca toca el control» solo en Qué hacemos. ATLAXIA siempre en mayúsculas. Un test de contenido vigila las dos primeras reglas.
- **Origen:** proyecto basado en una spin-off de la UCAM; la tecnología nace de TRUEDATA (compra pública precomercial de INCIBE, probada en instalaciones reales de agua). Equipo fundador con nombre completo y perfil (2026-10-18): Juan Miguel Navarro Ruiz (CEO, catedrático de Telecomunicación), David Palazón Palau (CTO y desarrollo de IA, doctorando en Telecomunicación) y Jorge Arcas Verdejo (CMO y desarrollo full-stack, estudiante de Ingeniería Informática).
- **Quiénes somos (2026-10-18):** se cuenta en texto: una frase y cuatro capítulos (origen, TRUEDATA, ATLAXIA, equipo). Incluye tres frases de tono aprobadas: «La investigación es el punto de partida; la planta, el sitio donde tiene que funcionar», «Es el paso que separa una idea prometedora de una tecnología que se puede instalar» y «Tres perfiles que cubren el camino entero».
- **No se publica:** ronda de inversión, historia del fundador, Zero Trust o ZTA, research (aún no hay; lo habrá), nombre del producto.
- **Integración:** sin nombre propio. Llegamos a la planta, nos conectamos a su red OT con los permisos que acuerde su responsable, ajustamos el modelo con los operadores y en marcha; mejora con el uso. El ahorro de tiempo se mide en cada planta con métricas pactadas antes de empezar, no se promete en cifras.
- **Modelo:** «Técnicamente, una ontología multicapa» abre Qué construimos; las relaciones aprendidas son pistas, no causas probadas.
- **Visión:** empieza en «Hacia dónde vamos»; se quitó el bloque «Una planta de agua no carece de datos…». Cierra con «Por qué el agua, por qué ahora» (fuentes en «Política de evidencia»).
- **Entrada:** la web siempre se abre por el hero.
- **Encaje técnico (aprobado el 2026-10-18):** «gemelo digital del comportamiento de su planta» en El producto hoy; reentreno semanal con los operadores en Disponible hoy; lista «En desarrollo» con la previsión de la evolución de la planta y toda la planta en un solo modelo; histórico etiquetado de la integración con el que se mide el acierto. Las entradillas pasan a `intro.beats` (una frase por paso de la portada). En Qué hacemos la portada lleva solo una línea, «Cinco pasos, de la primera medida al primer diagnóstico»: la entradilla anterior repetía lo que cuentan los pasos.

## Placeholders acordados

| Qué | Estado | Recordatorio |
|---|---|---|
| Datos legales (razón social, NIF, domicilio, aviso legal, privacidad) | Placeholder visible en el footer | `TODO(legal)` en `company.ts` y `SiteFooter.tsx`. Obligatorio antes de publicar y antes de activar el formulario |
| Fotos, frase por persona y LinkedIn del equipo | Placeholder | La sección de equipo es un esquema para enseñar, no la versión final |
| Nombre del producto | Sin nombre en la web (2026-10-17) | |

## Por confirmar

- **TRUEDATA:** referencia exacta del contrato de INCIBE para enlazarla como prueba. No aparece en la lista de contratos finalizados con éxito consultada el 2026-10-17.
- **Información técnica nueva (2026-10-18), aún sin publicar:** reentreno semanal en ventanas programadas con el feedback de los operarios; histórico etiquetado de cada planta que sale de la integración y sirve para evaluar el modelo; «evaluación horizontal» con indicadores que no necesitan etiquetas; capacidad de forecasting; relaciones por causa-efecto, correlación y temporalidad sobre las capas física, funcional y red OT. Antes de publicar hay que saber qué funciona hoy, si el forecasting se ofrece (la home no promete predecir) y si las etiquetas se usan para aprender o solo para evaluar (Qué hacemos dice «sin ejemplos de fallos»).
- **`meta.description`:** «en menos tiempo» es un comparativo sin evidencia (señalado el 2026-10-18).
- **Visión:** las etapas «Hoy: procesos y señales de una planta» y «En construcción: la planta completa» deben seguir siendo ciertas.
- La intención «Inversión» en Contacto no estaba en la lista de AGENTS.md; se añadió por el premio y la fase de la empresa. Quitar si no procede.

---

## Estado del copy por sección

| Sección | Estado | Dónde | Notas |
|---|---|---|---|
| Hero | Aprobado (2026-10-17) | `hero` | Texto de main |
| Bloque del equipo | Aprobado (2026-10-18) | `edge` | Titular y frase de apoyo |
| Visión | Aprobado (2026-10-18) | `vision.scenes`, `vision.evidence` | Hacia dónde vamos, Empezamos por el agua y Por qué el agua, por qué ahora |
| Quiénes somos | Aprobado (2026-10-18) | `about` | Frase, cuatro capítulos y equipo con nombre completo y perfil |
| Qué hacemos | Aprobado (2026-10-18) | `capabilities` | Cinco pasos y gráfica; el paso 5 abre con «Un primer diagnóstico…» |
| Qué estamos construyendo | Aprobado (2026-10-18) | `building` | Cuatro capas, El producto hoy, Disponible hoy, Integración |
| Quiénes somos | Aprobado (2026-10-18) | `about` | Origen y equipo fundador |
| Contacto | Sin cambios | `contact` | Solicitar demo y cinco intenciones por correo; sin formulario hasta tener los textos legales |

"Miles de lecturas cada día" (Visión) es una afirmación genérica sobre cualquier planta, no una métrica de ATLAXIA.

---

## Política de evidencia

- La regla general sigue siendo "afirmación + evidencia", pero **de momento no se aportan evidencias técnicas** (dataset, resultados, métricas, detalles del modelo): no hay patente y hay miedo a copias.
- **Sí se puede:**
  - enlazar la demo pública;
  - mostrar la interfaz;
  - explicar conceptualmente (observado frente a esperado, relaciones entre señales).
- **No:**
  - citar SWaT;
  - publicar métricas;
  - detallar la arquitectura del modelo más allá de lo conceptual.
- Los componentes de evidencia (EvidenceCard) se preparan con estado `pending` para rellenarlos cuando se decida.
- **Fuentes externas enlazadas** (Por qué el agua, por qué ahora; comprobadas el 2026-10-17): PERTE de digitalización del ciclo del agua, 60 % de la población (iAgua, 13 de mayo de 2026); Directiva NIS2, anexo I (agua potable y aguas residuales, sectores de alta criticidad); ES-ISAC Aguas con INCIBE (11 de junio de 2026). Descartadas por no poder confirmarlas: penalidades de pliegos concretos.

---

## Fuentes descartadas (no usar como hechos)

| Fuente | Motivo |
|---|---|
| `../AtlaXiapptx_L2.pptx` | Contiene cifras y hechos que contradicen lo confirmado: 4 fundadores con nombres placeholder, "4 plantas en Iberia", "2.148 sensores", "11 min de anticipación", ronda de 4,5 M€, "acuerdo TrueData + UPCT", 12 plantas firmadas |
| Claims del legacy | "11 min", "2.148 sensores", "respuesta en 24 h", "ISA-101", "compatible airgap", "NIS2-ready", "30 días de export", "11 modelos activos". No se reutilizan sin confirmación |
| `../docs/Estilos.png` | Mock genérico de dashboard TrueData |
| `../atlaxia-lottie/public/mark.svg` | Hexágono naranja: no es el logo de ATLAXIA |
| `DESIGN.md` legacy | Paleta crema + teal desactualizada; la vigente es la del `globals.css` legacy |

## Fuentes a consultar en fases futuras

- `../atlaxia-demo/docs/` (`UI-DOCUMENTATION.md`, `SENSORS.md`, `REBUILD_DESIGN_SCADA.md`...): para la sección "Qué estamos construyendo". Filtrar con la política de evidencia.
- `../AtlaXiapptx_L2.pptx`, carpeta `ppt/media`: puede haber capturas reales de la interfaz. Solo las imágenes, nunca las cifras.
- Contenido legacy verificado y conceptual, reutilizable: observado frente a esperado; "la alerta es la divergencia, no un umbral"; cada sensor se lee junto a sus vecinos; despliegue on-premise en paralelo al SCADA sin escribir en él.
