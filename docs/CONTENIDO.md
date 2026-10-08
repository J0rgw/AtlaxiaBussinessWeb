# ATLAXIA v2: registro de contenido

Fuente de verdad para el copy. Todo lo que se publique tiene que salir de aquí o de una fuente marcada como válida. Si algo no está aquí, no se inventa: se marca como pendiente.

Última actualización: 2026-10-08 (Visión: bloque "Hacia dónde vamos" con escala, hoja de ruta y sectores).

---

## Hechos confirmados por el propietario (2026-09-29)

| Tema | Hecho | Dónde vive en código |
|---|---|---|
| Marca | Se escribe **ATLAXIA** | `src/content/shared/company.ts` |
| TrueData | Nombre legacy **sin ninguna relación** con ATLAXIA. No es propietaria. No mencionar | |
| Email | `hola@atlaxia.es` | `company.ts` |
| Demo | Se puede enlazar `https://demo.atlaxia.es` | `company.ts` |
| Producto | Nombre provisional **SCADAXIA** (placeholder, no definitivo) | `company.ts` (`nameIsPlaceholder`) |
| Sectores foco | Agrifood, metalurgia y agua | `vision.where.sectors` ("Dónde empezamos") |
| Equipo | Juan Miguel Navarro, CEO, catedrático de Telecomunicación; David Palazón Palau, CTO y desarrollo de IA, doctorando de Telecomunicación; Jorge Arcas Verdejo, CMO y desarrollo full-stack, estudiante de Ingeniería Informática | Pendiente de pasar a contenido |
| Origen del equipo | Equipo nacido en la UCAM a partir de la colaboración en proyectos de investigación. Se puede nombrar la UCAM así; sin logo ni relación institucional | Pendiente de pasar a contenido |
| Investigación | Adquirida en diversos proyectos de investigación | |
| Proyectos | El análisis inteligente del SCADA (el producto que vende la web legacy) | |
| Premio | **Santander X Award, Proyecto de emprendimiento 2026**: 2.000 € (competición de startups universitarias) | Pendiente de pasar a contenido |
| Programas | Ninguno por ahora ("estamos empezando"). No se mencionan programas de emprendimiento o aceleración | |
| Dataset | El modelo se ha trabajado con SWaT. **No se publica** (ver política de evidencia) | |
| Rumbo (2026-10-08) | Después del primer producto: explicar la causa de cada desviación, recomendar y actuar, y más productos según las necesidades industriales. **Interno, no se publica como hoja de ruta**: el propietario lo ve contraproducente para una empresa aún no constituida. Aprobado (2026-10-08): publicar solo una dirección en una frase y una invitación a construirlo con plantas de agua | |
| Piloto (2026-10-08) | ATLAXIA busca plantas de agua para colaborar y probar el piloto. Se puede publicar como invitación | Pendiente de pasar a contenido |
| Sector del caso (2026-10-08) | Agua: el caso concreto de "Dónde empezamos" se cuenta en una instalación de agua | |

## Placeholders acordados

| Qué | Estado | Recordatorio |
|---|---|---|
| Datos legales (razón social, NIF, domicilio, aviso legal, privacidad) | Placeholder visible en el footer | `TODO(legal)` en `company.ts` y `SiteFooter.tsx`. Obligatorio antes de publicar y antes de activar el formulario |
| Fotos, frase por persona y LinkedIn del equipo | Placeholder | La sección de equipo es un esquema para enseñar, no la versión final |
| Nombre del producto | SCADAXIA provisional | |

## Por confirmar

- ¿"Supervisión de procesos" es la forma correcta de describir el primer producto? Se usa en Visión y en la columna del producto.
- La intención "Inversión" en Contacto no estaba en la lista de AGENTS.md; se añadió por el premio y la fase de la empresa. Quitar si no procede.
- **Hacia dónde vamos (borrador, 2026-10-08):**
  - Nivel actual del producto: "Procesos" (ligado a "supervisión de procesos", que ya estaba por confirmar).
  - "Siguiente: Plantas" (llevar la lectura a la planta completa y a las relaciones entre procesos) y "Objetivo: Sistemas industriales" (varias plantas o redes enteras). Son la dirección que propone el copy, no un plan confirmado.
  - Frases de cada sector: describen el tipo de sistema de forma genérica, sin clientes ni plantas. Validar que son correctas.
  - En español se usa "Agroalimentación" en lugar de "Agrifood" (el término que dio el propietario); en inglés, "Agrifood".
- **Caso del agua y dirección (borrador, 2026-10-08, storyboard v3 en Storybook):** `vision.waterCase` y `vision.direction`. Textos de los cinco pasos, la frase de dirección ("Que cada aviso llegue con su porqué y con lo que se puede hacer") y la invitación al piloto. Sustituyen a las escenas de scroll rechazadas.
- **Escenas de scroll (en la home desde 2026-10-08):** `vision.scenes`. "Hoy: Procesos", "Siguiente: Plantas completas" y "Objetivo" con la frase de objetivo siguen en borrador. Ojo: "Siguiente" es una etapa de hoja de ruta, y el enfoque aprobado era no publicar hoja de ruta (ver "Rumbo"); el propietario aprobó la escena así, pero conviene confirmarlo antes de publicar. La red de plantas del final es una ilustración de la ambición, no de clientes ni instalaciones reales.

---

## Estado del copy por sección

| Sección | Estado | Dónde | Notas |
|---|---|---|---|
| Hero | Versión 3 (menos texto), pendiente de revisión | `hero` en `src/content/es` y `en` | Titular en un color, una frase y dos botones. Sin GNN, SCADA ni anomalías. Se quitaron el eyebrow y el cajetín (sectores y origen siguen confirmados aquí para otras secciones) |
| Visión | Versión 2, sin título ni entradilla (quitados el 2026-10-01), pendiente de revisión. "Hacia dónde vamos" en borrador (2026-10-08) | `vision` | Tesis de empresa válida aunque cambie el producto. Abre en "Visión" con cuatro razones (datos sin contexto, relaciones, comportamiento esperado, de entender a actuar) y cierra con "Hacia dónde vamos": la frase de objetivo, la escala (señal, equipo, proceso, planta, sistemas) con la hoja de ruta Hoy, Siguiente y Objetivo, y los tres sectores foco. Menciona "nuestro primer producto" (supervisión de procesos) sin nombre. Ilustraciones y esquemas genéricos, sin datos reales ni numeración de instrumentos real |
| Qué estamos construyendo | Versión 1, pendiente de revisión | `building` | Solo contenido legacy verificado y conceptual: observado frente a esperado, "la alerta es la divergencia, no un umbral", cada sensor se lee junto a sus vecinos, en la planta junto al SCADA sin escribir en él, on-premise. "Un modelo de grafos" se queda en lo conceptual: sin GNN concreta, dataset ni métricas. SCADAXIA marcado como nombre provisional. Enlace a la demo |
| Contacto | Versión 1, pendiente de revisión | `contact` | "Solicitar demo" y cinco intenciones (colaboración, investigación o universidad, partnerships, inversión, otra consulta) como correos a hola@atlaxia.es con asunto. Sin formulario hasta tener los textos legales |
| Qué hacemos, Quiénes somos | Sin redactar | | Placeholders visibles. Los datos del equipo ya están confirmados arriba |

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
