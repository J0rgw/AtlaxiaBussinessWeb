/*
  Wireframe surface for the contact background (Rig reference): a height field
  seen in perspective, drawn as rows and columns of lines. Computed once at
  render; deterministic, so server and client agree.
*/

export const meshSize = { width: 1440, height: 560 };

const ROWS = 18;
const COLUMNS = 36;
const SAMPLES = 44;
const HORIZON = 90;
const FOCAL = 520;
const CAMERA_HEIGHT = 1.4;

// Gentle interfering waves, like several signals superposed.
function heightAt(x: number, z: number) {
  return 0.2 * Math.sin(x * 0.9 + z * 0.55) + 0.12 * Math.sin(x * 0.37 - z * 0.8 + 1.3);
}

function project(x: number, z: number) {
  const scale = FOCAL / z;
  return {
    x: meshSize.width / 2 + x * scale,
    y: HORIZON + (CAMERA_HEIGHT - heightAt(x, z)) * scale * 1.12,
  };
}

const NEAR = 1.6;
const FAR = 9;
const HALF_WIDTH = 14;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function path(points: Array<{ x: number; y: number }>) {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${Math.round(p.x)} ${Math.round(p.y)}`)
    .join("");
}

/** Lines of the mesh: rows run across, columns run towards the horizon. */
export function meshPaths() {
  const rows: string[] = [];
  for (let r = 0; r < ROWS; r++) {
    const z = lerp(NEAR, FAR, r / (ROWS - 1));
    const points = Array.from({ length: SAMPLES }, (_, s) =>
      project(lerp(-HALF_WIDTH, HALF_WIDTH, s / (SAMPLES - 1)), z),
    );
    rows.push(path(points));
  }

  const columns: string[] = [];
  for (let c = 0; c < COLUMNS; c++) {
    const x = lerp(-HALF_WIDTH, HALF_WIDTH, c / (COLUMNS - 1));
    const points = Array.from({ length: ROWS }, (_, r) =>
      project(x, lerp(NEAR, FAR, r / (ROWS - 1))),
    );
    columns.push(path(points));
  }

  return { rows, columns };
}
