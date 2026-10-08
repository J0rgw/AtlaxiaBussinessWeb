const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

/** Prefixes an absolute app path with the deploy basePath (GitHub Pages subpaths). */
export function withBasePath(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${basePath}${path}`;
}
