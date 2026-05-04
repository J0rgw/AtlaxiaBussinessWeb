import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-cream-line bg-cream-inset">
      <div className="container-x py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Image src="/logo-mark.png" alt="" aria-hidden width={28} height={28} className="rounded-sm" />
          <div>
            <div className="font-display text-[16px] font-semibold text-cream-ink tracking-tighter2">AtlaXia</div>
            <div className="text-[11px] font-mono text-cream-mute2 tabular">TrueData &middot; ICS/SCADA · infraestructura hidráulica</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-mono uppercase tracking-tracked text-cream-mute">
          <span>UX sala de control ISA-101</span>
          <span>WebSocket 1 Hz</span>
          <span>On-prem · compatible airgap</span>
          <span className="text-cream-ink2">© {new Date().getFullYear()} TrueData</span>
        </div>
      </div>
    </footer>
  );
}
