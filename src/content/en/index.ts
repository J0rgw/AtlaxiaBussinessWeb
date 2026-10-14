import type { Dictionary } from "../types";

/** English copy, edited by hand. Must mirror the Spanish shape exactly. */
export const en = {
  meta: {
    title: "ATLAXIA",
    description:
      "ATLAXIA builds software, applied intelligence and visualization tools for complex industrial systems.",
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

  vision: {
    // Promise that opens the section, revealed word by word as the page scrolls.
    promise:
      "We build software so the people who run a plant understand what is happening, and why, before it becomes a problem.",
    // Water case ("Where we start") and direction ("Where we are going"), storyboard v3.
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
        deviation: "Deviation",
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
        title: "Deviation in pump B-101",
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
        stagesLabel: "Roadmap",
        description:
          "Animation: the camera pulls back from a sensor on a pipe. The process we work on today appears, with its related signals; then the whole plant in dashed lines and, finally, several plants joined in a network.",
        stages: {
          today: { word: "Today", detail: "Processes" },
          next: { word: "Next", detail: "Whole plants" },
          goal: {
            word: "Goal",
            detail: "Any industrial system, understood as precisely as it is measured today.",
          },
        },
      },
      sectors: {
        title: "Where we start",
        items: {
          water: {
            name: "Water",
            description:
              "Animation: a water network draws out from the tank, water runs through it and the level, pressure and flow sensors relate to each other.",
          },
          food: {
            name: "Agrifood",
            description:
              "Animation: a batch tank fills and is stirred; next to it, the expected temperature range changes with each phase and the measured signal follows it.",
          },
          metal: {
            name: "Metallurgy",
            description:
              "Animation: a slab leaves the furnace and gets thinner through two roll stands; the temperature, vibration and energy sensors relate to each other.",
          },
        },
      },
    },
  },

  capabilities: {
    indexLabel: "What we do",
    reasons: {
      context: {
        label: "Data without context",
        title: "A single reading says little",
        body: "A plant produces thousands of readings every day. On its own, each one is just a number: it does not tell you whether it is normal or what caused it.",
        chartDescription:
          "Illustration: several industrial signals over time, with no context to help interpret them.",
      },
      relations: {
        label: "How signals relate",
        title: "Every signal depends on others",
        body: "Pressure, flow or temperature do not change on their own. Understanding a system means understanding how its parts influence each other.",
        graphDescription:
          "Illustration of a network of industrial signals. Pressure sits at the center and relates directly to flow, temperature and level; the other signals complete the system.",
        nodes: {
          pressure: "Pressure",
          flow: "Flow",
          temperature: "Temperature",
          level: "Level",
          vibration: "Vibration",
          energy: "Energy",
          humidity: "Humidity",
          speed: "Speed",
        },
      },
      behavior: {
        label: "Expected behavior",
        title: "Normal changes with the process",
        body: "What is normal in one phase of the process is not normal in another. That is why it matters to know what to expect at each moment, not only whether a fixed threshold is crossed.",
        chartDescription:
          "Illustration: an observed signal against its expected behavior. At the end, the signal leaves the expected range.",
        legend: {
          observed: "Observed",
          expected: "Expected",
          band: "Expected range",
          deviation: "Deviation",
        },
      },
      action: {
        label: "From understanding to action",
        title: "Understand in order to decide",
        body: "People who run complex industrial systems do not need more data: they need to understand it in time. ATLAXIA exists to close that gap, from data to understanding and from understanding to decisions.",
      },
    },
    flow: {
      label: "From data to action",
      steps: {
        data: { label: "Data", description: "What sensors, equipment and systems measure." },
        context: {
          label: "Context",
          description: "Where, when and alongside what each reading happens.",
        },
        behavior: {
          label: "Behavior",
          description: "What is expected at that moment of the process.",
        },
        understanding: {
          label: "Understanding",
          description: "What has changed, and why it matters.",
        },
        action: { label: "Action", description: "Deciding in time, with judgment." },
      },
    },
  },

  building: {
    title: "Our first product, layer by layer",
    lead: "The first materialization of what we know how to build: industrial software, applied intelligence and visualization working together on a plant's data.",
    stackLabel: "Product layers",
    layers: {
      interface: {
        title: "Operator interface",
        tagline: "For the people who run the process.",
        description:
          "History, events and an explanation for every deviation, in an interface built for daily work at the plant.",
        items: {
          panel: { label: "Panel", sub: "Operation" },
          events: { label: "Events", sub: "History" },
          explanation: { label: "Explanation", sub: "Context" },
        },
      },
      detection: {
        title: "Observed versus expected",
        tagline: "The alert is the divergence, not a threshold.",
        description:
          "Each reading is compared with the value expected at that moment of the process.",
        items: {
          observed: { label: "Observed", sub: "Reading" },
          expected: { label: "Expected", sub: "Model" },
          deviation: { label: "Deviation", sub: "Difference" },
        },
      },
      model: {
        title: "How signals relate",
        tagline: "Every sensor is read together with its neighbors.",
        description:
          "A graph model learns how the plant's signals influence each other and what normal behavior looks like for each one.",
        items: {
          graph: { label: "Graph", sub: "Relations" },
          behavior: { label: "Behavior", sub: "Learned" },
        },
      },
      plant: {
        title: "At the plant, alongside the SCADA",
        tagline: "Without writing to the control system.",
        description:
          "It runs on the plant's own infrastructure and works with the data that already exists. The SCADA stays in charge.",
        items: {
          sensors: { label: "Sensors", sub: "Signals" },
          scada: { label: "SCADA", sub: "Control" },
          local: { label: "Local unit", sub: "On-premise" },
        },
      },
    },
    product: {
      eyebrow: "Product",
      namePending: "Working name",
      description: "Process monitoring across every layer.",
      capabilitiesLabel: "What it does",
      capabilities: {
        monitor: "Monitor",
        understand: "Understand",
        relate: "Relate",
        investigate: "Investigate",
        deploy: "Deploy",
      },
      demoCta: "See the demo",
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
  },

  notFound: {
    title: "Page not found",
    body: "This address does not exist or has moved.",
    backHome: "Back to home",
  },
} satisfies Dictionary;
