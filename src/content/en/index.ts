import type { Dictionary } from "../types";

/** English copy, edited by hand. Must mirror the Spanish shape exactly. */
export const en = {
  meta: {
    title: "ATLAXIA | Industrial intelligence for critical infrastructure",
    description:
      "Industrial intelligence for critical water infrastructure. It detects and diagnoses anomalies in less time, and the data stays at the plant.",
  },

  a11y: {
    skipToContent: "Skip to content",
    languageSwitcher: "Language",
    homeLink: "ATLAXIA, go to home",
  },

  nav: {
    vision: "Vision",
    capabilities: "What we do",
    building: "What we are building",
    about: "Who we are",
    contact: "Contact",
  },

  navigation: {
    label: "Main navigation",
  },

  hero: {
    title: {
      lines: ["Technology to", "understand complex", "industrial systems"],
    },
    lead: "Software to see what is happening in a plant, understand why and decide in time.",
    primaryCta: "Talk to the team",
    secondaryCta: "See what we build",
  },

  // TODO(owner): approve the English headline and lede.
  edge: {
    lines: ["All the software", "runs on a unit", "installed at the plant."],
    split: 2,
    lede: "The data does not leave the plant. Each plant has its own model, trained on its own data, and it does not depend on the cloud to run.",
    alt: "ATLAXIA unit: a black mini PC with a finned heat sink and the ATLAXIA symbol on the lid.",
  },

  vision: {
    evidence: {
      title: "Why water, why now",
      sourceLabel: "Source",
      items: {
        perte: {
          figure: "60%",
          statement:
            "of Spain's population is already within the scope of the plan that digitizes the water cycle (PERTE).",
          source: "iAgua, 13 May 2026",
          href: "https://www.iagua.es/noticias/redaccion-iagua/perte-digitaliza-agua-6-cada-10-espanoles",
        },
        nis2: {
          figure: "NIS2",
          statement:
            "The European directive classes drinking water and waste water as sectors of high criticality.",
          source: "Directive (EU) 2022/2555, Annex I",
          href: "https://eur-lex.europa.eu/eli/dir/2022/2555/oj",
        },
        isac: {
          figure: "ES-ISAC Aguas",
          statement: "The water sector already shares cybersecurity information with INCIBE.",
          source: "INCIBE, 11 Jun 2026",
          href: "https://www.incibe.es/empresas/blog/quinta-comision-de-seguimiento-del-es-isac-aguas",
        },
      },
    },
    waterCase: {
      title: "Where we start",
      place: "Water pumping station",
      illustration: "Illustration",
      steps: {
        scada: "This is how the SCADA sees it: every signal against a fixed threshold. No alarms.",
        drift: "Discharge pressure starts to fall. Still within the threshold: no alarm.",
        expected:
          "ATLAXIA compares it with what is expected at each moment. It is already outside.",
        related:
          "It is not alone: flow, energy per m³ and pump vibration change together. The tank level does not.",
        decision:
          "Before any alarm goes off, the team knows where to look and schedules a pump inspection.",
      },
      signals: {
        level: "Tank level",
        pressure: "Discharge pressure",
        flow: "Flow",
        vibration: "Pump vibration",
        energy: "Energy per m³",
      },
      status: {
        normal: "Normal",
        deviation: "Anomaly",
        stable: "Stable",
        up: "Rising",
        down: "Falling",
      },
      chart: {
        measured: "Measured",
        expected: "Expected",
        threshold: "SCADA threshold",
        detection: "Outside what is expected",
        projection: "The alarm would go off here",
        review: "Inspection scheduled",
        time: "Time",
      },
      equipment: {
        tank: "Tank",
        pump: "Pump B-101",
        network: "To the network",
      },
      scadaTitle: "SCADA view",
      relatedTitle: "Related signals",
    },
    direction: {
      title: "Where we are going",
      statement: "Every alert should come with its why and with what can be done.",
      invitation: "We are looking for water plants to build it with and to test the pilot.",
      cta: "Join the pilot",
      card: {
        title: "Anomaly in pump B-101",
        where: "Where",
        whereValue: "Pump B-101, discharge",
        related: "Related signals",
        why: "Why",
        what: "What to do",
      },
    },
    // Scroll scenes for "Where we are going" (A) and "Where we start" (B), shown in Storybook.
    scenes: {
      where: {
        title: "Where we are going",
        stagesLabel: "From signal to infrastructure",
        description:
          "Animation: the camera pulls back from a sensor on a pipe. The process appears with its related signals; then the whole plant in dashed lines and, finally, several facilities of the water cycle.",
        stages: {
          today: { word: "Today", detail: "Processes and signals of one plant" },
          next: { word: "In progress", detail: "The whole plant, in four layers" },
          goal: {
            word: "Direction",
            detail:
              "Whole water infrastructure, from intake to wastewater treatment: treatment plants, networks and wastewater plants.",
          },
        },
      },
      sectors: {
        title: "We start with water",
        items: {
          water: {
            name: "Water",
            note: "Where we start",
            description:
              "Animation: a water network is drawn from the tank, water runs through it and the level, pressure and flow sensors relate to each other.",
          },
          food: {
            name: "Agrifood",
            note: "Possible expansion",
            description:
              "Animation of a possible expansion sector: a batch tank fills and is stirred; next to it, the expected temperature range changes with each phase and the measured signal follows it.",
          },
          metal: {
            name: "Metallurgy",
            note: "Possible expansion",
            description:
              "Animation of a possible expansion sector: a slab leaves the furnace and thins as it passes through two rolling stands; the temperature, vibration and energy sensors relate to each other.",
          },
        },
      },
    },
  },

  capabilities: {
    eyebrow: "What we do",
    title: "We check that the plant still works as a whole",
    intro: {
      emphasis: "as a whole",
      beats: [
        {
          text: "Five steps, from the first reading to the first diagnosis.",
          emphasis: "Five steps",
        },
      ],
    },
    stepsLabel: "What ATLAXIA does, step by step",
    steps: {
      observe: {
        title: "Observes",
        body: "The state of the plant: sensor measurements and actuator states.",
        note: "It only reads: it never touches the control system.",
      },
      system: {
        title: "Sees a system",
        body: "Signals do not change on their own. When the pump starts, the outflow rises and the tank level drops. A signal makes sense next to the others.",
      },
      normal: {
        title: "Learns what is normal",
        body: "It learns how the signals move together from normal operating data of the plant itself, with no examples of faults. At every moment it checks whether what it sees fits what is expected.",
      },
      mismatch: {
        title: "Detects the mismatch",
        body: "The pump and the flow keep their rhythm, but the level no longer drops as it should. Everything is still within limits and looks normal at a glance. ATLAXIA flags it as an anomaly; a fixed threshold would wait for the level to cross it.",
      },
      where: {
        title: "Points to where",
        body: "A first diagnosis when something moves away from normal: which signal and which process, with an anomaly level from 0 to 5 per sensor, per process and for the plant. It also alerts when a signal crosses the operator's limits.",
        note: "The decision is still yours.",
      },
    },
    chart: {
      label: "Illustration",
      description:
        "Illustration: the level of a tank over one day, with the pump state and the outflow below it. Each time the pump starts, the outflow rises and the level drops. The model estimates the expected level and its range. Late in the day the pump and the outflow carry on as usual, but the level stops dropping: it moves away from what is expected without reaching the operator limit. ATLAXIA flags it as an anomaly and points to the tank level, in the pumping process.",
      signals: {
        level: "tank level",
        pump: "pump, on / off",
        outflow: "outflow",
      },
      notes: {
        coherence: "the pump starts, the flow rises and the level drops",
        coherenceShort: "pump on: the level drops",
        limit: "operator limit",
        anomaly: "anomaly",
        usual: "pump and flow, as usual",
        here: "here",
      },
      levelsLabel: "Anomaly level, from 0 to 5",
      levels: { sensor: "level", process: "Pumping", plant: "Plant" },
    },
    inside: {
      label: "Under the hood",
      body: "A graph neural network treats each signal as a node and learns which signals influence each other. A model you can understand matters as much as one that gets it right: every alert is explained in terms of your plant's equipment, processes and signals.",
    },
  },

  // Four layers of the plant model, laid like tracing sheets over one plan (P&ID of a pumping station).
  building: {
    eyebrow: "What we are building",
    title: "A model of the plant in four layers",
    // TODO(owner): approve.
    intro: {
      emphasis: "four layers",
      beats: [
        {
          text: "Technically, a multi-layer ontology: what is in the plant and how each part relates to the rest, written so that the model and people understand it the same way.",
          emphasis: "multi-layer ontology",
        },
        {
          text: "Three layers describe the plant; the model learns the fourth.",
          emphasis: "the model learns the fourth",
        },
      ],
    },
    sketch: "Sketch",
    layers: {
      physical: {
        name: "Physical",
        body: "What is in the plant: processes, equipment and tanks, and the signal from each sensor.",
      },
      network: {
        name: "OT network",
        body: "Where the data travels: controllers, SCADA and communications. The network can be listened to without interfering with it.",
      },
      functional: {
        name: "Functional",
        body: "How the process is chained: which stage feeds which, and the rules engineering knows.",
      },
      influence: {
        name: "Influences",
        body: "The one the model learns on top of the other three: which signal influences which, how strongly and with how much delay. A learned relation is a lead, not a proven cause.",
      },
    },
    plan: {
      title: "Pumping station",
      zones: { intake: "Intake", pumping: "Pumping", distribution: "Distribution" },
      devices: { scada: "SCADA", historian: "Historian" },
      description:
        "Sketch of a pumping station: tank, pump and the line to the network. Four sheets are laid over it. Physical: intake, pumping and distribution, with six instruments linked to the point they measure. OT network: PLCs, an RTU, the SCADA, the historian and ATLAXIA, which receives its data. Functional: the path of the water, from the inlet to the tank, the pump, the flowmeter and the valve, out to the network. Influences: the plan tilts back and, above it, a second sheet with one node per instrument and the relations between them, thicker the stronger they are.",
    },
    product: {
      eyebrow: "The product today",
      title: "On a machine at the plant",
      body: "A digital twin of how your plant behaves. It connects to what you already have and replaces none of it: it works alongside your SCADA, your historian and your cybersecurity tools. Your data does not leave the plant.",
      availableLabel: "Available today",
      available: [
        "Real-time telemetry",
        "Anomaly level from 0 to 5",
        "Alarms by severity",
        "Fault detection and localization",
        "Plant integration methodology",
        "Weekly retraining with your operators",
      ],
      nextLabel: "In development",
      next: ["Forecasting how the plant will evolve", "The whole plant in one four-layer model"],
      demoCta: "See the demo",
    },
    // TODO(owner): approve.
    method: {
      eyebrow: "Integration",
      title: "How ATLAXIA comes into a plant",
      body: "First it connects to what you already have; then it learns from it, with the people who run the plant.",
      measure:
        "How much time does it save at your plant? We measure it there, with metrics agreed before we start.",
      loop: "Improves every week",
      steps: {
        arrive: {
          label: "We come to the plant",
          description:
            "We start from its inventory: processes, signals, the role of each one as sensor or actuator, and its type.",
        },
        connect: {
          label: "We connect to its OT network",
          description: "With the permissions your OT manager agrees to.",
        },
        adapt: {
          label: "We tune the model with the operators",
          description:
            "We train it on a stretch of normal operation and refine it with them. This stage leaves a labelled history of your plant, which we use to measure how often the model is right.",
        },
        run: {
          label: "Up and running",
          description:
            "Every week, in a scheduled window, the model is retrained with what the operators tell it.",
        },
      },
    },
  },

  about: {
    title: "Who we are",
    origin: {
      title: "From research to the plant",
      body: "ATLAXIA is an industrial intelligence project for critical infrastructure, built on a UCAM spin-off. Its technology comes from TRUEDATA, a project in INCIBE's pre-commercial public procurement program that was tested in real water facilities. ATLAXIA is its commercialization stage.",
    },
    teamLabel: "Founding team",
    team: {
      ceo: { name: "Juanmi", role: "CEO" },
      cto: { name: "David", role: "CTO" },
      cmo: { name: "Jorge", role: "CMO" },
    },
  },

  contact: {
    title: "Let's talk",
    lead: "Whether you run a plant, do research, work with industry or want to see the product running.",
    primaryCta: "Request a demo",
    intentsLabel: "Or write to us about",
    intents: {
      collaboration: "Collaboration",
      research: "Research or university",
      partnership: "Partnerships",
      investment: "Investment",
      other: "Other enquiry",
    },
    emailLabel: "Email",
  },

  scaffold: {
    pending: "Pending",
    sectionNote: "Section still to be built.",
  },

  footer: {
    legalNotice: "Legal notice",
    privacy: "Privacy",
    legalPending: "Legal details still to be completed.",
    tagline: "Industrial intelligence for critical infrastructure.",
  },

  notFound: {
    title: "Page not found",
    body: "This address does not exist or has moved.",
    backHome: "Back to home",
  },
} satisfies Dictionary;
