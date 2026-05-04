# AtlaXia: Landing page

Sitio público de marketing de **AtlaXia**, plataforma AI-native de detección de
anomalías para infraestructura hidráulica ICS/SCADA. Construido sobre Next.js 15
(App Router) con export estático para GitHub Pages.

> AtlaXia sustituye los umbrales estáticos del SCADA legado y las reglas por
> firma de Fortinet OT con redes neuronales de grafos que tokenizan lo normal
> de tus sensores: y predicen y señalan la deriva en cuanto aparece.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # genera ./out (export estático)
npm test             # vitest run
npm run test:watch
npx serve out        # previsualización del build estático
```

## Stack

- **Next.js 15** (App Router) + **TypeScript 5.6** + **React 19**
- **Tailwind CSS 3** con tokens del sistema SCADA (`design.md`) + tokens cream marketing
- **Open Runde** (display, vía `@fontsource/open-runde`) + **IBM Plex Sans** + **JetBrains Mono** + **Nunito** (todas vía `next/font/google` salvo Open Runde)
- **Lucide** para iconografía. Sin emoji.
- **Formspree** para envío del formulario de demo (estático, sin backend)
- **Vitest** + **React Testing Library** + **jsdom** para tests
- **GitHub Actions** + **GitHub Pages** para CI/CD

## Estructura

```
app/
  layout.tsx              # html/body, fuentes, skip-link
  page.tsx                # composición de secciones
  globals.css             # tokens cream + display utilities
  icon.tsx                # favicon programático (32×32)
  apple-icon.tsx          # apple-touch-icon programático (180×180)
  opengraph-image.tsx     # OG/Twitter image (1200×630, Nunito)
  twitter-image.tsx       # re-export del OG
  robots.ts               # /robots.txt
  sitemap.ts              # /sitemap.xml
components/
  Nav.tsx                 # nav sticky con CTA
  Hero.tsx                # headline + sub + CTA + métricas + AnomalyLiveDemo
  AnomalyLiveDemo.tsx     # widget de detección en directo (dark)
  Differentiators.tsx     # 3 tarjetas con mini-charts
  TokenVsRules.tsx        # comparativa lado a lado (umbral vs token)
  ForecastChart.tsx       # banda de predicción + curva real
  StackComparison.tsx     # tabla comparativa vs SCADA + Fortinet OT
  PlantSurvey.tsx         # mock del formulario de campo + taxonomía
  CTA.tsx                 # bloque de llamada a la acción + form
  RequestDemoForm.tsx     # form Formspree con honeypot/validación
  Footer.tsx
  StatusPill.tsx
  mini/
    MiniDetect.tsx        # mini-chart: detección con anomalía
    MiniTokens.tsx        # mini-chart: GNN sobre grafo
    MiniForecast.tsx      # mini-chart: predicción + banda
lib/
  site.ts                 # SITE_URL / SITE_HOST / CONTACT_EMAIL
tests/
  setup.ts                # jest-dom + RTL cleanup
  site.test.ts
  RequestDemoForm.test.tsx
.github/workflows/
  pages.yml               # build + deploy a GitHub Pages
public/
  logo.png · logo-mark.png · .nojekyll
```

## Variables de entorno

| Variable                       | Por defecto                | Uso                                                |
|--------------------------------|----------------------------|----------------------------------------------------|
| `NEXT_PUBLIC_SITE_URL`         | `https://atlaxia.example`  | metadataBase, OG image, sitemap, robots            |
| `NEXT_PUBLIC_CONTACT_EMAIL`    | `hola@atlaxia.example`     | mailto en CTA y form                               |
| `NEXT_PUBLIC_BASE_PATH`        | (vacío)                    | `/<repo>` para subpath de GitHub Pages             |
| `NEXT_PUBLIC_FORMSPREE_ID`     | (vacío)                    | ID del form de Formspree (sin él el form falla)   |

En local copia `.env.example` a `.env.local`. En CI se leen de `vars.*` del repositorio (ver `pages.yml`).

## Despliegue (GitHub Pages)

Repository → *Settings* → *Pages* → *Build and deployment* → **Source: GitHub Actions**.
Repository → *Settings* → *Secrets and variables* → *Actions* → *Variables*:

- `SITE_URL`, `CONTACT_EMAIL`, `BASE_PATH`, `FORMSPREE_ID`

Cada push a `main` despliega.

---

# Auditoría de estado · plan de mejora

> Captura del audit ejecutado tras el deploy inicial. Mantener este documento
> al día a medida que se cierren issues.

## Dónde estamos

Funcional y visualmente sólido: shell editorial cream con widgets de producto
en oscuro, visualizaciones reales (no iconos), copy en español, export estático
desplegado en Pages. Build limpio, tests verdes, baselines de accesibilidad
cubiertos. Como **v0** está por encima de la media de la industria.

Lo que **aún no es**: una landing B2B OT comercialmente completa. Explica el
producto pero todavía no gana la confianza de un departamento de compras
industrial, no cumple la normativa europea de privacidad, y no acompaña a una
visita real desde "interesado" hasta "comprador".

## Fortalezas a preservar

- **Arquitectura de información**: Hero → 3 diferenciadores → 3 deep dives → onboarding → CTA. Sin desperdicios.
- **Lenguaje visual**: Marketing cream / producto oscuro. Open Runde + JetBrains Mono cargan peso.
- **Visualizaciones reales**: Mini-charts vivos, bucle de anomalía, banda de predicción, comparativa token-vs-reglas. Demuestra en lugar de ilustrar.
- **Accesibilidad base**: Skip-link, focus rings, contraste >=AA, aria-labels descriptivos, prefers-reduced-motion respetado.
- **Sistema de tokens** heredado de `design.md`: camino directo a un paquete compartido con el dashboard.

## Gaps priorizados

### P0: Bloqueantes (legal / comercial)

| # | Gap | Acción |
|---|-----|--------|
| **P0.1** | **GDPR / LOPD no cumplido.** El form recoge nombre + email + empresa sin checkbox de consentimiento ni política de privacidad. | Checkbox obligatorio + página `/privacidad` + página `/terminos` + Formspree como encargado del tratamiento documentado. |
| **P0.2** | **Cero prueba social / señales de credibilidad.** Una utility hidráulica no compra desde una página sin clientes, testimonios, certificaciones ni track record. | Sección con (al menos aspiracional): roadmap de cumplimiento, badge de fase piloto, advisory board, o stats prospectivos. |
| **P0.3** | **No hay navegación móvil.** Por debajo de `md` el menú está `hidden`. Visitantes en móvil no pueden saltar entre secciones. | Sheet/hamburger menu estándar. |
| **P0.4** | **Sin sección de cumplimiento / seguridad.** Compradores OT preguntan ISO 27001, IEC 62443, NIS2, on-prem, airgap, RBAC, audit logs, dónde residen los datos. | Bloque explícito con la postura de seguridad. |

### P1: Alto valor (lift de conversión)

| # | Gap | Acción |
|---|-----|--------|
| **P1.5** | **FAQ.** Anticipa las 5–7 objeciones de cada comprador OT. | ¿Funciona airgap? · ¿Cuánto tarda en entrenar? · ¿Y si no tenemos historian? · ¿Sensores mínimos? · ¿Piloto sin compromiso? · ¿Integración con SCADA? Schema.org FAQPage para SEO. |
| **P1.6** | **Timeline time-to-value.** Hoy solo "1 visita" y "11m". Faltan los hitos del ciclo: Día 1 visita · Día 7 modelo entrenado · Día 14 primeras detecciones · Día 30 informe. | Timeline horizontal visual. |
| **P1.7** | **Diagrama de arquitectura.** SVG anotado mostrando AtlaXia dentro de la red de planta: SCADA / historian → AtlaXia (on-prem) → dashboard, con protocolos etiquetados (OPC-UA, MQTT) y el límite "no hay datos saliendo de la planta". | Calma la ansiedad de infraestructura mejor que 200 palabras de copy. |
| **P1.8** | **"Cómo trabajar con nosotros": paso comercial concreto.** Hoy el viaje termina en el form. | Piloto 30 días sin compromiso · entregable de modelo · contrato de soporte. Quita la fricción "¿qué pasa después de enviar?". |
| **P1.9** | **Pausa/play en animaciones continuas.** 7 RAF loops simultáneos (Hero AnomalyLiveDemo + TokenVsRules ×2 + ForecastChart + 3 mini-charts). | Botón de pausa global en el hero. Accesibilidad + batería + descanso visual. |
| **P1.10** | **Footer expandido.** Hoy logo + 4 chips. | Privacidad / Términos / LinkedIn / (eventualmente) Documentación + dirección legal. |

### P2: Pulido (valor medio)

| # | Gap | Acción |
|---|-----|--------|
| **P2.11** | **Analytics respetando privacidad** (Plausible / Umami / SimpleAnalytics, ~€9/mo). | Sin esto no se mide abandono de form, scroll depth, ni qué CTA gana. |
| **P2.12** | **Versión inglesa bajo `/en/`.** | España-only OK para v1; Portugal/LatAm/EU exige al menos inglés. Decisión ahora (routing i18n) ahorra rework. |
| **P2.13** | **Vídeo demo.** 60–90s screen capture del dashboard. | Vale 10× el copy explicativo en B2B. |
| **P2.14** | **404 personalizado.** | Pulido de marca menor, sin lift funcional. |
| **P2.15** | **Indicador de sección activa en nav.** | Resalta la sección actual al hacer scroll. |
| **P2.16** | **`<span lang="en">`** alrededor de la jerga inglesa embebida (`on-prem`, `airgap`, `WebSocket`, `dark-first`). | Lectores de pantalla lo pronuncian con fonemas españoles. |
| **P2.17** | **Optimización del logo.** `logo-mark.png` es 2000×2000 (61.8 KB) para un render de 28×28. | Redimensionar / convertir a SVG o AVIF pequeño. |

## Cosas existentes a cambiar

| ID | Item | Acción |
|----|------|--------|
| **A** | **Métricas del hero: `2.148` sensores · `11m` anticipación.** Se leen como stats operativos en vivo. No lo son. | Etiquetar claramente ("objetivo en piloto" / "demostrado en pruebas") o quitar. Números engañosos son peor que ningún número en OT. |
| **B** | **Inconsistencia en nombres de sensores.** `pump-3.flow_rate` (hero) · `tank-2.pressure` (forecast) · `FIT201_PV` (form mock). Lee como tres plantas. | Unificar en una planta demo coherente ("EDAR AcmeAguas Norte") con sensores relacionados. |
| **C** | **Badge `DEMO` en el mock del form y en el live demo.** Refuerza "esto es una captura, no datos reales". |
| **D** | **Card de diferenciador del medio: body.** "CoGNN y STGNN aprenden la variedad normal..." es jerga densa para compradores no-ingeniería. | Liderar con lenguaje de operario ("Aprende lo normal de tu planta"), cerrar con jerga ("GNN sobre grafos · CoGNN/STGNN"). |
| **E** | **Acentos editoriales en cursiva: sobreusados.** 6+ secciones usan el dispositivo italic-teal-fragment. | Recortar a las 3 ocurrencias de mayor impacto (Hero, TokenVsRules, CTA). |
| **F** | **Ambigüedad de marca TrueData / AtlaXia.** El footer dice "TrueData", la nav dice "AtlaXia". | Elegir: "AtlaXia by TrueData" en todo, o unificar bajo una marca. |
| **G** | **Promesa del CTA: "Te mostramos la deriva en una semana".** Fuerte si se cumple; arriesgada si no. | O comprometer, o suavizar a "Te mostramos lo que el modelo encuentra en tus datos". |
| **H** | **Estado de éxito del form: sin camino de vuelta.** Tras "Hemos recibido tu solicitud" no hay forma de volver. | Enlace sutil "Enviar otra solicitud". |
| **I** | **Auto-focus tras error de form.** Ahora la alerta aparece pero el foco se queda en el botón submit. | WCAG: mover el foco a la alerta o al primer campo inválido. |
| **J** | **Densidad del rail izquierdo en el mock del form.** A md+, 5 bullets + info note compiten con el panel principal. | Recortar a los 3 más importantes. |

## Lo que enviaría a continuación, en orden

Si tuviera que elegir el próximo sprint de 5:

1. **Cumplimiento de privacidad** (P0.1): checkbox + `/privacidad` + `/terminos`. Bloqueante legal.
2. **Mobile nav sheet** (P0.3): los visitantes en móvil no pueden navegar.
3. **Sección de cumplimiento/seguridad** (P0.4): ISO 27001 / IEC 62443 / NIS2 / on-prem / airgap / RBAC explícitos. Bloqueante de procurement.
4. **Sección de prueba social** (P0.2): incluso aspiracional. La señal de confianza más grande que falta.
5. **Sección FAQ** (P1.5): anticipa cinco objeciones.

**Fase 2:** timeline · diagrama de arquitectura · pausa de animaciones · footer expandido.

**Fase 3:** i18n /en/ · analytics · vídeo demo · 404 · `<span lang="en">` para jerga.

## Lo que no haría

- **No añadir blog todavía.** Changelogs vacíos leen peor que ningún changelog.
- **No añadir pricing.** B2B OT pricing es por trato; exponer solo "contáctanos para piloto".
- **No nombrar competidores** (Dragos, Claroty, Nozomi). Comparativas vagas más seguras.
- **No reducir más los widgets oscuros.** Son el diferenciador visual más fuerte.
- **No añadir chatbot.** Procurement los considera ruido; ingeniería los considera obstáculo.

---

## Tests

```bash
npm test
```

| Suite | Cobertura |
|-------|-----------|
| `tests/site.test.ts` | Lectura y normalización de variables de entorno (SITE_URL trailing-slash, CONTACT_EMAIL custom, fallbacks) |
| `tests/RequestDemoForm.test.tsx` | Render de campos requeridos + textarea opcional, fallback mailto, success state tras 200 mockeado, error state tras 422 mockeado |

## Licencia

Propiedad de TrueData. Todos los derechos reservados.
