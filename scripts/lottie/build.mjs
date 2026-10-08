import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildFoodScene, buildMetalScene, buildWaterScene } from "./scene-sectors.mjs";
import { buildWhereScene } from "./scene-where.mjs";

/*
  Builds the scroll-scene animations.
  - Site: public/animations/<name>.json (loaded by ScrubLottie).
  - Preview: the text-to-lottie player next to the repo
    (../../atlaxia-lottie/public/projects/atlaxia-vision/scene-N), if present.

  Usage (from v2/): node scripts/lottie/build.mjs
*/

const here = path.dirname(fileURLToPath(import.meta.url));
const v2 = path.resolve(here, "../..");
const player = path.resolve(v2, "../../atlaxia-lottie/public/projects/atlaxia-vision");

const scenes = [
  { file: "vision-where", scene: "scene-1", build: buildWhereScene },
  { file: "sector-water", scene: "scene-2", build: buildWaterScene },
  { file: "sector-food", scene: "scene-3", build: buildFoodScene },
  { file: "sector-metal", scene: "scene-4", build: buildMetalScene },
];

const controls = { controls: [{ sid: "bgColor", label: "Background color" }] };

for (const { file, scene, build } of scenes) {
  const json = JSON.stringify(build());
  const site = path.join(v2, "public/animations", `${file}.json`);
  mkdirSync(path.dirname(site), { recursive: true });
  writeFileSync(site, json);

  try {
    const dir = path.join(player, scene);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "lottie.json"), json);
    writeFileSync(path.join(dir, "controls.json"), JSON.stringify(controls, null, 2));
  } catch {
    // The preview player is optional.
  }

  console.log(`${file}: ${(json.length / 1024).toFixed(1)} KB`);
}
