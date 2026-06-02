interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  accent?: string;
  action?: React.ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  accent,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        {subtitle && (
          <p className="text-xs font-heading font-semibold text-[#bb86fc] uppercase tracking-[0.2em] mb-1">
            {subtitle}
          </p>
        )}
        <h2 className="font-display text-4xl text-[#f2eef8] tracking-wide leading-none">
          {title}
          {accent && <span className="text-[#bb86fc]"> {accent}</span>}
        </h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
