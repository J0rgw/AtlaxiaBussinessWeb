import type { NavSectionId } from "../shared/sections";

/**
 * Spanish is the source language. Its shape defines the Dictionary type,
 * so every other locale must provide exactly the same keys.
 */
export const es = {
  meta: {
    title: "ATLAXIA",
    description:
      "ATLAXIA desarrolla software, inteligencia aplicada y herramientas de visualización para sistemas industriales complejos.",
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

  vision: {
    // Promise that opens the section, revealed word by word as the page scrolls.
    promise:
      "Construimos software para que quien opera una planta entienda qué ocurre y por qué, antes de que se convierta en un problema.",
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
        deviation: "Desviación",
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
        title: "Desviación en la bomba B-101",
        where: "Dónde",
        whereValue: "Bomba B-101, impulsión",
        related: "Señales relacionadas",
        why: "Por qué",
        what: "Qué hacer",
      },
    },
    // Scroll scenes for "Hacia dónde vamos" (A) and "Dónde empezamos" (B), shown in Storybook.
    scenes: {
      where: {
        title: "Hacia dónde vamos",
        stagesLabel: "Hoja de ruta",
        description:
          "Animación: la cámara se aleja de un sensor en una tubería. Aparece el proceso en el que trabajamos hoy, con sus señales relacionadas; después, la planta completa en trazo discontinuo y, al final, varias plantas conectadas en red.",
        stages: {
          today: { word: "Hoy", detail: "Procesos" },
          next: { word: "Siguiente", detail: "Plantas completas" },
          goal: {
            word: "Objetivo",
            detail:
              "Que cualquier sistema industrial pueda entenderse con la misma precisión con la que hoy se mide.",
          },
        },
      },
      sectors: {
        title: "Dónde empezamos",
        items: {
          water: {
            name: "Agua",
            description:
              "Animación: una red de agua se dibuja desde el depósito, el agua la recorre y los sensores de nivel, presión y caudal se relacionan.",
          },
          food: {
            name: "Agroalimentación",
            description:
              "Animación: un tanque por lotes se llena y se agita; al lado, el rango esperado de temperatura cambia en cada fase y la señal medida lo sigue.",
          },
          metal: {
            name: "Metalurgia",
            description:
              "Animación: una pieza sale del horno y se adelgaza al pasar por dos cajas de laminación; los sensores de temperatura, vibración y energía se relacionan.",
          },
        },
      },
    },
  },

  capabilities: {
    indexLabel: "Qué hacemos",
    reasons: {
      context: {
        label: "Datos sin contexto",
        title: "Una lectura aislada dice poco",
        body: "Una planta genera miles de lecturas cada día. Cada una, por separado, es solo un número: no dice si es normal ni qué la provoca.",
        chartDescription:
          "Ilustración: varias señales industriales a lo largo del tiempo, sin ningún contexto que ayude a interpretarlas.",
      },
      relations: {
        label: "Relaciones entre señales",
        title: "Cada señal depende de otras",
        body: "La presión, el caudal o la temperatura no cambian solos. Entender un sistema es entender cómo se influyen sus partes.",
        graphDescription:
          "Ilustración de una red de señales industriales. La presión ocupa el centro y se relaciona de forma directa con el caudal, la temperatura y el nivel; el resto de señales completa el sistema.",
        nodes: {
          pressure: "Presión",
          flow: "Caudal",
          temperature: "Temperatura",
          level: "Nivel",
          vibration: "Vibración",
          energy: "Energía",
          humidity: "Humedad",
          speed: "Velocidad",
        },
      },
      behavior: {
        label: "Comportamiento esperado",
        title: "Lo normal cambia con el proceso",
        body: "Lo que es normal en una fase del proceso no lo es en otra. Por eso importa saber qué se espera en cada momento, y no solo si se cruza un umbral fijo.",
        chartDescription:
          "Ilustración: una señal observada frente a su comportamiento esperado. Al final, la señal se sale del rango esperado.",
        legend: {
          observed: "Observado",
          expected: "Esperado",
          band: "Rango esperado",
          deviation: "Desviación",
        },
      },
      action: {
        label: "De entender a actuar",
        title: "Comprender para decidir",
        body: "Quien opera un sistema industrial complejo no necesita más datos: necesita entenderlos a tiempo. ATLAXIA nace para acortar esa distancia, de los datos a la comprensión y de la comprensión a la decisión.",
      },
    },
    flow: {
      label: "De los datos a la acción",
      steps: {
        data: { label: "Datos", description: "Lo que miden sensores, equipos y sistemas." },
        context: {
          label: "Contexto",
          description: "Dónde, cuándo y junto a qué se produce cada lectura.",
        },
        behavior: {
          label: "Comportamiento",
          description: "Qué es lo esperable en ese momento del proceso.",
        },
        understanding: { label: "Comprensión", description: "Qué ha cambiado y por qué importa." },
        action: { label: "Acción", description: "Decidir a tiempo y con criterio." },
      },
    },
  },

  building: {
    title: "Nuestro primer producto, capa a capa",
    lead: "La primera materialización de lo que sabemos hacer: software industrial, inteligencia aplicada y visualización trabajando juntos sobre los datos de una planta.",
    stackLabel: "Capas del producto",
    layers: {
      interface: {
        title: "Interfaz de operación",
        tagline: "Para quien opera el proceso.",
        description:
          "Histórico, eventos y la explicación de cada desviación, en una interfaz pensada para el trabajo diario en planta.",
        items: {
          panel: { label: "Panel", sub: "Operación" },
          events: { label: "Eventos", sub: "Histórico" },
          explanation: { label: "Explicación", sub: "Contexto" },
        },
      },
      detection: {
        title: "Observado frente a esperado",
        tagline: "La alerta es la divergencia, no un umbral.",
        description:
          "Cada lectura se compara con el valor que se esperaba en ese momento del proceso.",
        items: {
          observed: { label: "Observado", sub: "Lectura" },
          expected: { label: "Esperado", sub: "Modelo" },
          deviation: { label: "Desviación", sub: "Diferencia" },
        },
      },
      model: {
        title: "Relaciones entre señales",
        tagline: "Cada sensor se lee junto a sus vecinos.",
        description:
          "Un modelo de grafos aprende cómo se influyen las señales de la planta y qué comportamiento es normal en cada una.",
        items: {
          graph: { label: "Grafo", sub: "Relaciones" },
          behavior: { label: "Comportamiento", sub: "Aprendido" },
        },
      },
      plant: {
        title: "En la planta, junto al SCADA",
        tagline: "Sin escribir en el sistema de control.",
        description:
          "Se instala en la infraestructura de la planta y trabaja con los datos que ya existen. El SCADA sigue al mando.",
        items: {
          sensors: { label: "Sensores", sub: "Señales" },
          scada: { label: "SCADA", sub: "Control" },
          local: { label: "Equipo local", sub: "On-premise" },
        },
      },
    },
    product: {
      eyebrow: "Producto",
      namePending: "Nombre provisional",
      description: "Supervisión de procesos que recorre todas las capas.",
      capabilitiesLabel: "Qué permite",
      capabilities: {
        monitor: "Monitorizar",
        understand: "Entender",
        relate: "Relacionar",
        investigate: "Investigar",
        deploy: "Desplegar",
      },
      demoCta: "Ver la demo",
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
  },

  notFound: {
    title: "Página no encontrada",
    body: "La dirección no existe o ha cambiado.",
    backHome: "Volver al inicio",
  },
};
