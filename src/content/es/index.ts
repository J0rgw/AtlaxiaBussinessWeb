import type { NavSectionId } from "../shared/sections";

/**
 * Spanish is the source language. Its shape defines the Dictionary type,
 * so every other locale must provide exactly the same keys.
 */
export const es = {
  meta: {
    title: "ATLAXIA | Inteligencia industrial para infraestructuras críticas",
    description:
      "Inteligencia industrial para infraestructuras críticas del agua. Detecta y diagnostica anomalías en menos tiempo, y los datos no salen de la planta.",
  },

  a11y: {
    skipToContent: "Saltar al contenido",
    languageSwitcher: "Idioma",
    homeLink: "ATLAXIA, ir al inicio",
  },

  nav: {
    vision: "Visión",
    capabilities: "Qué hacemos",
    building: "Qué estamos construyendo",
    about: "Quiénes somos",
    contact: "Contacto",
  } satisfies Record<NavSectionId, string>,

  navigation: {
    label: "Navegación principal",
  },

  hero: {
    // Lines of the headline, in order. One color: the drawing behind carries the accent.
    title: {
      lines: ["Tecnología para", "entender sistemas", "industriales complejos"],
    },
    lead: "Software para ver lo que ocurre en una planta, entender por qué y decidir a tiempo.",
    primaryCta: "Hablar con el equipo",
    secondaryCta: "Ver qué construimos",
  },

  // Block right after the hero: the unit at the center of the headline.
  edge: {
    lines: ["Todo el software", "funciona en un equipo", "instalado en la planta."],
    // Lines above the unit; the rest go below it.
    split: 2,
    // TODO(owner): approve the lede.
    lede: "Los datos no salen de la planta. Cada planta tiene su propio modelo, entrenado con sus datos, y no depende de la nube para funcionar.",
    alt: "Equipo de ATLAXIA: un miniPC negro con disipador de aletas y el símbolo de ATLAXIA en la tapa.",
  },

  vision: {
    // Why now: facts from outside ATLAXIA, each with its source (checked on 2026-10-17).
    evidence: {
      title: "Por qué el agua, por qué ahora",
      sourceLabel: "Fuente",
      items: {
        perte: {
          figure: "60 %",
          statement:
            "de la población está ya en el alcance del PERTE que digitaliza el ciclo del agua.",
          source: "iAgua, 13 may 2026",
          href: "https://www.iagua.es/noticias/redaccion-iagua/perte-digitaliza-agua-6-cada-10-espanoles",
        },
        nis2: {
          figure: "NIS2",
          statement:
            "La directiva europea clasifica el agua potable y las aguas residuales como sectores de alta criticidad.",
          source: "Directiva (UE) 2022/2555, anexo I",
          href: "https://eur-lex.europa.eu/eli/dir/2022/2555/oj",
        },
        isac: {
          figure: "ES-ISAC Aguas",
          statement: "El sector ya comparte información de ciberseguridad con INCIBE.",
          source: "INCIBE, 11 jun 2026",
          href: "https://www.incibe.es/empresas/blog/quinta-comision-de-seguimiento-del-es-isac-aguas",
        },
      },
    },
    // Water case ("Dónde empezamos") and direction ("Hacia dónde vamos"), storyboard v3.
    waterCase: {
      title: "Dónde empezamos",
      place: "Estación de bombeo de agua",
      illustration: "Ilustración",
      steps: {
        scada: "Así la ve el SCADA: cada señal contra un umbral fijo. Ninguna alarma.",
        drift: "La presión de impulsión empieza a bajar. Sigue dentro del umbral: ninguna alarma.",
        expected: "ATLAXIA la compara con lo esperado para cada momento. Ya está fuera.",
        related:
          "No está sola: caudal, energía por m³ y vibración de la bomba cambian a la vez. El nivel del depósito, no.",
        decision:
          "Antes de que salte ninguna alarma, el equipo sabe dónde mirar y programa la revisión de la bomba.",
      },
      signals: {
        level: "Nivel del depósito",
        pressure: "Presión de impulsión",
        flow: "Caudal",
        vibration: "Vibración de la bomba",
        energy: "Energía por m³",
      },
      status: {
        normal: "Normal",
        deviation: "Anomalía",
        stable: "Estable",
        up: "Sube",
        down: "Baja",
      },
      chart: {
        measured: "Medido",
        expected: "Esperado",
        threshold: "Umbral del SCADA",
        detection: "Fuera de lo esperado",
        projection: "Aquí saltaría la alarma",
        review: "Revisión programada",
        time: "Tiempo",
      },
      equipment: {
        tank: "Depósito",
        pump: "Bomba B-101",
        network: "A la red",
      },
      scadaTitle: "Vista del SCADA",
      relatedTitle: "Señales relacionadas",
    },
    direction: {
      title: "Hacia dónde vamos",
      statement: "Que cada aviso llegue con su porqué y con lo que se puede hacer.",
      invitation: "Buscamos plantas de agua con las que construirlo y probar el piloto.",
      cta: "Colaborar en el piloto",
      card: {
        title: "Anomalía en la bomba B-101",
        where: "Dónde",
        whereValue: "Bomba B-101, impulsión",
        related: "Señales relacionadas",
        why: "Por qué",
        what: "Qué hacer",
      },
    },
    // Scroll scenes for "Hacia dónde vamos" (A) and where it starts and could grow (B).
    scenes: {
      where: {
        title: "Hacia dónde vamos",
        stagesLabel: "De la señal a la infraestructura",
        description:
          "Animación: la cámara se aleja de un sensor en una tubería. Aparece el proceso, con sus señales relacionadas; después, la planta completa en trazo discontinuo y, al final, varias instalaciones del ciclo del agua.",
        stages: {
          today: { word: "Hoy", detail: "Procesos y señales de una planta" },
          next: { word: "En construcción", detail: "La planta completa, en cuatro capas" },
          goal: {
            word: "Dirección",
            detail:
              "Infraestructuras del agua completas, de la captación a la depuración: ETAP, redes y EDAR.",
          },
        },
      },
      sectors: {
        title: "Empezamos por el agua",
        items: {
          water: {
            name: "Agua",
            note: "Donde empezamos",
            description:
              "Animación: una red de agua se dibuja desde el depósito, el agua la recorre y los sensores de nivel, presión y caudal se relacionan.",
          },
          food: {
            name: "Agroalimentación",
            note: "Posible expansión",
            description:
              "Animación de un posible sector de expansión: un tanque por lotes se llena y se agita; al lado, el rango esperado de temperatura cambia en cada fase y la señal medida lo sigue.",
          },
          metal: {
            name: "Metalurgia",
            note: "Posible expansión",
            description:
              "Animación de un posible sector de expansión: una pieza sale del horno y se adelgaza al pasar por dos cajas de laminación; los sensores de temperatura, vibración y energía se relacionan.",
          },
        },
      },
    },
  },

  capabilities: {
    eyebrow: "Qué hacemos",
    title: "Vigilamos que la planta funcione como un todo",
    // Chapter cover: the title lights up word by word; one line hands over to the five steps,
    // which tell the story (no lead here, so nothing is told twice).
    intro: {
      emphasis: "como un todo",
      beats: [
        {
          text: "Cinco pasos, de la primera medida al primer diagnóstico.",
          emphasis: "Cinco pasos",
        },
      ],
    },
    stepsLabel: "Qué hace ATLAXIA, paso a paso",
    steps: {
      observe: {
        title: "Observa",
        body: "El estado de la planta: medidas de sensores y estados de actuadores.",
        note: "Solo lee: nunca toca el control.",
      },
      system: {
        title: "Ve un sistema",
        body: "Las señales no cambian solas. Cuando la bomba arranca, sube el caudal de salida y baja el nivel del depósito. Una señal se entiende junto a las demás.",
      },
      normal: {
        title: "Aprende lo normal",
        body: "Aprende cómo se mueven juntas las señales con datos de funcionamiento normal de la propia planta, sin ejemplos de fallos. En cada instante comprueba si lo que ve encaja con lo esperado.",
      },
      mismatch: {
        title: "Detecta el desajuste",
        body: "La bomba y el caudal siguen su ritmo, pero el nivel ya no baja como debería. Todo sigue dentro de los límites y a simple vista parece normal. ATLAXIA lo marca como anomalía; un umbral fijo esperaría a que el nivel lo cruzara.",
      },
      where: {
        title: "Señala dónde",
        body: "Un primer diagnóstico cuando algo se aparta de lo normal: qué señal y qué proceso, con un nivel de anomalía de 0 a 5 por sensor, por proceso y para la planta. También avisa cuando una señal cruza los límites del operador.",
        note: "La decisión sigue siendo suya.",
      },
    },
    chart: {
      label: "Ilustración",
      description:
        "Ilustración: nivel de un depósito a lo largo de un día, con el estado de la bomba y el caudal de salida debajo. Cada vez que la bomba arranca, el caudal sube y el nivel baja. El modelo estima el nivel esperado y su rango. Hacia el final, la bomba y el caudal siguen como siempre, pero el nivel deja de bajar: se aparta de lo esperado sin llegar al límite del operador. ATLAXIA lo marca como anomalía y señala el nivel del depósito, en el proceso de bombeo.",
      signals: {
        level: "nivel del depósito",
        pump: "bomba, marcha / paro",
        outflow: "caudal de salida",
      },
      notes: {
        coherence: "la bomba arranca, sube el caudal y baja el nivel",
        coherenceShort: "bomba en marcha: baja el nivel",
        limit: "límite del operador",
        anomaly: "anomalía",
        usual: "bomba y caudal, como siempre",
        here: "aquí",
      },
      levelsLabel: "Nivel de anomalía, de 0 a 5",
      levels: { sensor: "nivel", process: "Bombeo", plant: "Planta" },
    },
    inside: {
      label: "Por dentro",
      body: "Una red neuronal de grafos trata cada señal como un nodo y aprende qué señales se influyen entre sí. Que el modelo se entienda importa tanto como que acierte: cada aviso se explica con los equipos, procesos y señales de su planta.",
    },
  },

  // Four layers of the plant model, laid like tracing sheets over one plan (P&ID of a pumping station).
  building: {
    eyebrow: "Qué estamos construyendo",
    title: "Un modelo de la planta en cuatro capas",
    // TODO(owner): approve. Chapter cover; names the model as the multi-layer ontology, in plain words.
    intro: {
      emphasis: "cuatro capas",
      beats: [
        {
          text: "Técnicamente, una ontología multicapa: qué hay en la planta y cómo se relaciona cada parte con las demás, escrita para que la entiendan igual el modelo y las personas.",
          emphasis: "ontología multicapa",
        },
        {
          text: "Tres capas describen la planta; la cuarta la aprende el modelo.",
          emphasis: "la cuarta la aprende el modelo",
        },
      ],
    },
    sketch: "Esquema",
    layers: {
      physical: {
        name: "Física",
        body: "Lo que hay en la planta: procesos, equipos y depósitos, y la señal de cada sensor.",
      },
      network: {
        name: "Red OT",
        body: "Por dónde viajan los datos: controladores, SCADA y comunicaciones. La red se puede escuchar sin intervenir en ella.",
      },
      functional: {
        name: "Funcional",
        body: "Cómo se encadena el proceso: qué etapa alimenta a cuál y qué reglas conoce la ingeniería.",
      },
      influence: {
        name: "Influencias",
        body: "La que aprende el modelo sobre las otras tres: qué señal influye en cuál, con qué fuerza y con cuánto retardo. Una relación aprendida es una pista, no una causa probada.",
      },
    },
    plan: {
      title: "Estación de bombeo",
      zones: { intake: "Captación", pumping: "Bombeo", distribution: "Distribución" },
      devices: { scada: "SCADA", historian: "Historizador" },
      description:
        "Esquema de una estación de bombeo: depósito, bomba y conducción a la red. Sobre él se superponen cuatro láminas. Física: captación, bombeo y distribución, con seis instrumentos unidos al punto que miden. Red OT: PLC, RTU, SCADA, historizador y ATLAXIA, que recibe sus datos. Funcional: el recorrido del agua, de la entrada al depósito, la bomba, el caudalímetro y la válvula hasta la red. Influencias: el plano se tumba y, sobre él, una segunda lámina con un nodo por instrumento y las relaciones entre ellos, más gruesas cuanto más fuertes.",
    },
    product: {
      eyebrow: "El producto hoy",
      title: "En un equipo en la planta",
      body: "Un gemelo digital del comportamiento de su planta. Se conecta a lo que ya tiene y no lo sustituye: trabaja junto a su SCADA, su historizador y sus herramientas de ciberseguridad. Sus datos no salen de la planta.",
      availableLabel: "Disponible hoy",
      available: [
        "Telemetría en tiempo real",
        "Nivel de anomalía de 0 a 5",
        "Alarmas según su gravedad",
        "Detección y localización de fallos",
        "Metodología de integración en planta",
        "Reentreno semanal con sus operadores",
      ],
      // TODO(owner): approve. Projection, kept apart from what is available today.
      nextLabel: "En desarrollo",
      next: [
        "Previsión de la evolución de la planta",
        "Toda la planta en un solo modelo de cuatro capas",
      ],
      demoCta: "Ver la demo",
    },
    // How ATLAXIA comes into a plant. The method has no name of its own; no dates or durations.
    // TODO(owner): approve.
    method: {
      eyebrow: "Integración",
      title: "Cómo llega ATLAXIA a una planta",
      body: "Primero se conecta a lo que ya tiene; después aprende de ello, con quienes operan la planta.",
      // The brief's answer to "how much time does it save?": no figures, a measurement.
      measure:
        "¿Cuánto tiempo ahorra en su planta? Lo medimos allí, con métricas pactadas antes de empezar.",
      loop: "Mejora cada semana",
      steps: {
        arrive: {
          label: "Llegamos a la planta",
          description:
            "Partimos de su inventario: procesos, señales, el papel de cada una como sensor o actuador, y su tipo.",
        },
        connect: {
          label: "Nos conectamos a su red OT",
          description: "Con los permisos que acuerda su responsable de OT.",
        },
        adapt: {
          label: "Ajustamos el modelo con los operadores",
          description:
            "Lo entrenamos con un tramo de funcionamiento normal y lo pulimos con ellos. De esta fase sale un histórico etiquetado de su planta, con el que medimos cuánto acierta.",
        },
        run: {
          label: "En marcha",
          description:
            "Cada semana, en una ventana programada, el modelo se reentrena con lo que le indican los operadores.",
        },
      },
    },
  },

  about: {
    eyebrow: "Quiénes somos",
    // Text-led section (Forgis pattern), approved on 2026-10-18: a statement, then four chapters;
    // each paragraph opens with the sentence that sums it up. Facts from docs/CONTENIDO.md only.
    title: "De la investigación a la planta",
    statement:
      "ATLAXIA es inteligencia industrial para infraestructuras críticas. Nace en la UCAM, de un equipo que se formó colaborando en proyectos de investigación, y de una tecnología que ya se probó en instalaciones reales de agua.",
    chaptersLabel: "Capítulos",
    chapters: {
      origin: {
        label: "Origen",
        title: "Un equipo que viene de la investigación",
        paragraphs: [
          {
            lead: "Nacimos en la universidad.",
            text: "El equipo de ATLAXIA se formó en la UCAM, colaborando en diversos proyectos de investigación. De esos proyectos sale la base técnica de la empresa.",
          },
          {
            lead: "Una spin-off de la UCAM.",
            text: "ATLAXIA es un proyecto basado en una spin-off de la universidad. La investigación es el punto de partida; la planta, el sitio donde tiene que funcionar.",
          },
        ],
        record: ["UCAM", "Spin-off universitaria"],
      },
      truedata: {
        label: "TRUEDATA",
        title: "Probado en el agua antes de ser empresa",
        paragraphs: [
          {
            lead: "La tecnología nace de TRUEDATA.",
            text: "Es un proyecto de la compra pública precomercial de INCIBE, la fórmula con la que la Administración contrata el desarrollo de soluciones que todavía no existen en el mercado.",
          },
          {
            lead: "Se probó en instalaciones reales de agua.",
            text: "Con sus datos y sus condiciones de operación. Es el paso que separa una idea prometedora de una tecnología que se puede instalar.",
          },
        ],
        record: ["INCIBE", "Compra pública precomercial", "Instalaciones reales de agua"],
      },
      company: {
        label: "ATLAXIA",
        title: "Del proyecto al producto",
        paragraphs: [
          {
            lead: "ATLAXIA es su fase de comercialización.",
            text: "Lo que funcionó en TRUEDATA se convierte en un producto: se instala en un equipo en cada planta, aprende de sus propios datos y trabaja junto a los sistemas que ya tiene. Los datos no salen de la planta.",
          },
          {
            lead: "Lo construimos con quien opera las plantas.",
            text: "Cada integración se ajusta con sus operadores. Buscamos plantas de agua con las que construirlo y probar el piloto.",
          },
        ],
        record: ["Fase actual", "Comercialización", "Piloto abierto a plantas de agua"],
      },
      team: {
        label: "Equipo",
        title: "Equipo fundador",
        paragraphs: [
          {
            lead: "Investigación, inteligencia artificial y producto.",
            text: "Tres perfiles que cubren el camino entero: de la idea al modelo y del modelo a la planta.",
          },
        ],
        record: [],
      },
    },
    teamLabel: "Equipo fundador",
    // Full names and academic profiles (confirmed on 2026-09-29, approved for the site on 2026-10-18).
    team: {
      ceo: {
        name: "Juan Miguel Navarro Ruiz",
        role: "CEO",
        profile: "Catedrático de Telecomunicación",
      },
      cto: {
        name: "David Palazón Palau",
        role: "CTO y desarrollo de IA",
        profile: "Doctorando en Telecomunicación",
      },
      cmo: {
        name: "Jorge Arcas Verdejo",
        role: "CMO y desarrollo full-stack",
        profile: "Estudiante de Ingeniería Informática",
      },
    },
  },

  contact: {
    title: "Hablemos",
    lead: "Tanto si operas una planta como si investigas, colaboras con la industria o quieres ver el producto en marcha.",
    primaryCta: "Solicitar demo",
    intentsLabel: "O escríbenos sobre",
    intents: {
      collaboration: "Colaboración",
      research: "Investigación o universidad",
      partnership: "Partnerships",
      investment: "Inversión",
      other: "Otra consulta",
    },
    emailLabel: "Correo",
  },

  // Temporary copy for the base scaffold. Removed as real sections land.
  scaffold: {
    pending: "Pendiente",
    sectionNote: "Sección pendiente de construir.",
  },

  footer: {
    legalNotice: "Aviso legal",
    privacy: "Privacidad",
    legalPending: "Datos legales pendientes de completar.",
    tagline: "Inteligencia industrial para infraestructuras críticas.",
  },

  notFound: {
    title: "Página no encontrada",
    body: "La dirección no existe o ha cambiado.",
    backHome: "Volver al inicio",
  },
};
