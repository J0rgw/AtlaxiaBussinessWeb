export type LayerId = "physical" | "network" | "functional" | "influence";

/** Bottom to top, as the model is built: from the plant to what the AI infers. */
export const layerOrder: LayerId[] = ["physical", "network", "functional", "influence"];
