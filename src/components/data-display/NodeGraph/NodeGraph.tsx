import { PauseOffscreen } from "@/components/primitives/PauseOffscreen";
import { cx } from "@/lib/cx";
import styles from "./NodeGraph.module.css";

export type GraphNode = {
  id: string;
  /** Position in the graph coordinate space (see `width` and `height`). */
  x: number;
  y: number;
  label: string;
  /**
   * "focus": the signal being read. "related": its direct relations.
   * "context": the rest of the system.
   */
  role?: "focus" | "related" | "context";
};

export type GraphEdge = {
  from: string;
  to: string;
  /** "strong" edges are the relations that matter for the focus; they are highlighted. */
  strength?: "strong" | "weak";
};

export type NodeGraphProps = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** Coordinate space of the node positions. The SVG scales to its container. */
  width: number;
  height: number;
  /** Text alternative: what the graph shows, in one or two sentences. */
  description: string;
  /** Signal flowing along strong edges and a pulse on the focus. Off with reduced motion. */
  animated?: boolean;
  className?: string;
};

const RADIUS = { focus: 15, related: 10, context: 6 } as const;

/**
 * Signals as nodes, relations as edges. Colors follow the diagram convention:
 * cobalt marks the model's view (focus and its relations), neutral lines the rest.
 */
export function NodeGraph({
  nodes,
  edges,
  width,
  height,
  description,
  animated = true,
  className,
}: NodeGraphProps) {
  const byId = new Map(nodes.map((node) => [node.id, node]));

  return (
    <PauseOffscreen className={cx(styles.frame, className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={description}
        className={cx(styles.graph, animated && styles.animated)}
      >
        <g>
          {edges.map((edge) => {
            const from = byId.get(edge.from);
            const to = byId.get(edge.to);
            if (!from || !to) return null;
            const strong = edge.strength === "strong";
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  className={strong ? styles.edgeStrong : styles.edgeWeak}
                />
                {strong ? (
                  <line x1={to.x} y1={to.y} x2={from.x} y2={from.y} className={styles.edgeFlow} />
                ) : null}
              </g>
            );
          })}
        </g>

        <g>
          {nodes.map((node) => {
            const role = node.role ?? "context";
            const r = RADIUS[role];
            return (
              <g key={node.id} className={styles[role]}>
                {role === "focus" ? (
                  <circle cx={node.x} cy={node.y} r={r} className={styles.pulse} />
                ) : null}
                <circle cx={node.x} cy={node.y} r={r} className={styles.node} />
                <text x={node.x} y={node.y + r + 16} textAnchor="middle" className={styles.label}>
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </PauseOffscreen>
  );
}
