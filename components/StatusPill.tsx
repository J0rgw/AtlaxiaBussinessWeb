type Status = "normal" | "advisory" | "warning" | "critical" | "emergency";

const tone: Record<Status, { dot: string; text: string; bg: string; ring: string }> = {
  normal: { dot: "bg-status-normal", text: "text-status-normal", bg: "bg-status-normal/10", ring: "ring-status-normal/30" },
  advisory: { dot: "bg-status-advisory", text: "text-status-advisory", bg: "bg-status-advisory/10", ring: "ring-status-advisory/30" },
  warning: { dot: "bg-status-warning", text: "text-status-warning", bg: "bg-status-warning/10", ring: "ring-status-warning/30" },
  critical: { dot: "bg-status-critical", text: "text-status-critical", bg: "bg-status-critical/10", ring: "ring-status-critical/30" },
  emergency: { dot: "bg-status-emergency", text: "text-status-emergency", bg: "bg-status-emergency/15", ring: "ring-status-emergency/40" },
};

export function StatusPill({ status, label }: { status: Status; label: string }) {
  const t = tone[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono uppercase tracking-wide ring-1 ${t.bg} ${t.text} ${t.ring}`}
    >
      <span className={`size-1.5 rounded-full ${t.dot}`} aria-hidden />
      {label}
    </span>
  );
}
