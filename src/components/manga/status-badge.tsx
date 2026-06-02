import { MangaStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  MangaStatus,
  { label: string; color: string; dot: string }
> = {
  ongoing: {
    label: "Ongoing",
    color: "bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/25",
    dot: "bg-[#4ade80]",
  },
  completed: {
    label: "Completed",
    color: "bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/25",
    dot: "bg-[#38bdf8]",
  },
  hiatus: {
    label: "Hiatus",
    color: "bg-[#fbbf24]/15 text-[#fbbf24] border-[#fbbf24]/25",
    dot: "bg-[#fbbf24]",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-[#f87171]/15 text-[#f87171] border-[#f87171]/25",
    dot: "bg-[#f87171]",
  },
};

interface StatusBadgeProps {
  status: MangaStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 border rounded-full font-heading font-semibold uppercase tracking-wide ${config.color} ${size === "sm" ? "text-[9px] px-1.5 py-0.5" : "text-xs px-2 py-1"}`}
    >
      <span className={`w-1 h-1 rounded-full ${config.dot} shrink-0`} />
      {config.label}
    </span>
  );
}
